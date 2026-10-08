document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("admin-form");
  const newsList = document.getElementById("admin-news-list");
  const fileInput = document.getElementById("news-image");
  const dropAreaText = document.querySelector(".file-drop-area p");
  const supabase = window.sigapSupabase;

  function showError(message) {
    newsList.innerHTML = `<div class="empty-state">${message}</div>`;
  }

  function renderAdminNews(dynamicNews) {
    newsList.innerHTML = "";
    if (dynamicNews.length === 0) {
      newsList.innerHTML =
        '<div class="empty-state">Belum ada berita yang dipublikasikan.<br>Berita yang kamu buat akan muncul di sini.</div>';
      return;
    }

    dynamicNews.forEach((news) => {
      const div = document.createElement("div");
      div.className = "news-item";
      div.innerHTML = `
        <img src="${news.image}" alt="News Image" onerror="this.src='https://via.placeholder.com/120x80?text=No+Image'">
        <div class="news-item-content">
          <h3></h3>
          <span style="font-size: 12px; font-weight: bold; color: var(--primary);"></span>
          <p></p>
          <button class="delete-btn" data-id="${news.id}">Hapus</button>
        </div>
      `;
      div.querySelector("h3").textContent = news.title;
      div.querySelector("span").textContent = news.category;
      div.querySelector("p").textContent = news.content;
      newsList.appendChild(div);
    });

    newsList.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const { error } = await supabase
          .from("news")
          .delete()
          .eq("id", button.dataset.id);

        if (error) {
          alert(`Berita gagal dihapus: ${error.message}`);
          return;
        }

        await loadNews();
      });
    });
  }

  async function loadNews() {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showError(`Gagal memuat berita: ${error.message}`);
      return;
    }

    renderAdminNews(data || []);
  }

  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files.length > 0) {
      dropAreaText.innerHTML = `File terpilih: <strong>${fileInput.files[0].name}</strong>`;
    } else {
      dropAreaText.innerHTML =
        "Tarik & letakkan foto di sini, atau <strong>Pilih File</strong> dari komputermu.";
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector(".submit-btn");
    submitButton.disabled = true;

    const title = document.getElementById("news-title").value.trim();
    const category = document.getElementById("news-category").value.trim();
    const content = document.getElementById("news-content").value.trim();
    const selectedFile = fileInput.files[0];

    try {
      let image = null;
      if (selectedFile) {
        if (selectedFile.size > 2 * 1024 * 1024) {
          throw new Error("Ukuran foto maksimal 2MB.");
        }

        image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Foto gagal dibaca."));
          reader.readAsDataURL(selectedFile);
        });
      }

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

      if (error) throw new Error(error.message);

      form.reset();
      dropAreaText.innerHTML =
        "Tarik & letakkan foto di sini, atau <strong>Pilih File</strong> dari komputermu.";
      await loadNews();
      alert("Berita berhasil dipublikasikan!");
    } catch (error) {
      alert(`Berita gagal dipublikasikan: ${error.message}`);
    } finally {
      submitButton.disabled = false;
    }
  });

  if (!supabase) {
    showError("Konfigurasi Supabase belum termuat.");
    return;
  }

  await loadNews();
});
