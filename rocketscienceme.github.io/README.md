# rocketscienceme.github.io

Static website for **Rocket Science Made Easy** and the sales page for **METAR & TAF Made Easy**.
Plain HTML + CSS + a few lines of vanilla JS. No build step, no cookies, no analytics, no third-party requests.

| Page | URL |
|---|---|
| Brand hub | https://rocketscienceme.github.io/ |
| **Sales page** | https://rocketscienceme.github.io/metar/ |
| Privacy | https://rocketscienceme.github.io/privacy/ |
| Terms, refunds, disclaimer | https://rocketscienceme.github.io/terms/ |

---

## 1. Values to fill in (all in one place)

Every value below appears in the HTML as `{{NAME}}`. Use your editor's **Find and Replace in Files** (VS Code: `Ctrl+Shift+H`) to replace each one across the whole folder. Never invent a value: if something is not true yet, leave it out.

| Placeholder | What to put | Used in |
|---|---|---|
| `{{WHOP_CHECKOUT_URL}}` | Full Whop checkout link, e.g. `https://whop.com/checkout/...` | every "Get the guide" button |
| `{{PRICE_DISPLAY}}` | Price as shown to people, e.g. `€12` | buttons, sticky bar |
| `{{PRICE}}` | Number only, dot as decimal, e.g. `12.00` | JSON-LD (Google) |
| `{{CURRENCY}}` | ISO code, e.g. `EUR` or `USD` | JSON-LD (Google) |
| `{{REFUND_DAYS}}` | Number of days, must match Whop, e.g. `14` | hero + final CTA microcopy |
| `{{REFUND_POLICY_TEXT}}` | One or two sentences, must match Whop's refund setting (suggestion below) | guarantee block, FAQ, terms |
| `{{AUTHOR_FULL_NAME}}` | Your full name | privacy |
| `{{AUTHOR_BIO}}` | 2–3 honest sentences, no credentials (suggestion below) | sales page "Who made this" |
| `{{CONTACT_EMAIL}}` | Contact email address | footer, privacy, terms |
| `{{PROVIDER_IDENTIFICATION}}` | Seller identification: name, country, and tax ID / business details **only where required** | footer, terms |
| `{{GOVERNING_LAW}}` | e.g. "These terms are governed by Portuguese law. If you are a consumer, you also keep the protection of the mandatory law of your country of residence." Check with a professional. | terms |
| `{{INSTAGRAM_URL}}` | Instagram profile URL | hub, footer, JSON-LD |
| `{{TIKTOK_URL}}` | TikTok profile URL | hub, footer, JSON-LD |
| `{{BLOG_URL}}` | Blog home URL | header nav, hub, footer, JSON-LD |
| `{{BLOG_POST_URL_1}}` | URL of "How to Read a METAR in 5 Minutes" | sales page author block |
| `{{BLOG_POST_URL_2}}` … `{{BLOG_POST_URL_4}}` | URLs of the other three blog posts | sales page author block |
| `{{BLOG_POST_TITLE_2}}` … `{{BLOG_POST_TITLE_4}}` | Titles of those three posts (used as link text, good for SEO) | sales page author block |
| `{{DELIVERY_DETAILS}}` | Optional extra sentence about delivery, e.g. "You also receive an email from Whop with the download link." Delete the placeholder if not needed. | FAQ (and FAQ JSON-LD) |
| `{{UPDATE_POLICY}}` | Honest answer, e.g. "Edition 1 is complete. If I publish corrections, buyers get the updated files at no extra cost through Whop." Only promise what you will do. | FAQ (and JSON-LD), terms |
| `{{LAST_UPDATED}}` | Date for privacy and terms, e.g. `11 November 2026` | privacy, terms |
| `{{TESTIMONIALS}}` | Not rendered. See section 5. | sales page (HTML comment) |

Placeholders also appear inside the JSON-LD block in `metar/index.html` (price, currency, FAQ answers, social links): the find-and-replace covers them. Keep the quotes around the values.

After replacing, search for `{{` once more: there should be **no results**.

### Suggested texts (edit them, keep them true)

**`{{AUTHOR_BIO}}`**: "Hi, I'm {{AUTHOR_FULL_NAME}}. I'm Brazilian, I live in Portugal and I'm an aviation enthusiast. I run an aviation page on TikTok and the blog Rocket Science Made Easy, where I explain aviation and space in plain language. I wrote this guide because METARs and TAFs are one of the first things that make beginners give up, and they do not have to be hard. I am not a pilot or an instructor, and this guide is a study aid."
(Only keep the last sentence if it is true. Do not claim licences, airline experience or credentials.)

**`{{REFUND_POLICY_TEXT}}`** (once the Whop refund is configured): "If the guide is not what you expected, ask for a refund within {{REFUND_DAYS}} days and you will get your money back through Whop."

