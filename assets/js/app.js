/*
 * Class 3 Workbook — shared behaviour.
 * Builds the top bar, sidebar and pager; wires up the theme toggle, copy buttons,
 * checkpoints, poll boxes (QR codes), glossary filter and print handling.
 * No frameworks, no tracking. Browser storage is only used for the theme and checkpoints.
 */
(function () {
  "use strict";

  var cfg = window.C3_CONFIG || {};
  var pages = window.C3_PAGES || [];
  var body = document.body;
  var root = body.getAttribute("data-root") || "";
  var pageId = body.getAttribute("data-page") || "";
  var current = pages.filter(function (p) { return p.id === pageId; })[0];

  /* ---------- storage (never required for the page to work) ---------- */
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} },
    remove: function (k) { try { window.localStorage.removeItem(k); } catch (e) {} },
  };
  var CHECK_PREFIX = "c3-checkpoint:";
  var THEME_KEY = "c3-theme";

  function el(tag, attrs, html) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (html != null) node.innerHTML = html;
    return node;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function isPlaceholder(url) { return !url || /YOUR-/i.test(url); }
  function pollHost(url) { return String(url || "").replace(/^https?:\/\//, "").replace(/\/$/, ""); }

  var ICONS = {
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    poll: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg>',
    left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  };

  /* ---------- theme ---------- */
  var mql = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function effectiveTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return mql && mql.matches ? "dark" : "light";
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    store.set(THEME_KEY, t);
    syncThemeButton();
  }
  function syncThemeButton() {
    var btn = document.querySelector(".theme-btn");
    if (!btn) return;
    var dark = effectiveTheme() === "dark";
    btn.innerHTML = (dark ? ICONS.sun : ICONS.moon) + '<span class="sr-only">' + (dark ? "Switch to light mode" : "Switch to dark mode") + "</span>";
    btn.setAttribute("title", dark ? "Switch to light mode" : "Switch to dark mode");
  }

  /* ---------- top bar ---------- */
  function buildTopbar() {
    var bar = el("header", { class: "topbar" });
    var title = cfg.courseTitle || "Class 3 Workbook";
    bar.innerHTML =
      '<button class="icon-btn menu-btn" type="button" aria-controls="sidebar" aria-expanded="false">' + ICONS.menu + '<span class="sr-only">Open menu</span></button>' +
      '<a class="brand" href="' + root + 'index.html"><span class="brand__mark" aria-hidden="true">3</span><span class="brand__text">' + esc(title) + "</span></a>" +
      '<div class="topbar__actions">' +
      '<a class="poll-btn" href="' + esc(cfg.pollUrl || "#") + '" target="_blank" rel="noopener">' + ICONS.poll + "<span>Join the poll" + (isPlaceholder(cfg.pollUrl) ? "" : '<span class="poll-btn__host"> at ' + esc(pollHost(cfg.pollUrl)) + "</span>") + "</span></a>" +
      '<button class="icon-btn theme-btn" type="button"></button>' +
      "</div>";
    body.insertBefore(bar, document.querySelector(".layout") || body.firstChild);
    syncThemeButton();
    bar.querySelector(".theme-btn").addEventListener("click", function () {
      applyTheme(effectiveTheme() === "dark" ? "light" : "dark");
    });
    if (mql && mql.addEventListener) mql.addEventListener("change", syncThemeButton);
  }

  /* ---------- sidebar ---------- */
  function isDone(id) { return store.get(CHECK_PREFIX + id) === "1"; }

  function navItem(p) {
    var cls = "nav__link" + (p.id === pageId ? " is-current" : "");
    var aria = p.id === pageId ? ' aria-current="page"' : "";
    var num = p.num != null ? '<span class="nav__num">' + esc(p.num) + "</span>" : "";
    var tick = p.checkpoint
      ? '<span class="nav__tick' + (isDone(p.id) ? " is-done" : "") + '" data-tick="' + p.id + '" title="Checkpoint">' + ICONS.check + '<span class="sr-only">' + (isDone(p.id) ? "Checkpoint done" : "Checkpoint not done") + "</span></span>"
      : "";
    return '<li><a class="' + cls + '" href="' + root + p.path + '"' + aria + ">" + num + '<span class="nav__title">' + esc(p.title) + "</span>" + tick + "</a></li>";
  }
  function list(items) { return '<ul class="nav__list">' + items.map(navItem).join("") + "</ul>"; }

  function buildSidebar() {
    var side = document.getElementById("sidebar");
    if (!side) return;
    var lessons = pages.filter(function (p) { return p.group === "lessons"; });
    var notes = pages.filter(function (p) { return p.group === "notes"; });
    var res = pages.filter(function (p) { return p.group === "resources"; });
    var total = lessons.filter(function (p) { return p.checkpoint; }).length;
    side.innerHTML =
      '<div class="nav__inner">' +
      '<p class="nav__group">Lessons</p>' +
      '<p class="nav__sub">Part 1: Foundations</p>' + list(lessons.filter(function (p) { return p.part === 1; })) +
      '<p class="nav__sub">Part 2: Build</p>' + list(lessons.filter(function (p) { return p.part === 2; })) +
      '<p class="nav__progress" aria-live="polite"><span class="nav__bar"><span></span></span><span class="nav__count"></span></p>' +
      '<p class="nav__group">Notes</p>' + list(notes) +
      '<p class="nav__group">Resources</p>' + list(res) +
      "</div>";
    side.setAttribute("data-total", total);
    updateProgress();
  }
  function updateProgress() {
    var side = document.getElementById("sidebar");
    if (!side) return;
    var cps = pages.filter(function (p) { return p.checkpoint; });
    var done = cps.filter(function (p) { return isDone(p.id); }).length;
    var bar = side.querySelector(".nav__bar span");
    var count = side.querySelector(".nav__count");
    if (bar) bar.style.width = (cps.length ? (done / cps.length) * 100 : 0) + "%";
    if (count) count.textContent = done + " of " + cps.length + " checkpoints done";
    cps.forEach(function (p) {
      var t = side.querySelector('[data-tick="' + p.id + '"]');
      if (!t) return;
      t.classList.toggle("is-done", isDone(p.id));
      var sr = t.querySelector(".sr-only");
      if (sr) sr.textContent = isDone(p.id) ? "Checkpoint done" : "Checkpoint not done";
    });
  }

  /* ---------- mobile menu ---------- */
  function wireMenu() {
    var btn = document.querySelector(".menu-btn");
    var side = document.getElementById("sidebar");
    if (!btn || !side) return;
    var scrim = el("div", { class: "scrim", hidden: "" });
    body.appendChild(scrim);
    function setOpen(open) {
      body.classList.toggle("nav-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.innerHTML = (open ? ICONS.close : ICONS.menu) + '<span class="sr-only">' + (open ? "Close menu" : "Open menu") + "</span>";
      if (open) { scrim.removeAttribute("hidden"); var a = side.querySelector("a"); if (a) a.focus(); }
      else scrim.setAttribute("hidden", "");
    }
    btn.addEventListener("click", function () { setOpen(!body.classList.contains("nav-open")); });
    scrim.addEventListener("click", function () { setOpen(false); btn.focus(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("nav-open")) { setOpen(false); btn.focus(); }
    });
  }

  /* ---------- pager (Previous / Next) ---------- */
  function buildPager() {
    var holder = document.getElementById("pager");
    if (!holder || !current) return;
    var group = pages.filter(function (p) { return p.group === current.group; });
    var i = group.indexOf(current);
    var prev = group[i - 1], next = group[i + 1];
    function label(p) { return (p.group === "lessons" ? "Lesson " + p.num : p.num || "") + (p.num != null ? ": " : "") + p.title; }
    holder.innerHTML =
      (prev ? '<a class="pager__link pager__link--prev" href="' + root + prev.path + '" rel="prev"><span class="pager__dir">' + ICONS.left + "Previous</span><span class=\"pager__title\">" + esc(label(prev)) + "</span></a>" : "<span></span>") +
      (next ? '<a class="pager__link pager__link--next" href="' + root + next.path + '" rel="next"><span class="pager__dir">Next' + ICONS.right + "</span><span class=\"pager__title\">" + esc(label(next)) + "</span></a>" : "<span></span>");
  }

  /* ---------- poll boxes and QR codes ---------- */
  function qrSvg(text) {
    if (typeof window.qrcode !== "function") return "";
    var qr = window.qrcode(0, "M");
    qr.addData(text);
    qr.make();
    var n = qr.getModuleCount(), m = 2, size = n + m * 2, d = "";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) d += "M" + (c + m) + " " + (r + m) + "h1v1h-1z";
    return '<svg class="qr" viewBox="0 0 ' + size + " " + size + '" role="img" aria-label="QR code for ' + esc(pollHost(text)) + '" shape-rendering="crispEdges"><rect width="' + size + '" height="' + size + '" fill="#fff"/><path d="' + d + '" fill="#111"/></svg>';
  }
  function qrBlock(url) {
    if (isPlaceholder(url)) return '<div class="qr qr--placeholder" role="img" aria-label="QR code placeholder"><span>QR code appears once the poll link is set in assets/js/config.js</span></div>';
    return qrSvg(url);
  }
  function buildPolls() {
    var url = cfg.pollUrl || "";
    var host = isPlaceholder(url) ? "Poll link coming soon" : pollHost(url);
    document.querySelectorAll(".poll-box").forEach(function (box) {
      box.innerHTML =
        '<div class="poll-box__qr">' + qrBlock(url) + "</div>" +
        '<div class="poll-box__text"><p class="poll-box__label">Join the poll</p>' +
        '<p class="poll-box__how">Scan the code with your phone camera, or go to</p>' +
        '<a class="poll-box__url" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(host) + "</a></div>";
    });
    document.querySelectorAll(".poll-break").forEach(function (box) {
      var note = box.getAttribute("data-note") || "";
      box.setAttribute("role", "note");
      box.innerHTML =
        '<div class="poll-break__qr">' + qrBlock(url) + "</div>" +
        '<div class="poll-break__text"><p class="poll-break__title">' + ICONS.poll + "Poll break</p>" +
        (note ? '<p class="poll-break__note">' + esc(note) + "</p>" : "") +
        '<p class="poll-break__join">Join the poll at <a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(host) + "</a></p></div>";
    });
  }

  /* ---------- config-driven links ---------- */
  function fillConfig() {
    document.querySelectorAll("[data-config-link]").forEach(function (a) {
      var v = cfg[a.getAttribute("data-config-link")];
      if (!v) return;
      a.setAttribute("href", v);
      if (!a.textContent.trim()) a.textContent = v;
    });
    document.querySelectorAll("[data-config-text]").forEach(function (n) {
      var v = cfg[n.getAttribute("data-config-text")];
      if (v) n.textContent = v;
    });
  }

  /* ---------- copy blocks ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = el("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); }
      body.removeChild(ta);
    });
  }
  function buildCopyBlocks() {
    document.querySelectorAll(".copy-block").forEach(function (block) {
      var bar = block.querySelector(".copy-block__bar");
      if (!bar) { bar = el("div", { class: "copy-block__bar" }); block.insertBefore(bar, block.firstChild); }
      var code = block.querySelector("pre code") || block.querySelector("pre");
      var btn = el("button", { class: "copy-btn", type: "button" }, ICONS.copy + "<span>Copy</span>");
      var status = el("span", { class: "sr-only", "aria-live": "polite" });
      bar.appendChild(btn);
      bar.appendChild(status);
      btn.addEventListener("click", function () {
        copyText(code.textContent.replace(/\n$/, "")).then(function () {
          btn.classList.add("is-copied");
          btn.querySelector("span").textContent = "Copied";
          status.textContent = "Copied to clipboard";
          setTimeout(function () { btn.classList.remove("is-copied"); btn.querySelector("span").textContent = "Copy"; status.textContent = ""; }, 1800);
        }, function () {
          btn.querySelector("span").textContent = "Select and copy";
        });
      });
    });
  }

  /* ---------- checkpoints ---------- */
  function buildCheckpoints() {
    document.querySelectorAll(".checkpoint").forEach(function (cp) {
      var id = cp.getAttribute("data-checkpoint") || pageId;
      var box = cp.querySelector('input[type="checkbox"]');
      if (!box) return;
      box.checked = isDone(id);
      cp.classList.toggle("is-done", box.checked);
      box.addEventListener("change", function () {
        if (box.checked) store.set(CHECK_PREFIX + id, "1"); else store.remove(CHECK_PREFIX + id);
        cp.classList.toggle("is-done", box.checked);
        updateProgress();
      });
    });
  }

  /* ---------- glossary filter ---------- */
  function buildFilters() {
    document.querySelectorAll("[data-filter]").forEach(function (input) {
      var target = document.querySelector(input.getAttribute("data-filter"));
      if (!target) return;
      var items = target.querySelectorAll("[data-term]");
      var count = document.querySelector(input.getAttribute("data-filter-count") || "#no-match");
      // Search the term and its definition, not the "See …" cross-reference lines.
      var haystack = new Map();
      items.forEach(function (it) {
        var text = it.textContent;
        it.querySelectorAll(".where").forEach(function (w) { text = text.replace(w.textContent, ""); });
        haystack.set(it, text.toLowerCase());
      });
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase(), shown = 0;
        items.forEach(function (it) {
          var hit = !q || haystack.get(it).indexOf(q) !== -1;
          it.hidden = !hit;
          if (hit) shown++;
        });
        target.querySelectorAll("[data-letter]").forEach(function (sec) {
          sec.hidden = !sec.querySelector("[data-term]:not([hidden])");
        });
        if (count) count.hidden = shown !== 0;
      });
    });
  }

  /* ---------- tables: make scroll boxes focusable so keyboard users can scroll ---------- */
  function wireTables() {
    document.querySelectorAll(".table-wrap, .figure-scroll").forEach(function (w) {
      if (w.scrollWidth > w.clientWidth + 1) {
        w.setAttribute("tabindex", "0");
        if (!w.hasAttribute("aria-label")) w.setAttribute("aria-label", "Scrollable content");
      }
    });
  }

  /* ---------- print: open every "Go deeper" section ---------- */
  function wirePrint() {
    var opened = [];
    window.addEventListener("beforeprint", function () {
      document.querySelectorAll("details:not([open])").forEach(function (d) { d.setAttribute("open", ""); opened.push(d); });
    });
    window.addEventListener("afterprint", function () {
      opened.forEach(function (d) { d.removeAttribute("open"); });
      opened = [];
    });
  }

  /* ---------- page title ---------- */
  function setTitle() {
    if (!current || document.title) return;
    document.title = current.title + " · " + (cfg.courseTitle || "Class 3 Workbook");
  }

  buildTopbar();
  buildSidebar();
  wireMenu();
  buildPager();
  buildPolls();
  fillConfig();
  buildCopyBlocks();
  buildCheckpoints();
  buildFilters();
  wirePrint();
  setTitle();
  window.addEventListener("load", wireTables);
  window.addEventListener("resize", wireTables);
})();
