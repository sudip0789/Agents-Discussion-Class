# Class 3 Workbook

The student website for Class 3. It has fourteen lessons, from AI foundations to building a legal research agent in VS Code, eight concept notes, a glossary, a page with every prompt in order, and a further-reading list.

It's a plain static site: HTML, one stylesheet, a little JavaScript. It has no framework and no build step.

## Before class: set the links

Open [assets/js/config.js](assets/js/config.js) and set these:

```js
pollUrl: "https://pollev.com/YOUR-POLLEV-HANDLE",          // your Poll Everywhere link
starterDownloadUrl: "", // leave empty to use the bundled assets/downloads/legal-research-agent.zip, or paste your own download link
```

Every QR code on the site is generated in the browser from `pollUrl`, so changing that one line updates every page. Until it's set, the site shows a dashed "QR code appears once…" placeholder.

## The starter folder download

Lesson 6 links to `assets/downloads/legal-research-agent.zip`, built from `legal-research-prototype/starter/`. If you change anything in `starter/`, rebuild the ZIP from this folder:

```bash
cd legal-research-prototype && rm -f ../assets/downloads/legal-research-agent.zip && \
  cp -R starter /tmp/legal-research-agent && (cd /tmp && zip -r -X - legal-research-agent -x '*.DS_Store') > ../assets/downloads/legal-research-agent.zip && \
  rm -rf /tmp/legal-research-agent
```

The ZIP is public once the site is deployed, so only include files you're allowed to share.

## Run it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy on Vercel

1. Push this folder to a GitHub repo, or run `npx vercel` inside it.
2. In Vercel, choose **Other** as the framework preset, with no build command and the output directory set to the project root.
3. `vercel.json` adds basic security headers. The site has no analytics and no tracking.

## Folder structure

```
index.html            Lesson 0: Welcome (home page)
lessons/              Lessons 1–13, one file each
notes/                Concept notes N1–N8
resources/            Glossary, project files, further reading
assets/css/styles.css The only stylesheet (light/dark, print)
assets/js/config.js   Poll URL, starter download link, course title
assets/js/nav.js      Page list: sidebar, Previous/Next, checkpoint progress
assets/js/app.js      Theme toggle, copy buttons, checkpoints, QR codes, menu
assets/js/vendor/     qrcode.js (MIT, Kazuhiko Arase), served locally
```

## Editing content

Each page is hand-written HTML. To add or rename a page, also update `assets/js/nav.js`.

Components are plain HTML classes:

| Component | Markup |
| --- | --- |
| Format badge | `<span class="badge">Hands-on</span>` |
| Poll break | `<div class="poll-break" data-poll="P13"></div>` |
| Large poll box | `<div class="poll-box"></div>` |
| Discussion | `<div class="discuss"><p class="discuss__title">Discuss</p><ol><li>…</li></ol></div>` |
| Copy block | `<div class="copy-block"><div class="copy-block__bar"><span class="copy-block__file">path</span></div><pre><code>…</code></pre></div>` |
| Callout | `<div class="callout callout--tip">` (also `--watch`, `--why`, `--try`) |
| Terms | `<div class="terms"><dl><div><dt>Term</dt><dd>Definition</dd></div></dl></div>` |
| Note link | `<a class="note-chip" href="…">Read more: <strong>N5 …</strong></a>` |
| Checkpoint | `<div class="checkpoint" data-checkpoint="lesson-07"><label><input type="checkbox">…</label></div>` |
| Go deeper | `<details class="deeper"><summary>Title</summary><div class="deeper__body">…</div></details>` |

Checkpoint ticks are saved in each student's own browser (localStorage). They never leave the device.

## Printing notes

Notes print cleanly to PDF (File → Print → Save as PDF). Printing hides the navigation, opens every "Go deeper" section, and prints each link's URL.
