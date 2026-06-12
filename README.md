# study hall

Static site for **Study Hall** — a recurring Monday-night meetup in NYC. Hosted by Charlie Freiberg and Zak Hap. Layout is a rough homage to [raid.nyc](https://raid.nyc/).

## Run it

No build step. Open `index.html`, or serve locally:

```sh
python3 -m http.server 8000   # → http://localhost:8000
```

## Files

| File | What |
|------|------|
| `index.html` | Hero, event list (vol 8 → 2), photo collage, footer |
| `styles.css` | All styling. Tweak `:root` for colors/spacing |
| `script.js` | Animated hero particles + email capture |
| `img/` | Drop event photos here (create as needed) |

## Iterate

- **Email signup** — currently confirms in-browser only. To collect for real, set
  `data-endpoint="https://..."` on the `<form class="signup">` in `index.html`
  (Buttondown / Formspree / Mailchimp all work).
- **Photos** — replace the `.tile` placeholders in the gallery with
  `<img src="img/...">`. Use `data-span="wide"` / `"tall"` for collage rhythm.
- **Event dates** assume 2026 — correct in `index.html` if needed.
- **Speaker links** — add `<a href>` around `.people__name` as you find them
  (raid links each speaker to their site).
