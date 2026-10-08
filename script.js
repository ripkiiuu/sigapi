const checklist = document.querySelectorAll("#checklist input");
const progressBar = document.querySelector("#progress-bar");
const progressLabel = document.querySelector("#progress-label");
const progressPercent = document.querySelector("#progress-percent");

function updateProgress() {
  if (!progressBar) return;
  const completed = [...checklist].filter((item) => item.checked).length;
  const percent = Math.round((completed / checklist.length) * 100);
  progressBar.style.width = `${percent}%`;
  progressLabel.textContent = `${completed} dari ${checklist.length} selesai`;
  progressPercent.textContent = `${percent}%`;
  localStorage.setItem(
    "sigap-checklist",
    JSON.stringify([...checklist].map((item) => item.checked)),
  );
}

const savedChecklist = JSON.parse(
  localStorage.getItem("sigap-checklist") || "[]",
);
checklist.forEach((item, index) => {
  item.checked = savedChecklist[index] || false;
  item.addEventListener("change", updateProgress);
});
updateProgress();

const mythCard = document.querySelector("#myth-card");
const mythText = document.querySelector("#myth-text");
const mythTag = mythCard ? mythCard.querySelector(".myth-tag") : null;
const mythHint = mythCard ? mythCard.querySelector(".myth-hint") : null;
let showingFact = false;

if (mythCard) {
  mythCard.addEventListener("click", () => {
    showingFact = !showingFact;
    mythCard.classList.toggle("is-fact", showingFact);
    mythTag.firstChild.textContent = showingFact ? "FAKTA " : "MITOS ";
    mythText.textContent = showingFact
      ? "Tidak semua kebakaran aman dipadamkan dengan air. Sesuaikan tindakan dengan sumber apinya."
      : "Semua kebakaran dapat dipadamkan dengan air.";
    mythHint.textContent = showingFact
      ? "Ketuk untuk kembali ke mitos"
      : "Ketuk untuk melihat faktanya";
  });
}

// Mobile Menu
const menuToggle = document.querySelector(".menu-toggle");
const siteHeader = document.querySelector(".site-header");
if (menuToggle && siteHeader) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    siteHeader.classList.toggle("nav-open", !isOpen);
  });

  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteHeader.classList.remove("nav-open");
    });
  });
}

// Dark Theme
const themeToggle = document.querySelector(".theme-toggle");
const savedTheme = localStorage.getItem("sigap-theme");
if (savedTheme === "dark") document.body.classList.add("dark-theme");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const darkMode = document.body.classList.toggle("dark-theme");
    localStorage.setItem("sigap-theme", darkMode ? "dark" : "light");
    themeToggle.textContent = darkMode ? "☀" : "☼";
  });
}

// Search
const searchButton = document.querySelector(".search-button");
const searchPanel = document.querySelector(".search-panel");
const searchInput = document.querySelector("#site-search");
const searchResults = document.querySelector("#search-results");
const searchableItems = [
  ...document.querySelectorAll(
    ".hero-story h1, .side-story strong, .news-card h3, .editor-card h3, .photo-row figcaption, .fact-copy h3",
  ),
];

if (searchButton && searchPanel) {
  searchButton.addEventListener("click", () => {
    const isOpen = searchPanel.classList.toggle("open");
    searchPanel.setAttribute("aria-hidden", String(!isOpen));
    if (isOpen) searchInput.focus();
  });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = "";
    if (!query) return;
    const matches = searchableItems.filter((item) =>
      item.textContent.toLowerCase().includes(query),
    );
    matches.slice(0, 6).forEach((item) => {
      const result = document.createElement("a");
      result.href = `#${item.closest("section, article")?.id || "top"}`;
      result.textContent = item.textContent.trim();
      result.addEventListener("click", () => {
        searchPanel.classList.remove("open");
        searchPanel.setAttribute("aria-hidden", "true");
      });
      searchResults.appendChild(result);
    });
    if (!matches.length)
      searchResults.innerHTML = "<span>Tidak ada artikel yang cocok.</span>";
  });
}

