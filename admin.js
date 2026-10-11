/* ==========================================================================
   SIGAPI — DASHBOARD ADMIN
   --------------------------------------------------------------------------
   Kontrak data yang dipertahankan (tidak diubah):
     tabel  : news
     kolom  : title, category, content, image, date (+ id, created_at)
     aksi   : select *, insert, delete().eq("id")
   Autentikasi: tetap memakai sessionStorage "sigap-admin-logged".
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s, sc) => (sc || document).querySelector(s);
  const $$ = (s, sc) => Array.from((sc || document).querySelectorAll(s));
  const SESSION_KEY = "sigap-admin-logged";

  const admin = $("#admin");
  const gateForm = $("#gate-form");
  const gateField = $("#gate-field");
  const gateErrorText = $("#gate-error-text");
  const supabase = window.sigapSupabase;

  const VIEW_LABELS = {
    overview: "Ringkasan",
    compose: "Tulis berita",
    manage: "Berita terbit",
  };

  /* ------------------------------------------------------------------------
     TOAST
     ---------------------------------------------------------------------- */
  const toastHost = $("#toasts");
  function toast(kind, title, message) {
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
        <span class="toast__title">${escapeHtml(title)}</span>
        ${message ? `<span class="toast__msg">${escapeHtml(message)}</span>` : ""}
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
    setTimeout(remove, 5200);
  }

  function escapeHtml(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ------------------------------------------------------------------------
     TEMA
     ---------------------------------------------------------------------- */
  const themeBtn = $("#admin-theme-toggle");
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#070d15" : "#0a1523");
    const use = themeBtn?.querySelector("use");
    if (use) use.setAttribute("href", theme === "dark" ? "#i-moon" : "#i-sun");
    try {
      localStorage.setItem("sigap-theme", theme);
    } catch (e) {}
  }
  if (themeBtn) {
    applyTheme(currentTheme());
    themeBtn.addEventListener("click", () =>
      applyTheme(currentTheme() === "dark" ? "light" : "dark"),
    );
  }

  /* ------------------------------------------------------------------------
     AUTENTIKASI
     ---------------------------------------------------------------------- */
  function isAuthed() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "true";
    } catch (e) {
      return false;
    }
  }

  function lock() {
    admin?.setAttribute("data-locked", "true");
    const pw = $("#gate-password");
    if (pw) {
      pw.value = "";
      pw.focus();
    }
  }

  function unlock() {
    admin?.setAttribute("data-locked", "false");
    App.start();
  }

  if (gateForm) {
    gateForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const pw = $("#gate-password").value;
      /* Sandi identik dengan implementasi sebelumnya — tidak diubah. */
      if (pw === "admin123") {
        try {
          sessionStorage.setItem(SESSION_KEY, "true");
        } catch (err) {}
        toast("success", "Berhasil masuk", "Selamat bekerja di dashboard SIGAPI.");
        unlock();
      } else {
        gateField?.setAttribute("data-invalid", "true");
        if (gateErrorText)
          gateErrorText.textContent = pw
            ? "Sandi salah. Silakan coba lagi."
            : "Sandi belum diisi.";
        $("#gate-password")?.focus();
      }
    });
    $("#gate-password")?.addEventListener("input", () =>
      gateField?.setAttribute("data-invalid", "false"),
    );
  }

  /* ------------------------------------------------------------------------
     STATE
     ---------------------------------------------------------------------- */
  const App = {
    items: [],
    query: "",
    category: "Semua",
    sort: "newest",
    page: 1,
    perPage: 8,
    currentView: "overview",

    async start() {
      Nav.init();
      Manage.init();
      await this.refresh();
    },

    async refresh() {
      const status = $("#side-db-status");
      try {
        const data = await this.fetch();
        this.items = data;
        if (status) {
          status.textContent = data.length
            ? `Tersambung · ${data.length} berita`
            : "Tersambung · belum ada berita";
        }
      } catch (err) {
        console.error(err);
        if (status) status.textContent = "Tidak tersambung ke Supabase";
        toast(
          "error",
          "Gagal memuat berita",
          "Basis data tidak dapat dihubungi. Coba muat ulang.",
        );
      }
      Overview.render(this.items);
      Manage.render(this.items);
    },

    async fetch() {
      if (!supabase) throw new Error("Konfigurasi Supabase belum termuat.");
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },

    filtered() {
      let out = this.items.slice();
      if (this.category !== "Semua")
        out = out.filter(
          (n) => String(n.category || "").trim() === this.category,
        );
      const q = this.query.trim().toLowerCase();
      if (q)
        out = out.filter((n) =>
          `${n.title || ""} ${n.content || ""} ${n.category || ""}`
            .toLowerCase()
            .includes(q),
        );
      if (this.sort === "oldest") out.reverse();
      if (this.sort === "title")
        out.sort((a, b) =>
          String(a.title || "").localeCompare(String(b.title || ""), "id"),
        );
      return out;
    },
  };

  /* ------------------------------------------------------------------------
     NAVIGASI VIEW
     ---------------------------------------------------------------------- */
  const Nav = {
    init() {
      $$(".side__link[data-view]").forEach((btn) =>
        btn.addEventListener("click", () => this.go(btn.dataset.view)),
      );
      $$("[data-goto]").forEach((btn) =>
        btn.addEventListener("click", () => this.go(btn.dataset.goto)),
      );
      const sideToggle = $("#side-toggle");
      const side = $("#side");
      if (sideToggle) {
        sideToggle.addEventListener("click", () => {
          const open = side?.getAttribute("data-open") === "true";
          side?.setAttribute("data-open", String(!open));
          sideToggle.setAttribute("aria-expanded", String(!open));
        });
      }
      // Sidebar seluler: panel mengapung di atas konten
      if (side && window.matchMedia("(max-width: 59.99em)").matches) {
        side.style.cssText =
          "display:grid;position:fixed;top:3.5rem;left:0;right:0;z-index:55;box-shadow:var(--sh-3)";
        side.setAttribute("data-open", "false");
        side.hidden = true;
        sideToggle?.addEventListener("click", () => {
          side.hidden = side.getAttribute("data-open") !== "true";
        });
      }
      this.go("overview");
    },

    go(view) {
      App.currentView = view;
      $$(".view").forEach((v) => (v.hidden = v.id !== "view-" + view));
      $$(".side__link[data-view]").forEach((b) =>
        b.setAttribute(
          "aria-current",
          String(b.dataset.view === view),
        ),
      );
      const crumb = $("#admin-crumb-current");
      if (crumb) crumb.textContent = VIEW_LABELS[view] || view;
      const side = $("#side");
      if (side && window.matchMedia("(max-width: 59.99em)").matches) {
        side.hidden = true;
        side.setAttribute("data-open", "false");
        $("#side-toggle")?.setAttribute("aria-expanded", "false");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  };

  /* ------------------------------------------------------------------------
     RINGKASAN
     ---------------------------------------------------------------------- */
  const Overview = {
    render(items) {
      const host = $("#stats");
      if (!host) return;
      const total = items.length;
      const cats = new Set(
        items.map((n) => String(n.category || "").trim()).filter(Boolean),
      );
      const latest = items[0];
      const withImage = items.filter((n) => n.image).length;

      host.innerHTML = [
        { k: "Total berita", v: total, d: "Terbit di beranda", accent: true },
        { k: "Kategori", v: cats.size, d: [...cats].slice(0, 3).join(", ") || "—" },
        {
          k: "Mem foto",
          v: withImage,
          d: `${total - withImage} tanpa foto`,
        },
        {
          k: "Terbit terbaru",
          v: latest ? latest.date || "—" : "—",
          d: latest ? latest.title || "" : "Belum ada berita",
        },
      ]
        .map(
          (s) => `
        <div class="stat${s.accent ? " stat--accent" : ""}">
          <span class="stat__k">${escapeHtml(s.k)}</span>
          <span class="stat__v">${escapeHtml(String(s.v))}</span>
          <span class="stat__d">${escapeHtml(String(s.d))}</span>
        </div>`,
        )
        .join("");

      const feed = $("#activity");
      if (feed) {
        feed.innerHTML = total
          ? items
              .slice(0, 5)
              .map(
                (n) => `
            <div class="feed__item">
              <span class="feed__dot"></span>
              <span class="feed__t">${escapeHtml(n.title || "(tanpa judul)")}</span>
              <span class="feed__d">${escapeHtml(n.date || "")}</span>
            </div>`,
              )
              .join("")
          : `<div class="state__text" style="padding:var(--s-6) 0">
               Belum ada aktivitas. Berita yang kamu publikasikan akan muncul di sini.
             </div>`;
      }

      const badge = $("#side-count");
      if (badge) badge.textContent = String(total);

      const select = $("#table-category");
      if (select) {
        const current = select.value;
        select.innerHTML =
          `<option value="Semua">Semua kategori</option>` +
          [...cats]
            .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
            .join("");
        select.value = current;
      }
      const datalist = $("#category-options");
      if (datalist)
        datalist.innerHTML = [...cats]
          .map((c) => `<option value="${escapeHtml(c)}"></option>`)
          .join("");
      const preview = $("#tag-preview");
      if (preview)
        preview.innerHTML = cats.size
          ? [...cats]
              .map(
                (c) =>
                  `<span class="tag tag--outline">${escapeHtml(c)}</span>`,
              )
              .join("")
          : `<span class="muted" style="font-size:var(--fs-xs)">Belum ada kategori.</span>`;
    },
  };

  /* ------------------------------------------------------------------------
     TABEL BERITA TERBIT
     ---------------------------------------------------------------------- */
  const Manage = {
    init() {
      $("#table-search")?.addEventListener("input", (e) => {
        App.query = e.target.value;
        App.page = 1;
        this.render(App.items);
      });
      $("#table-category")?.addEventListener("change", (e) => {
        App.category = e.target.value;
        App.page = 1;
        this.render(App.items);
      });
      $("#table-sort")?.addEventListener("change", (e) => {
        App.sort = e.target.value;
        App.page = 1;
        this.render(App.items);
      });
      $("#table-refresh")?.addEventListener("click", () =>
        App.refresh(),
      );
      document.addEventListener("keydown", (e) => {
        const tag = (e.target.tagName || "").toLowerCase();
        if (
          e.key === "/" &&
          tag !== "input" &&
          tag !== "textarea" &&
          App.currentView === "manage"
        ) {
          e.preventDefault();
          $("#table-search")?.focus();
        }
      });
    },

    render(items) {
      const tbody = $("#news-table");
      const info = $("#table-info");
      const pager = $("#pager");
      if (!tbody) return;

      const rows = App.filtered();
      const totalPages = Math.max(1, Math.ceil(rows.length / App.perPage));
      if (App.page > totalPages) App.page = totalPages;
      const start = (App.page - 1) * App.perPage;
      const page = rows.slice(start, start + App.perPage);

      tbody.innerHTML = page.length
        ? page
            .map(
              (n) => `
        <tr>
          <td>
            ${
              n.image
                ? `<img class="table__thumb" src="${escapeHtml(n.image)}" alt="" loading="lazy" />`
                : `<span class="table__thumb table__thumb--empty">
                     <svg aria-hidden="true"><use href="#i-image"/></svg></span>`
            }
          </td>
          <td>
            <span class="table__title">${escapeHtml(n.title || "(tanpa judul)")}</span>
            <span class="table__sub">${escapeHtml(n.content || "")}</span>
          </td>
          <td>${n.category ? `<span class="tag tag--outline">${escapeHtml(n.category)}</span>` : "—"}</td>
          <td>${escapeHtml(n.date || "—")}</td>
          <td>
            <div class="table__actions">
              <button class="icon-btn" type="button" data-preview="${n.id}"
                aria-label="Pratinjau ${escapeHtml(n.title || "")}">
                <svg aria-hidden="true"><use href="#i-eye"/></svg>
              </button>
              <button class="icon-btn" type="button" data-delete="${n.id}"
                aria-label="Hapus ${escapeHtml(n.title || "")}">
                <svg aria-hidden="true"><use href="#i-trash"/></svg>
              </button>
            </div>
          </td>
        </tr>`,
            )
            .join("")
        : `<tr><td colspan="5">
             <div class="state state--center">
               <span class="state__icon"><svg aria-hidden="true"><use href="#i-inbox"/></svg></span>
               <span class="state__title">Tidak ada berita yang cocok</span>
               <span class="state__text">Ubah kata kunci atau filter kategori, atau tulis berita baru.</span>
               <span class="state__actions">
                 <button class="btn btn--primary btn--sm" type="button" data-goto="compose">
                   <svg aria-hidden="true"><use href="#i-plus"/></svg> Tulis berita
                 </button>
               </span>
             </div>
           </td></tr>`;

      if (info)
        info.textContent = rows.length
          ? `Menampilkan ${start + 1}–${Math.min(start + App.perPage, rows.length)} dari ${rows.length} berita`
          : "0 berita";

      if (pager) {
        pager.innerHTML = rows.length
          ? `
          <button class="pager__btn" type="button" data-page="prev" ${App.page === 1 ? "disabled" : ""} aria-label="Halaman sebelumnya">
            <svg aria-hidden="true" style="width:14px;height:14px"><use href="#i-chev-left"/></svg>
          </button>
          <span style="font-size:var(--fs-xs);padding:0 var(--s-2)">
            ${App.page} / ${totalPages}
          </span>
          <button class="pager__btn" type="button" data-page="next" ${App.page === totalPages ? "disabled" : ""} aria-label="Halaman berikutnya">
            <svg aria-hidden="true" style="width:14px;height:14px"><use href="#i-chev-right"/></svg>
          </button>`
          : "";
      }

      tbody.querySelectorAll("[data-delete]").forEach((b) =>
        b.addEventListener("click", () => Confirm.open(b.dataset.delete)),
      );
      tbody.querySelectorAll("[data-preview]").forEach((b) =>
        b.addEventListener("click", () => {
          const item = App.items.find((n) => String(n.id) === b.dataset.preview);
          if (item) Preview.show(item);
        }),
      );
      tbody.querySelectorAll("[data-page]").forEach((b) =>
        b.addEventListener("click", () => {
          const dir = b.dataset.page === "next" ? 1 : -1;
          const next = App.page + dir;
          if (next >= 1 && next <= totalPages) {
            App.page = next;
            this.render(App.items);
          }
        }),
      );
      $$("[data-goto]", tbody).forEach((b) =>
        b.addEventListener("click", () => Nav.go(b.dataset.goto)),
      );
    },
  };

  /* ------------------------------------------------------------------------
     PRATINJAU ARTIKEL (dialog membaca)
     ---------------------------------------------------------------------- */
  const Preview = {
    show(item) {
      Dialog.open({
        title: item.title || "(tanpa judul)",
        eyebrow: item.category || "Berita",
        text: item.content || "Tidak ada isi berita.",
        image: item.image || null,
        actions: [
          {
            label: "Tutup",
            variant: "ghost",
            run: (api) => api.close(),
          },
        ],
      });
    },
  };

  /* ------------------------------------------------------------------------
     DIALOG UMUM
     ---------------------------------------------------------------------- */
  const Dialog = {
    host: $("#confirm-dialog"),
    lastFocus: null,
    open({ title, eyebrow, text, image, actions }) {
      const h = this.host;
      if (!h) return;
      this.lastFocus = document.activeElement;
      const titleEl = $("#confirm-title", h);
      const textEl = $("#confirm-text", h);
      titleEl.textContent = title;
      textEl.innerHTML = image
        ? `<img src="${escapeHtml(image)}" alt="" style="width:100%;border-radius:var(--r-2);margin-bottom:var(--s-3)" />` +
          escapeHtml(text).replace(/\n/g, "<br>")
        : escapeHtml(text).replace(/\n/g, "<br>");
      if (eyebrow) {
        let eb = $(".eyebrow", h);
        if (!eb) {
          eb = document.createElement("span");
          eb.className = "eyebrow";
          h.querySelector(".dialog__box").prepend(eb);
        }
        eb.textContent = eyebrow;
      }
      const box = h.querySelector(".dialog__actions");
      box.innerHTML = "";
      (actions || []).forEach((a) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn " + (a.variant === "ghost" ? "btn--ghost" : a.variant === "danger" ? "btn--danger" : "btn--primary");
        btn.textContent = a.label;
        btn.addEventListener("click", () => a.run(api));
        box.appendChild(btn);
      });
      const api = { close: () => this.close() };
      h.setAttribute("data-open", "true");
      document.body.style.overflow = "hidden";
      box.querySelector("button")?.focus();
    },
    close() {
      const h = this.host;
      if (!h) return;
      h.setAttribute("data-open", "false");
      document.body.style.overflow = "";
      this.lastFocus?.focus?.();
    },
  };
  window.SigapDialog = Dialog;
  $$("[data-dialog-close]").forEach((el) =>
    el.addEventListener("click", () => Dialog.close()),
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") Dialog.close();
  });

  /* ------------------------------------------------------------------------
     KONFIRMASI HAPUS
     ---------------------------------------------------------------------- */
  const Confirm = {
    open(id) {
      const item = App.items.find((n) => String(n.id) === String(id));
      Dialog.open({
        title: "Hapus berita ini?",
        eyebrow: "Konfirmasi hapus",
        text:
          (item ? `"${item.title}" ` : "Berita ini ") +
          "akan dihapus permanen dari basis data dan tidak lagi tampil di beranda. Tindakan ini tidak dapat dibatalkan.",
        actions: [
          { label: "Batal", variant: "ghost", run: (api) => api.close() },
          {
            label: "Hapus",
            variant: "danger",
            run: async (api) => {
              api.close();
              await this.remove(id);
            },
          },
        ],
      });
    },

    async remove(id) {
      const submit = $("#confirm-accept");
      if (submit) {
        submit.disabled = true;
        submit.innerHTML = `<span class="spinner"></span> Menghapus…`;
      }
      try {
        if (!supabase) throw new Error("Konfigurasi Supabase belum termuat.");
        const { error } = await supabase.from("news").delete().eq("id", id);
        if (error) throw error;
        toast("success", "Berita dihapus", "Berita sudah tidak tampil di beranda.");
        await App.refresh();
        Nav.go("manage");
      } catch (err) {
        console.error(err);
        toast("error", "Gagal menghapus", err.message || String(err));
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = "Hapus";
        }
      }
    },
  };

  /* ------------------------------------------------------------------------
     FORM TULIS BERITA
     ---------------------------------------------------------------------- */
  const form = $("#news-form");
  const fileInput = $("#news-image");
  const drop = $("#drop");
  const dropPreview = $("#drop-preview");
  const dropName = $("#drop-name");
  const dropSize = $("#drop-size");
  const submitBtn = $("#submit-news");
  const formStatus = $("#form-status");

  function setCounter(inputId, counterId, max) {
    const input = $(inputId);
    const counter = $(counterId);
    if (!input || !counter) return;
    const render = (len) => (max ? `${len} / ${max}` : `${len} karakter`);
    const update = () => (counter.textContent = render(input.value.length));
    input.addEventListener("input", update);
    update();
  }
  setCounter("#news-title", "#count-title", 140);
  setCounter("#news-content", "#count-content", null);

  function setInvalid(fieldId, invalid) {
    $(fieldId)?.setAttribute("data-invalid", String(Boolean(invalid)));
  }

  if (fileInput) {
    const showFile = () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        drop?.setAttribute("data-filled", "false");
        return;
      }
      drop?.setAttribute("data-filled", "true");
      if (dropName) dropName.textContent = file.name;
      if (dropSize)
        dropSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
      const reader = new FileReader();
      reader.onload = () => {
        if (dropPreview) dropPreview.src = reader.result;
      };
      reader.readAsDataURL(file);
    };
    fileInput.addEventListener("change", showFile);
    ["dragenter", "dragover"].forEach((ev) =>
      drop?.addEventListener(ev, (e) => {
        e.preventDefault();
        drop.setAttribute("data-drag", "true");
      }),
    );
    ["dragleave", "drop"].forEach((ev) =>
      drop?.addEventListener(ev, (e) => {
        e.preventDefault();
        drop.setAttribute("data-drag", "false");
      }),
    );
    drop?.addEventListener("drop", (e) => {
      if (e.dataTransfer?.files?.length) {
        fileInput.files = e.dataTransfer.files;
        showFile();
      }
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = $("#news-title").value.trim();
      const category = $("#news-category").value.trim();
      const content = $("#news-content").value.trim();
      const file = fileInput?.files?.[0];

      let ok = true;
      setInvalid("#field-title", !title);
      if (!title) ok = false;
      setInvalid("#field-category", !category);
      if (!category) ok = false;
      const contentShort = content.length > 0 && content.length < 20;
      setInvalid("#field-content", contentShort || !content);
      if (!content || contentShort) ok = false;

      if (!ok) {
        if (formStatus)
          formStatus.textContent =
            "Periksa kembali kolom yang ditandai sebelum menerbitkan.";
        toast("error", "Formulir belum lengkap", "Lengkapi kolom yang wajib diisi.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner"></span> Menerbitkan…`;
      if (formStatus) formStatus.textContent = "Mengunggah berita…";

      try {
        let image = null;
        if (file) {
          if (file.size > 2 * 1024 * 1024)
            throw new Error("Ukuran foto maksimal 2MB.");
          image = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Foto gagal dibaca."));
            reader.readAsDataURL(file);
          });
        }

        if (!supabase) throw new Error("Konfigurasi Supabase belum termuat.");
        const { error } = await supabase.from("news").insert({
          title,
          category,
          content,
          image,
          date: new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        });
        if (error) throw error;

        form.reset();
        drop?.setAttribute("data-filled", "false");
        if (dropPreview) dropPreview.removeAttribute("src");
        $("#count-title").textContent = "0 / 140";
        $("#count-content").textContent = "0 karakter";
        if (formStatus)
          formStatus.textContent = "Berita berhasil dipublikasikan.";
        toast(
          "success",
          "Berita dipublikasikan",
          "Berita sudah tampil di bagian Berita Komunitas pada beranda.",
        );
        await App.refresh();
        Nav.go("manage");
      } catch (err) {
        console.error(err);
        if (formStatus)
          formStatus.textContent = "Gagal menerbitkan berita. Silakan coba lagi.";
        toast("error", "Gagal menerbitkan", err.message || String(err));
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<svg aria-hidden="true"><use href="#i-plus"/></svg> Publikasikan berita`;
      }
    });

    form.addEventListener("reset", () => {
      $$(".field", form).forEach((f) => f.setAttribute("data-invalid", "false"));
      setTimeout(() => {
        drop?.setAttribute("data-filled", "false");
        if (formStatus) formStatus.textContent = "";
      }, 0);
    });
  }

  /* ------------------------------------------------------------------------
     LOGOUT
     ---------------------------------------------------------------------- */
  $("#admin-logout")?.addEventListener("click", () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {}
    toast("info", "Keluar", "Sesi admin telah diakhiri.");
    lock();
  });

  /* ------------------------------------------------------------------------
     BOOT
     ---------------------------------------------------------------------- */
  if (isAuthed()) {
    unlock();
  } else {
    lock();
  }
})();