If you do **not** offer refunds, also remove the "{{REFUND_DAYS}}-day refund" microcopy (2 places), rename the "A simple refund promise" heading, and update the FAQ and terms. Note that EU consumer law has specific rules for digital content; check with a professional.

---

## 2. Deploy on GitHub Pages

1. Create the repository **`rocketscienceme.github.io`** under the **RocketScienceME** organization (public).
2. Upload the **contents of this folder** to the repository root (so `index.html`, `metar/`, `assets/` … are at the top level). Include the hidden file `.nojekyll`.
   - Web: *Add file → Upload files*, drag everything in, commit.
   - Or with git: `git init`, `git add .`, `git commit -m "Site"`, `git branch -M main`, `git remote add origin https://github.com/RocketScienceME/rocketscienceme.github.io.git`, `git push -u origin main`.
3. Repository *Settings → Pages*: Source = **Deploy from a branch**, Branch = **main**, folder = **/ (root)**. Tick **Enforce HTTPS**.
4. After 1–2 minutes the site is live at https://rocketscienceme.github.io/ and the sales page at https://rocketscienceme.github.io/metar/.
5. Optional: add the site in **Google Search Console** (URL-prefix property `https://rocketscienceme.github.io/`, verify with the HTML-file method by uploading Google's file to the repo root) and submit `https://rocketscienceme.github.io/sitemap.xml`.

**Do not deploy with placeholders still in it.** At least the checkout URL, price, refund text, contact email and provider identification must be filled in before you share the link.

---

## 3. Files

```
index.html            brand hub (blog, product, Instagram, TikTok)
metar/index.html      THE SALES PAGE
privacy/index.html    privacy policy
terms/index.html      terms, refund policy, disclaimer, provider identification
404.html              not-found page (noindex)
assets/css/style.css  the only stylesheet (minified)
assets/fonts/         Inter variable font, latin subset (SIL Open Font License, see LICENSE-Inter-OFL.txt)
assets/img/           favicon.svg, apple-touch-icon.png, og-image.png (1200x630, social preview)
assets/img/preview/   real pages from the PDFs, webp, 450 and 900 px wide
favicon.png, sitemap.xml, robots.txt, .nojekyll
```

Small text edits: open the HTML file in any editor, change the text, upload again. That's it.

The readable (unminified) CSS and the helper scripts that made the images, the OG image and the checks are kept **outside** this repository (in `../build/`), so they are not published. They need Node.js only if you want to regenerate assets; editing the HTML never needs them.

### Updating dates

- `sitemap.xml`: change `<lastmod>` when a page changes meaningfully.
- Privacy and terms: change `{{LAST_UPDATED}}` / the date whenever you edit them.

---

## 4. Important notes

- **Privacy policy:** it describes exactly what the site does today (no cookies, no analytics, no forms, no embeds, no third-party requests). **If you ever add analytics, a newsletter form, an embed (YouTube, TikTok, Instagram), Google Fonts or any external script, the privacy policy must be updated first**, and you may then need a cookie/consent banner.
- **Legal texts:** the privacy policy and terms are a plain-language starting point, **not legal advice**. Have them reviewed by an accountant or lawyer (especially provider identification, VAT/tax status, refunds and governing law) before relying on them. The refund text must match what is configured in Whop.
- **Honesty rules used on the page:** no testimonials, ratings, sales counts, "as seen on" logos, countdowns or scarcity. A "launch price" may only be added if it is real and has a real end condition. Never write "100% correct", "error-free" or "guaranteed accurate".
- **Numbers on the page** (must stay in sync with the PDF): 27-page guide, 2-page cheat card, 12 chapters, 21 practice reports (9 ICAO METARs + 6 US/Canadian METARs + 6 TAFs), 75 glossary codes, 14 common mistakes, 8-question briefing checklist, 7-step TAF method, 17-row ICAO vs US table. If a new edition changes these, update the page, the meta description, the JSON-LD and the OG image text.

---

## 5. Adding real testimonials later

In `metar/index.html` there is an HTML comment marked `13. TESTIMONIALS`, just before the final CTA. When you have **real** reviews (with permission to publish them):

1. Replace that comment with a section, for example:
   ```html
   <section aria-labelledby="reviews-title">
     <div class="wrap narrow">
       <h2 id="reviews-title">What readers say</h2>
       <blockquote><p>"Exact words of the review."</p><footer>First name, context (e.g. student pilot, Spain)</footer></blockquote>
     </div>
   </section>
   ```
2. Only quote what people actually wrote. Do not edit their meaning.
3. Do **not** add `aggregateRating` or `review` to the JSON-LD unless they are real, verifiable reviews shown on the page.
