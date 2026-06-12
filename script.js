/* ============================================================
   study hall — hero particles + email capture
   No dependencies. Vanilla JS.
   ============================================================ */

/* -------------------- Hero glitter particles -------------------- */
(function heroParticles() {
  const canvas = document.querySelector(".hero__canvas");
  if (!canvas) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  let w, h, dpr, particles, raf;

  const COLORS = ["#ffffff", "#cdbcff", "#ffd0e6", "#bfeaff", "#ffe9a8"];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const count = Math.round((w * h) / 14000); // density scales with area
    particles = Array.from({ length: Math.min(count, 160) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      tw: Math.random() * Math.PI * 2, // twinkle phase
      tws: Math.random() * 0.02 + 0.005,
      c: COLORS[(Math.random() * COLORS.length) | 0],
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.tw += p.tws;
      if (p.x < -5) p.x = w + 5;
      if (p.x > w + 5) p.x = -5;
      if (p.y < -5) p.y = h + 5;
      if (p.y > h + 5) p.y = -5;

      const alpha = 0.35 + Math.sin(p.tw) * 0.35;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });

  if (reduce) {
    // draw one static field, no animation
    frame();
    cancelAnimationFrame(raf);
  } else {
    frame();
  }
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
