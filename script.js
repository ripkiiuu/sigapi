/* ==========================================================================
   SIGAPI — INTERAKSI SITUS PUBLIK
   ========================================================================== */
(function () {
  "use strict";

  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) =>
    Array.from((scope || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ------------------------------------------------------------------------
     TEMA TERANG / GELAP
     ---------------------------------------------------------------------- */
  const Theme = {
    key: "sigap-theme",
    root: document.documentElement,
    toggle: $("#theme-toggle"),

    current() {
      return this.root.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    },

    apply(theme) {
      this.root.setAttribute("data-theme", theme);
      const meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", theme === "dark" ? "#070d15" : "#0a1523");
      if (this.toggle) {
        this.toggle.setAttribute(
          "aria-label",
          theme === "dark" ? "Aktifkan tampilan terang" : "Aktifkan tampilan gelap",
        );
        this.toggle.setAttribute(
          "aria-pressed",
          String(theme === "dark"),
        );
      }
      try {
        localStorage.setItem(this.key, theme);
      } catch (e) {}
    },

    init() {
      this.apply(this.current());
      if (this.toggle) {
        this.toggle.addEventListener("click", () =>
          this.apply(this.current() === "dark" ? "light" : "dark"),
        );
      }
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          let stored = null;
          try {
            stored = localStorage.getItem(this.key);
          } catch (err) {}
          if (!stored) this.apply(e.matches ? "dark" : "light");
        });
    },
  };
  Theme.init();

  /* ------------------------------------------------------------------------
     HEADER — sticky shadow + scroll spy navigasi
     ---------------------------------------------------------------------- */
  const header = $("#site-header");
  if (header) {
    const onScroll = () =>
      header.setAttribute("data-stuck", String(window.scrollY > 8));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const navLinks = $$(".nav__link");
  const sections = navLinks
    .map((l) => $(l.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((l) =>
            l.setAttribute(
              "aria-current",
              String(l.getAttribute("href") === "#" + entry.target.id),
            ),
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ------------------------------------------------------------------------
     DRAWER NAVIGASI (mobile)
     ---------------------------------------------------------------------- */
  const drawer = $("#drawer");
  const menuToggle = $("#menu-toggle");
  function setDrawer(open) {
    if (!drawer || !menuToggle) return;
    drawer.setAttribute("data-open", String(open));
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute(
      "aria-label",
      open ? "Tutup menu" : "Buka menu",
    );
    document.body.style.overflow = open ? "hidden" : "";
    const icon = menuToggle.querySelector("use");
    if (icon) icon.setAttribute("href", open ? "#i-close" : "#i-menu");
    if (open) {
      const first = $(".drawer__link", drawer);
      if (first) first.focus({ preventScroll: true });
    }
  }
  if (menuToggle) {
    menuToggle.addEventListener("click", () =>
      setDrawer(drawer.getAttribute("data-open") !== "true"),
    );
  }
  $$("[data-close-drawer]").forEach((el) =>
    el.addEventListener("click", () => setDrawer(false)),
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer?.getAttribute("data-open") === "true") {
      setDrawer(false);
      menuToggle?.focus();
    }
  });

  /* ------------------------------------------------------------------------
     ALERT BAR — rotasi tips singkat
     ---------------------------------------------------------------------- */
  const tickerItems = $$("#alert-ticker .alert-bar__item");
  if (tickerItems.length > 1 && !reduceMotion) {
    let idx = 0;
    setInterval(() => {
      tickerItems[idx].removeAttribute("data-active");
      idx = (idx + 1) % tickerItems.length;
      tickerItems[idx].setAttribute("data-active", "true");
    }, 6000);
  }

  /* ------------------------------------------------------------------------
     PENCARIAN
     ---------------------------------------------------------------------- */
  const search = $("#search");
  const searchToggle = $("#search-toggle");
  const searchPanel = $("#search-panel");
  const searchInput = $("#site-search");
  const searchResults = $("#search-results");
  const searchCount = $("#search-count");

  function closeSearch() {
    if (!search) return;
    search.setAttribute("data-open", "false");
    searchToggle?.setAttribute("aria-expanded", "false");
  }
  if (searchToggle) {
    searchToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = search.getAttribute("data-open") !== "true";
      search.setAttribute("data-open", String(open));
      searchToggle.setAttribute("aria-expanded", String(open));
      if (open) searchInput?.focus();
    });
  }
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim();
      if (!q) {
        searchResults.innerHTML = "";
        if (searchCount) searchCount.textContent = "";
        return;
      }
      const matches = sigapSearch(q);
      if (searchCount)
        searchCount.textContent = `${matches.length} hasil`;
      searchResults.innerHTML = matches.length
        ? matches
            .map(
              (a) => `
            <a class="search__result" href="#" data-article="${a.id}">
              <span>${a.section}</span>
              <b>${a.title}</b>
            </a>`,
            )
            .join("")
        : `<div class="search__empty">Tidak ada hasil untuk “${q}”.</div>`;
      bindArticleTriggers(searchResults);
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeSearch();
        searchToggle?.focus();
      }
    });
  }
  document.addEventListener("click", (e) => {
    if (search && !search.contains(e.target)) closeSearch();
  });
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (e.key === "/" && tag !== "input" && tag !== "textarea") {
      e.preventDefault();
      search.setAttribute("data-open", "true");
      searchToggle?.setAttribute("aria-expanded", "true");
      searchInput?.focus();
    }
  });

  /* ------------------------------------------------------------------------
     MITOS / FAKTA
     ---------------------------------------------------------------------- */
  const mythCard = $("#myth-card");
  if (mythCard) {
    const stateEl = $("#myth-state");
    const textEl = $("#myth-text");
    const hintEl = $("#myth-hint");
    const MYTH = "Semua kebakaran dapat dipadamkan dengan air.";
    const FACT =
      "Tidak semua kebakaran aman dipadamkan dengan air. Sesuaikan tindakan dengan sumber apinya.";
    mythCard.addEventListener("click", () => {
      const isFact = mythCard.getAttribute("data-state") === "fact";
      mythCard.setAttribute("data-state", isFact ? "myth" : "fact");
      if (stateEl) stateEl.textContent = isFact ? "Mitos" : "Fakta";
      if (textEl) textEl.textContent = isFact ? MYTH : FACT;
      if (hintEl)
        hintEl.textContent = isFact
          ? "Ketuk untuk melihat faktanya"
          : "Ketuk untuk kembali ke mitos";
    });
  }

  /* ------------------------------------------------------------------------
     CHECKLIST KESIAPSIAGAAN
     ---------------------------------------------------------------------- */
  const checkBoxes = $$("#checklist input");
  const bar = $("#progress-bar");
  const label = $("#progress-label");
  const percent = $("#progress-percent");

  function updateProgress() {
    const total = checkBoxes.length;
    const done = checkBoxes.filter((b) => b.checked).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    if (bar) bar.style.width = pct + "%";
    if (label) label.textContent = `${done} dari ${total} selesai`;
    if (percent) percent.textContent = pct + "%";
    try {
      localStorage.setItem(
        "sigap-checklist",
        JSON.stringify(checkBoxes.map((b) => b.checked)),
      );
    } catch (e) {}
  }
  checkBoxes.forEach((b) => b.addEventListener("change", updateProgress));
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem("sigap-checklist") || "[]");
  } catch (e) {}
  checkBoxes.forEach((b, i) => {
    b.checked = saved[i] === true;
  });
  updateProgress();

  const resetBtn = $("#reset-checklist");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      checkBoxes.forEach((b) => (b.checked = false));
      updateProgress();
      Toast.show({
        kind: "info",
        title: "Checklist direset",
        message: "Semua centang kesiapsiagaan telah dikosongkan.",
      });
    });
  }

  /* ------------------------------------------------------------------------
     ARTICLE READER
     ---------------------------------------------------------------------- */
  const reader = $("#article-reader");
  const rBack = $("#reader-back");
  const rClose = $("#reader-close");
  const rTitle = $("#reader-title");
  const rCategory = $("#reader-category");
  const rMeta = $("#reader-meta");
  const rSection = $("#reader-section");
  const rImage = $("#reader-image");
  const rFigure = $("#reader-figure");
  const rText = $("#reader-text");
  const rRelated = $("#reader-related");
  const rProgress = $("#reader-progress");
  let lastFocus = null;

  function findArticle(id) {
    return (window.SIGAP_ARTICLES || []).find((a) => a.id === id);
  }

  function openArticle(source) {
    /* Menerima id artikel redaksi atau objek artikel komunitas siap pakai */
    let base =
      typeof source === "string" ? findArticle(source) : source;
    if (!base || typeof base !== "object") return;
    const related = (base.related || [])
      .map((id) => (typeof id === "string" ? findArticle(id) : id))
      .filter(Boolean)
      .slice(0, 3);

    if (rTitle) rTitle.textContent = base.title;
    if (rCategory) rCategory.textContent = base.category || "Berita";
    if (rSection) rSection.textContent = base.section || "SIGAPI";
    if (rMeta) {
      rMeta.innerHTML = [base.date, base.readTime]
        .filter(Boolean)
        .map((v) => `<span>${sigapEscape(v)}</span>`)
        .join("");
    }
    if (rImage && rFigure) {
      if (base.image) {
        rImage.src = base.image;
        rImage.alt = base.imageAlt || base.title;
        rFigure.setAttribute("data-empty", "false");
      } else {
        rImage.removeAttribute("src");
        rFigure.setAttribute("data-empty", "true");
      }
    }
    if (rText) {
      rText.innerHTML = base.body.map((p) => `<p>${p}</p>`).join("");
    }
    if (rRelated) {
      rRelated.innerHTML = related.length
        ? related
            .map(
              (a) => `
          <button class="card card--surface" type="button" data-article="${a.id}">
            <span class="card__media card__media--wide">
              ${
                a.image
                  ? `<img src="${a.image}" alt="${a.imageAlt || a.title}" loading="lazy" decoding="async" width="1000" height="563" />`
                  : `<span class="rail__glyph" style="width:100%;height:100%">
                       <svg aria-hidden="true"><use href="#i-flame"/></svg></span>`
              }
            </span>
            <span class="card__body">
              <span class="card__kicker"><span class="tag tag--outline">${a.section}</span></span>
              <span class="card__title" style="font-size:var(--fs-sm)">${a.title}</span>
            </span>
          </button>`,
            )
            .join("")
        : `<p class="muted" style="font-size:var(--fs-sm)">Belum ada artikel lain.</p>`;
      bindArticleTriggers(rRelated);
    }

    lastFocus = document.activeElement;
    reader.setAttribute("data-open", "true");
    reader.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    reader.scrollTop = 0;
    rClose?.focus({ preventScroll: true });
    if (!reduceMotion) {
      try {
        history.pushState({ sigapArticle: base.id || true }, "", "#artikel");
      } catch (e) {}
    }
  }

  function closeArticle() {
    if (!reader) return;
    reader.setAttribute("data-open", "false");
    reader.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (rProgress) rProgress.style.width = "0%";
    if (location.hash === "#artikel" && !reduceMotion) history.back();
    lastFocus?.focus?.({ preventScroll: true });
  }

  if (rBack) rBack.addEventListener("click", closeArticle);
  if (rClose) rClose.addEventListener("click", closeArticle);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && reader?.getAttribute("data-open") === "true") {
      closeArticle();
    }
  });
  window.addEventListener("popstate", () => {
    if (location.hash !== "#artikel" && reader) closeArticle();
  });

  /* Delegasi: semua elemen dengan data-article membuka pembaca artikel */
  function bindArticleTriggers(scope) {
    $$("[data-article]", scope || document).forEach((el) => {
      if (el.dataset.bound) return;
      el.dataset.bound = "true";
      el.addEventListener("click", (e) => {
        e.preventDefault();
        closeSearch();
        openArticle(el.dataset.article);
      });
    });
  }
  bindArticleTriggers(document);

  /* Ekspos API internal */
  window.SIGAP_ARTICLES = window.SIGAP_ARTICLES || [];
  window.SigapReader = { open: openArticle, close: closeArticle };

  /* ------------------------------------------------------------------------
     TOAST
     ---------------------------------------------------------------------- */
  const toastHost = $("#toasts");
  const Toast = {
    show({ kind = "info", title = "", message = "", timeout = 4200 }) {
      if (!toastHost) return;
      const el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("data-kind", kind);
      el.setAttribute("role", kind === "error" ? "alert" : "status");
      const icon =
        kind === "success" ? "#i-check" : kind === "error" ? "#i-alert" : "#i-info";
      el.innerHTML = `
        <svg class="toast__icon" aria-hidden="true"><use href="${icon}"/></svg>
        <div class="toast__body">
          <span class="toast__title">${sigapEscape(title)}</span>
          ${message ? `<span class="toast__msg">${sigapEscape(message)}</span>` : ""}
        </div>
        <button class="toast__close" type="button" aria-label="Tutup notifikasi">
          <svg aria-hidden="true" style="width:14px;height:14px"><use href="#i-close"/></svg>
        </button>`;
      toastHost.appendChild(el);
      const remove = () => {
        el.setAttribute("data-leaving", "true");
        setTimeout(() => el.remove(), 220);
      };
      $(".toast__close", el).addEventListener("click", remove);
      if (timeout) setTimeout(remove, timeout);
    },
  };
  window.SigapToast = Toast;
})();
