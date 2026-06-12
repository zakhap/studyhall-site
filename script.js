/* ============================================================
   study hall — hero particles + email capture
   No dependencies. Vanilla JS.
   ============================================================ */

/* -------------------- Hero flow field --------------------
   Fine monochrome ink-lines drift along a smooth pseudo-noise
   vector field over a faint graph-paper grid, and bend away
   from the cursor. Trails fade via a translucent overlay.
---------------------------------------------------------- */
(function heroFlowField() {
  const canvas = document.querySelector(".hero__canvas");
  const hero = document.querySelector(".hero");
  if (!canvas || !hero) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");

  const BG = "rgba(4, 4, 6, 1)";
  const FADE = "rgba(4, 4, 6, 0.05)"; // lower alpha = longer trails
  const GRID = 46;
  const SPEED = 0.7;
  const MOUSE_R = 140;
  const LINE = "120, 152, 176"; // cold steel-blue, alpha applied per particle

  let w, h, dpr, particles, raf;
  const mouse = { x: 0, y: 0, active: false };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);
    seed();
  }

  function spawn(p) {
    p.x = Math.random() * w;
    p.y = Math.random() * h;
    p.px = p.x;
    p.py = p.y;
    p.life = (Math.random() * 160 + 60) | 0;
    p.alpha = Math.random() * 0.26 + 0.08;
    return p;
  }

  function seed() {
    const count = Math.min(520, Math.round((w * h) / 4200));
    particles = Array.from({ length: count }, () => spawn({}));
  }

  // smooth, cheap noise-ish field (no libraries)
  function angleAt(x, y, t) {
    return (
      (Math.sin(x * 0.0016 + t) +
        Math.cos(y * 0.0021 - t * 0.8) +
        Math.sin((x + y) * 0.0009 + t * 0.5)) *
      1.35
    );
  }

  function drawGrid() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(120, 152, 176, 0.02)";
    ctx.beginPath();
    for (let x = 0; x <= w; x += GRID) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
    }
    for (let y = 0; y <= h; y += GRID) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
    }
    ctx.stroke();
  }

  function step(ts) {
    // fade previous frame toward background
    ctx.fillStyle = FADE;
    ctx.fillRect(0, 0, w, h);
    drawGrid();

    const t = ts * 0.00007;
    ctx.lineWidth = 1.1;

    for (const p of particles) {
      const a = angleAt(p.x, p.y, t);
      let vx = Math.cos(a) * SPEED;
      let vy = Math.sin(a) * SPEED;

      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_R * MOUSE_R) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / MOUSE_R) * 3.2;
          vx += (dx / d) * f;
          vy += (dy / d) * f;
        }
      }

      p.px = p.x;
      p.py = p.y;
      p.x += vx;
      p.y += vy;
      p.life--;

      if (p.x < 0 || p.x > w || p.y < 0 || p.y > h || p.life < 0) {
        spawn(p);
        continue;
      }

      ctx.strokeStyle = "rgba(" + LINE + ", " + p.alpha + ")";
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    raf = requestAnimationFrame(step);
  }

  function drawStatic() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);
    drawGrid();
    ctx.strokeStyle = "rgba(" + LINE + ", 0.2)";
    ctx.lineWidth = 1.1;
    for (const p of particles) {
      const a = angleAt(p.x, p.y, 0);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(a) * 14, p.y + Math.sin(a) * 14);
      ctx.stroke();
    }
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });

  hero.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
  });
  hero.addEventListener("pointerleave", () => (mouse.active = false));

  if (reduce) drawStatic();
  else raf = requestAnimationFrame(step);
})();

/* -------------------- Email capture -------------------- */
(function signup() {
  const form = document.querySelector(".signup");
  if (!form) return;

  const input = form.querySelector(".signup__input");
  const msg = form.querySelector(".signup__msg");
  const endpoint = form.dataset.endpoint; // set in HTML to go live

  const valid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.classList.remove("is-error");
    const email = input.value.trim();

    if (!valid(email)) {
      msg.textContent = "hmm, that email looks off.";
      msg.classList.add("is-error");
      input.focus();
      return;
    }

    // No backend wired yet: confirm locally so the UX is real.
    // To go live, set data-endpoint="https://..." on the <form>
    // (Buttondown, Formspree, Mailchimp, etc.) and this will POST to it.
    if (!endpoint) {
      msg.textContent = "you're on the list — see you monday. ✦";
      form.reset();
      console.info("[study hall] captured (no endpoint set):", email);
      return;
    }

    try {
      msg.textContent = "…";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(res.status);
      msg.textContent = "you're on the list — see you monday. ✦";
      form.reset();
    } catch (err) {
      msg.textContent = "something broke — try again?";
      msg.classList.add("is-error");
    }
  });
})();
