# build/ (not published)

Helper files for the site in `../rocketscienceme.github.io/`. You never need these to edit text or deploy.

- `style.css`: readable CSS source. After editing, run `node build/minify.mjs` to update `assets/css/style.css`.
- `images.mjs`: converts `../previews/*.png` to webp (450 and 900 px), copies the Inter font, and makes the icons.
- `og.html`: the template for `assets/img/og-image.png`, which `check.mjs` renders.
- `check.mjs`: renders the OG image, then checks for horizontal scroll at 360, 768 and 1280 px, same-origin requests, cookies and storage, the sticky bar, links and anchors, JSON-LD and contrast.
- `clips.mjs`: viewport screenshots of key sections. `lh.mjs`: Lighthouse (mobile). `audit.mjs`: checks numbers and forbidden claims, and lists the placeholders. `serve.mjs`: local server (`node build/serve.mjs`, then open http://localhost:8123/metar/).

Requirements: Node.js 20+, a local Google Chrome, and `npm i sharp @fontsource-variable/inter puppeteer-core lighthouse chrome-launcher html-validate` run in this folder.
