# Orffian — website

Marketing site for **Orffian**, an AI music-therapy solution (hardware + software) for
children with developmental disabilities. The content is derived from the pitch deck in
`slides/Orffian.pdf`.

Static HTML/CSS/JS. No build step, no dependencies, no framework.

## Structure

```
index.html                 the whole page
assets/css/styles.css      all styling
assets/js/main.js          language toggle, keyboard demo, ensemble playhead, count-up
assets/img/                wordmark variants, device photo, favicon, OG image
.nojekyll                  tells GitHub Pages to serve files as-is
```

## Local preview

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Open the file directly (`file://`) and it mostly works, but use the server so paths and
the language `?lang=` parameter behave the same as in production.

## Deploying to GitHub Pages

1. Create a repository on GitHub and push this directory to it:

   ```sh
   git remote add origin git@github.com:<org-or-user>/<repo>.git
   git push -u origin main
   ```

2. In the repo, go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**.
4. Set branch to `main` and folder to `/ (root)`. Save.

The site publishes at `https://<org-or-user>.github.io/<repo>/` within a minute or two.
Because every asset path is relative, it works from a subpath without any change.

### Custom domain

Add a `CNAME` file at the repo root containing the bare domain (e.g. `orffian.com`),
point a DNS `CNAME` record at `<org-or-user>.github.io`, then enable **Enforce HTTPS**
in Settings → Pages.

## Editing the content

### Both languages live side by side

Every piece of copy appears twice, tagged with a `lang` attribute:

```html
<span lang="ko">발달장애 아동을 위한 음악치료 솔루션</span>
<span lang="en">A music therapy solution for children with developmental disabilities</span>
```

CSS hides whichever language isn't active, so editing a string means editing it in place —
there is no separate translation file to keep in sync. Adding new copy means adding both
variants. Text that is identical in both languages (names, product terms) takes no `lang`
attribute at all.

The chosen language is remembered in `localStorage` and can be forced with `?lang=ko`
or `?lang=en`. The initial default follows the browser's language.

### Colors

All brand values are CSS custom properties at the top of `styles.css`, sampled directly
from the deck — the purple and orange gradients, the gold, and the twelve note colors
(`--n-c` through `--n-b`) used by the keyboard and the ensemble table.

### The keyboard demo

`LEVELS` in `main.js` defines which notes each activation level turns on:

| Level | Notes | Why |
|---|---|---|
| 3 | C E G | major triad |
| 5 | C D E G A | major pentatonic — no wrong notes |
| 7 | C D E F G A B | full major scale |
| 12 | all | chromatic |

The demo is visual only; it plays no audio.

## Notes

- `slides/` is git-ignored: the PDF is ~94 MB, close to GitHub's 100 MB hard limit, and
  would bloat the repository permanently. Keep it wherever the team stores the deck.
- The contact address `hello@orffian.com` in `index.html` and the footer is a
  **placeholder** — replace it with a real inbox before sharing the site.