// Render dynamic news from the shared Supabase database
const dynamicContainer = document.getElementById("dynamic-news-container");
const dynamicSection = document.getElementById("berita-komunitas");
if (dynamicContainer && dynamicSection) {
  async function loadDynamicNews() {
    const { data: dynamicNews, error } = await window.sigapSupabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal memuat berita komunitas:", error.message);
      return;
    }

    if (dynamicNews && dynamicNews.length > 0) {
      dynamicSection.style.display = "block";
      dynamicNews.forEach((news) => {
        const article = document.createElement("article");
        article.className = "editor-card";
        article.innerHTML = `
          <img src="${news.image || "https://via.placeholder.com/300x165?text=No+Image"}" alt="News Image" onerror="this.src='https://via.placeholder.com/300x165?text=No+Image'">
          <div class="editor-card-content">
            <span class="label label-red"></span>
            <h3></h3>
            <p style="margin:10px 0; font-size:14px; color:var(--text-muted);"></p>
            <small></small>
          </div>
        `;
        article.querySelector(".label").textContent = news.category;
        article.querySelector("h3").textContent = news.title;
        article.querySelector("p").textContent = news.content;
        article.querySelector("small").textContent = news.date;
        dynamicContainer.appendChild(article);
        attachDynamicNewsClick(article, news);
      });
    }
  }

  loadDynamicNews();
}

const themeToggleMobile = document.querySelector(".theme-toggle-mobile");
if (themeToggleMobile) {
  themeToggleMobile.addEventListener("click", (e) => {
    e.preventDefault();
    const darkMode = document.body.classList.toggle("dark-theme");
    localStorage.setItem("sigap-theme", darkMode ? "dark" : "light");
    if (themeToggle) themeToggle.textContent = darkMode ? "?" : "�";
  });
}

// Full-page article reader
const articleReader = document.getElementById("article-reader");
const articleBack = document.querySelector(".article-back");
const mTitle = document.getElementById("modal-title");
const mCategory = document.getElementById("modal-category");
const mDate = document.getElementById("modal-date");
const mImage = document.getElementById("modal-image");
const mText = document.getElementById("modal-text");

function openModal(title, category, date, imageSrc, content) {
  if (!articleReader) return;
  mTitle.textContent = title || "Tanpa Judul";
  mCategory.textContent = category || "BERITA";
  mDate.textContent = date || "";
  mImage.src = imageSrc || "";
  mImage.style.display = imageSrc ? "block" : "none";
  mText.innerHTML = content || "<p>Isi berita tidak tersedia.</p>";
  articleReader.classList.add("open");
  articleReader.setAttribute("aria-hidden", "false");
  document.querySelector(".page-shell").setAttribute("aria-hidden", "true");
  window.scrollTo({ top: 0, behavior: "instant" });
  history.pushState({ article: true }, "", "#artikel");
}

function closeArticle() {
  if (!articleReader) return;
  articleReader.classList.remove("open");
  articleReader.setAttribute("aria-hidden", "true");
  document.querySelector(".page-shell").setAttribute("aria-hidden", "false");
  if (location.hash === "#artikel") history.back();
}

if (articleBack) {
  articleBack.addEventListener("click", closeArticle);
  window.addEventListener("popstate", () => {
    if (location.hash !== "#artikel") {
      articleReader.classList.remove("open");
      articleReader.setAttribute("aria-hidden", "true");
      document
        .querySelector(".page-shell")
        .setAttribute("aria-hidden", "false");
    }
  });
}

// Attach click to dynamic news in render function
function attachDynamicNewsClick(articleElement, newsData) {
  articleElement.style.cursor = "pointer";
  articleElement.addEventListener("click", () => {
    openModal(
      newsData.title,
      newsData.category,
      newsData.date,
      newsData.image,
      `<p>${newsData.content}</p><p><em>(Berita ini diunggah dari Dashboard Admin)</em></p>`,
    );
  });
}
