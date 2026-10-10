/* ==========================================================================
   SIGAPI — DATA ARTIKEL & RENDERER BERITA KOMUNITAS
   --------------------------------------------------------------------------
   - ARTICLES: katalog artikel redaksi (konten statis yang benar-benar ada
     di halaman ini). Dipakai untuk pemutar artikel, pencarian, dan tautan
     "baca lainnya".
   - loadCommunityNews(): mengambil berita komunitas dari tabel `news` pada
     Supabase (kontrak data asli proyek: title, category, content, image,
     date, created_at). Render daftar, filter kategori, dan state kosong.
   ========================================================================== */

const SIGAP_ARTICLES = [
  {
    id: "desa-ende",
    title: "Mengenal Desa Ende: menjaga tradisi, menyiapkan keselamatan",
    category: "Laporan utama",
    section: "Lingkungan",
    date: "14 September 2026",
    dateISO: "2026-09-14",
    readTime: "4 menit baca",
    image: "picture/optimized/desa%20ende%20v2-1000.webp",
    imageAlt: "Rumah tradisional di Desa Ende",
    excerpt:
      "Melihat lebih dekat karakter bangunan, ruang berkumpul, dan kesiapsiagaan masyarakat Desa Wisata Sasak Ende.",
    body: [
      "Desa Wisata Sasak Ende dikenal dengan rumah tradisional, ruang berkumpul warga, dan aktivitas budaya yang masih berjalan. Pola permukiman yang rapat dengan jalan setapak membuat setiap ruang terbuka memiliki peran penting — tidak hanya untuk kegiatan sehari-hari, tetapi juga saat keadaan darurat.",
      "Karena itu, mengenali karakter lingkungan adalah langkah pertama kesiapsiagaan. Di mana pintu keluar terdekat? Ke mana keluarga berkumpul bila rumah tidak bisa dimasuki? Siapa tetangga yang perlu dibantu lebih dulu? Pertanyaan sederhana ini jauh lebih berguna saat sudah dijawab sebelum keadaan mendesak.",
      "Tradisi dan keselamatan tidak perlu bertentangan. Ruang berkumpul yang biasa dipakai warga dapat sekaligus menjadi ruang aman, asalkan jalurnya dikenal bersama dan dijaga tetap terbuka.",
    ],
    related: ["ruang-aman", "gerbang", "karakter-desa"],
  },
  {
    id: "ruang-aman",
    title: "Ruang berkumpul warga juga bisa menjadi ruang aman",
    category: "Budaya & lingkungan",
    section: "Lingkungan",
    date: "14 September 2026",
    dateISO: "2026-09-14",
    readTime: "4 menit baca",
    image: "picture/optimized/peresean%20desa%20ende-1000.webp",
    imageAlt: "Peresean di Desa Ende",
    excerpt:
      "Lapangan dan balai desa bukan hanya tempat bermusyawarah. Di situ pula warga bisa berlatih berjaga, berkumpul, dan saling memberi tahu saat keadaan darurat.",
    body: [
      "Di Desa Ende, ruang terbuka seperti lapangan dan area sekitar balai desa menjadi titik bertemunya warga. Saat ada kegiatan, ruang itu terisi penuh; saat keadaan mendesak, ruang yang sama bisa menjadi titik kumpul yang sudah dikenal semua orang.",
      "Agar ruang terbuka benar-benar berfungsi sebagai ruang aman, ada beberapa hal yang perlu dijaga: akses jalan menuju sana tidak terhalang, jumlah orang yang bisa menampung sudah diperkirakan bersama, dan setiap keluarga tahu jalan tercepat menuju tempat itu dari rumahnya.",
      "Kebiasaan kecil — misalnya selalu memperhatikan siapa tetangga di sebelah rumah dan siapa yang mungkin membutuhkan bantuan lebih dulu — membuat ruang berkumpul bekerja bukan hanya sebagai fasilitas, tetapi sebagai sistem saling menjaga.",
    ],
    related: ["desa-ende", "gerbang", "karakter-desa"],
  },
  {
    id: "gerbang",
    title: "Gerbang desa dan pentingnya mengenali titik kumpul",
    category: "Lingkungan",
    section: "Lingkungan",
    date: "09 Oktober 2026",
    dateISO: "2026-10-09",
    readTime: "3 menit baca",
    image: "picture/optimized/gerbang%20desa%20ende-640.webp",
    imageAlt: "Gerbang Desa Wisata Sasak Ende",
    excerpt:
      "Gerbang desa bukan sekadar penanda batas. Ia menjadi rujukan arah yang mudah dikenali ketika warga perlu berkumpul atau melapor.",
    body: [
      "Gerbang desa adalah salah satu titik yang paling mudah dikenali warga maupun orang luar. Dalam keadaan normal ia menjadi identitas tempat; dalam keadaan darurat, rujukan yang sama bisa dipakai sebagai patokan arah menuju titik kumpul.",
      "Yang penting bukan hanya keberadaan gerbang, tetapi apakah setiap keluarga tahu titik kumpul yang disepakati dan jalur tercepat untuk mencapainya. Titik kumpul sebaiknya berada di luar bangunan, jauh dari asap, dan mudah dijangkau tanpa harus menyeberang jalur yang macet.",
      "Diskusikan bersama tetangga: di mana titik kumpulmu, dan siapa yang bertanggung jawab memastikan anak-anak serta lansia sampai ke sana.",
    ],
    related: ["desa-ende", "ruang-aman", "rencana-evakuasi"],
  },
  {
    id: "karakter-desa",
    title: "Kenali karakter desamu sebelum membuat rencana evakuasi",
    category: "Lingkungan",
    section: "Lingkungan",
    date: "14 September 2026",
    dateISO: "2026-09-14",
    readTime: "3 menit baca",
    image: "picture/optimized/gerbang%20desa%20ende-1000.webp",
    imageAlt: "Jalan di Desa Ende",
    excerpt:
      "Jalur keluar, titik kumpul, dan akses bantuan perlu diketahui bersama sebelum keadaan mendesak.",
    body: [
      "Setiap permukiman punya karakter berbeda: ada yang berkelompok di sekitar lapangan, ada yang memanjang mengikuti jalan, dan ada yang berada di lereng. Karakter ini menentukan seberapa cepat warga bisa keluar dan ke mana arah paling aman.",
      "Sebelum membuat rencana evakuasi, identifikasi lebih dahulu: berapa akses keluar dari lingkunganmu? Apakah semuanya bisa dilalui kendaraan darurat? Apakah ada gang sempit yang bisa menjadi jalan alternatif bagi pejalan kaki?",
      "Rencana yang baik lahir dari pengenalan lingkungan, bukan dari pola umum. Libatkan warga yang sudah lama tinggal karena mereka mengenali jalur yang tidak selalu terlihat di peta.",
    ],
    related: ["gerbang", "ruang-aman", "rencana-evakuasi"],
  },
  {
    id: "kebiasaan",
    title: "5 kebiasaan sederhana untuk rumah yang lebih aman",
    category: "Pencegahan",
    section: "Pencegahan",
    date: "08 Oktober 2026",
    dateISO: "2026-10-08",
    readTime: "3 menit baca",
    image: "picture/optimized/desa%20ende-640.webp",
    imageAlt: "Rumah tradisional Desa Ende",
    excerpt:
      "Kebiasaan kecil yang dilakukan rutin lebih bermakna daripada peralatan mahal yang tidak pernah diperiksa.",
    body: [
      "1. Periksa kabel dan stop kontak. Cari tanda berdebu, terkelupas, atau berbau gosong.",
      "2. Jauhkan benda mudah terbakar dari sumber api — tungku, kompor, lilin, dan pembakar nyala api.",
      "3. Jaga jalur keluar selalu terbuka. Barang yang menumpuk di pintu atau tangga memperlambat evakuasi.",
      "4. Siapkan alat pemadam sederhana: APAR kecil, selang air, atau pasir kering yang mudah dijangkau.",
      "5. Biasakan membahas rencana kejadian bersama keluarga — titik kumpul, siapa memanggil bantuan, siapa membantu anak dan lansia.",
    ],
    related: ["pencegahan-listrik", "pencegahan-dapur", "rencana-evakuasi"],
  },
  {
    id: "kabel-panas",
    title: "Kabel panas adalah tanda yang tidak boleh diabaikan",
    category: "Pencegahan",
    section: "Pencegahan",
    date: "13 September 2026",
    dateISO: "2026-09-13",
    readTime: "3 menit baca",
    image: "picture/optimized/desa%20ende-640.webp",
    imageAlt: "Rumah tradisional Desa Ende",
    excerpt:
      "Periksa sumber listrik sebelum masalah kecil menjadi bahaya besar bagi keluarga.",
    body: [
      "Stop kontak, steker, atau kabel yang terasa hangat saat disentuh adalah peringatan bahwa beban listrik melebihi kapasitas yang aman. Bau gosong, percikan kecil, atau lampu yang berkedip juga termasuk tanda yang harus ditindaklanjuti.",
      "Tindakan pertama adalah mengurangi beban: cabut perangkat yang tidak dipakai dan hindari menyambung banyak perangkat pada satu stop kontak. Jika kabel sudah mengelupas atau steker terasa panas terus-menerus, perbaiki atau ganti sebelum digunakan kembali.",
      "Untuk rumah dengan instalasi lama, pemeriksaan berkala oleh petugas yang kompeten adalah investasi keselamatan, bukan biaya tambahan.",
    ],
    related: ["kebiasaan", "pencegahan-listrik", "pencegahan-dapur"],
  },
  {
    id: "api-membesar",
    title: "Apa yang harus dilakukan saat api mulai membesar?",
    category: "Darurat",
    section: "Sigap Api",
    date: "12 September 2026",
    dateISO: "2026-09-12",
    readTime: "4 menit baca",
    image: null,
    excerpt:
      "Api yang masih kecil bisa dipadamkan. Api yang sudah membesar butuh keputusan cepat: keluar, jauhi, panggil bantuan.",
    body: [
      "Saat api masih sangat kecil dan alat pemadam ada dalam jangkauan, memadamkannya bisa dilakukan dengan tenang. Namun begitu api mencapai tinggi lebih dari satu orang, menghasilkan asap tebal, atau memblokir jalur keluar, keputusan yang benar adalah keluar.",
      "Berhenti memadamkan bila api membesar, jika asap membuat sulit bernapas, bila bahan di sekitarnya mulai terbakar, atau bila instingmu mengatakan bahaya. Tidak ada barang yang lebih berharga daripada keselamatan.",
      "Setelah keluar, jangan kembali masuk. Beri tahu petugas bila ada orang atau hewan yang masih berada di dalam dan biarkan penanganan dilakukan oleh petugas.",
    ],
    related: ["rencana-evakuasi", "kebiasaan", "pencegahan-pemadam"],
  },
  {
    id: "rencana-evakuasi",
    title: "Sudahkah keluarga punya rencana evakuasi?",
    category: "Kesiapsiagaan",
    section: "Kesiapsiagaan",
    date: "11 September 2026",
    dateISO: "2026-09-11",
    readTime: "3 menit baca",
    image: null,
    excerpt:
      "Rencana evakuasi keluarga yang baik sederhana: siapa pergi ke mana, lewat mana, dan di mana berkumpul.",
    body: [
      "Rencana evakuasi keluarga tidak perlu rumit. Cukup satu halaman yang berisi: dua jalur keluar dari rumah, satu titik kumpul di luar, urutan siapa membantu siapa, dan satu kontak darurat yang disepakati.",
      "Libatkan semua anggota keluarga saat menyusunnya, termasuk anak-anak. Anak yang ikut berdiskusi lebih tenang saat keadaan darurat karena tahu apa yang harus dilakukan.",
      "Lakukan latihan ringan secara berkala — misalnya sekali dalam beberapa bulan — sehingga jalur keluar dan titik kumpul benar-benar hafal, bukan hanya tertulis.",
    ],
    related: ["kebiasaan", "api-membesar", "pencegahan-keluarga"],
  },
  {
    id: "material-alami",
    title: "Material alami dan risiko kebakaran: apa yang perlu disiapkan?",
    category: "Mitigasi desa",
    section: "Pencegahan",
    date: "12 September 2026",
    dateISO: "2026-09-12",
    readTime: "4 menit baca",
    image: "picture/optimized/desa%20ende-640.webp",
    imageAlt: "Rumah tradisional Desa Ende",
    excerpt:
      "Material alami banyak dipakai pada rumah tradisional. Memahami karakternya membantu menentukan langkah pencegahan yang tepat.",
    body: [
      "Rumah tradisional di Desa Ende umumnya menggunakan material alami seperti kayu, bambu, ijuk, dan anyaman. Material ini memiliki karakteristik masing-masing: ada yang mudah terbakar, ada pula yang tahan lebih lama tetapi tetap memerlukan perhatian.",
      "Yang penting bukan mengganti seluruh bahan, melainkan mengenali bagian mana yang paling rentan. Atap dari ijuk, dinding anyaman, dan sambungan kayu adalah area yang perlu diperiksa lebih sering.",
      "Langkkah praktisnya sederhana: jauhkan sumber api dari material yang mudah terbakar, jaga sirkulasi agar material tidak terlalu kering, dan siapkan alat pemadam sederhana yang mudah dijangkau dari dapur maupun area luar.",
      "Dengan memahami karakter bahan bangunan, langkah pencegahan menjadi lebih tepat sasaran — bukan sekadar aturan umum.",
    ],
    related: ["warga-tahu", "pencegahan-listrik", "rencana-keluarga"],
  },
  {
    id: "warga-tahu",
    title: "Ketika seluruh warga tahu harus ke mana",
    category: "Kelompok warga",
    section: "Lingkungan",
    date: "10 September 2026",
    dateISO: "2026-09-10",
    readTime: "3 menit baca",
    image: "picture/optimized/peresean%20v2%20desa%20ende.webp",
    imageAlt: "Warga Desa Ende",
    excerpt:
      "Kesiapsiagaan yang baik bukan milik satu rumah saja. Ketika semua warga tahu arah dan titik kumpul, evakuasi berjalan lebih tertib.",
    body: [
      "Kesiapsiagaan paling kuat tidak berhenti di satu rumah. Saat seluruh warga mengetahui arah aman dan tempat berkumpul, evakuasi menjadi lebih tertib dan tidak ada yang salah menentukan arah.",
      "Kegiatan bersama seperti kerja bakti, rapat warga, atau latihan sederhana dapat dimanfaatkan untuk menyinggung rencana kejadian. Tidak perlu acara besar; cukup kesepakatan bersama tentang titik kumpul dan siapa yang membantu siapa.",
      "Informasi juga penting: siapa yang punya kendaraan dapat menjemput, siapa yang mengenal jalan alternatif, dan siapa yang perlu dibantu lebih dulu. Pengetahuan ini hanya muncul ketika warga saling mengenal.",
      "Desa yang siap adalah desa yang saling menjaga — bukan desa dengan peralatan paling lengkap.",
    ],
    related: ["desa-ende", "karakter-desa", "rencana-evakuasi"],
  },
  {
    id: "rencana-keluarga",
    title: "5 hal yang harus ada dalam rencana keluarga",
    category: "Checklist",
    section: "Kesiapsiagaan",
    date: "08 September 2026",
    dateISO: "2026-09-08",
    readTime: "4 menit baca",
    image: null,
    excerpt:
      "Jalur keluar, titik kumpul, urutan evakuasi, kontak darurat, dan latihan berkala — lima hal yang bisa disiapkan mulai malam ini.",
    body: [
      "1. Dua jalur keluar. Tentukan lebih dari satu jalan keluar dari rumah, misalnya pintu utama dan jendela atau pintu belakang.",
      "2. Satu titik kumpul. Pilih tempat di luar rumah yang aman dan mudah dikenali semua anggota keluarga.",
      "3. Urutan evakuasi. Siapa membantu anak-anak, lansia, atau anggota keluarga yang sulit bergerak sendiri.",
      "4. Kontak darurat. Simpan nomor layanan darurat dan satu kontak keluarga luar kota di tempat yang mudah dilihat.",
      "5. Latihan berkala. Lakukan simulasi singkat beberapa bulan sekali agar jalur keluar dan titik kumpul benar-benar hafal.",
    ],
    related: ["rencana-evakuasi", "kebiasaan", "pencegahan-keluarga"],
  },
  {
    id: "pencegahan-listrik",
    title: "Periksa instalasi listrik rumah",
    category: "Pencegahan",
    section: "Pencegahan",
    date: "Panduan 01",
    dateISO: null,
    readTime: "2 menit baca",
    image: null,
    excerpt:
      "Kabel yang terkelupas, colokan berdebu, atau stop kontak yang terasa panas adalah tanda yang perlu segera diperbaiki.",
    body: [
      "Lakukan pemeriksaan visual sederhana setiap bulan: lihat kabel dan steker dari dekat, raba permukaan stop kontak, dan perhatikan apakah ada bau tidak sedap saat perangkat dinyalakan.",
      "Hindari menarik steker dengan cara menarik kabel, serta jangan memasang banyak sambungan pada satu stop kontak. Beban berlebih adalah penyebab panas yang paling umum di rumah tangga.",
      "Bila kamu tidak yakin dengan kondisi instalasi, mintalah pemeriksaan oleh petugas yang kompeten. Risiko membaikkan sendiri bisa lebih besar daripada biaya memanggil teknisi.",
    ],
    related: ["kabel-panas", "kebiasaan", "pencegahan-dapur"],
  },
  {
    id: "pencegahan-dapur",
    title: "Awasi api di dapur",
    category: "Pencegahan",
    section: "Pencegahan",
    date: "Panduan 02",
    dateISO: null,
    readTime: "2 menit baca",
    image: null,
    excerpt:
      "Jangan tinggalkan kompor menyala terlalu lama, dan jauhkan benda mudah terbakar dari tungku atau burner.",
    body: [
      "Dapur adalah bagian rumah dengan sumber api paling sering digunakan. Selama memasak, jauhkan handuk, plastik, kain pel, dan kemasan dari tungku atau burner.",
      "Keluar dari dapur walau sebentar? Matikan nyala api. Kebakaran rumah sering terjadi pada saat penghuni berpikir hanya akan meninggalkan kompor beberapa menit.",
      "Simpan selimut basar atau handuk tebal basah di tempat yang mudah dijangkau untuk menutup api kecil pada wajan atau panci yang menyala.",
    ],
    related: ["kebiasaan", "kabel-panas", "pencegahan-pemadam"],
  },
  {
    id: "pencegahan-jalur",
    title: "Jaga jalur keluar tetap terbuka",
    category: "Pencegahan",
    section: "Pencegahan",
    date: "Panduan 03",
    dateISO: null,
    readTime: "2 menit baca",
    image: null,
    excerpt:
      "Pintu, gang, dan tangga yang tertutup barang akan memperlambat evakuasi saat keadaan mendesak.",
    body: [
      "Asap memenuhi ruangan dengan cepat, dan orang yang panik cenderung bergerak lebih lambat dari perkiraan. Setiap benda yang menghalangi pintu, gang, atau tangga memperbesar risiko.",
      "Pastikan pintu utama dan jendela dapat dibuka dari dalam tanpa menggunakan kunci tambahan. Kunci yang sulit dibuka saat gelap menjadi hambatan nyata.",
      "Jika ada tetangga yang jalurnya sama, diskusikan bersama siapa yang menjaga akses umum dan bagaimana saling memberi tahu bila terjadi keadaan darurat.",
    ],
    related: ["rencana-evakuasi", "kebiasaan", "pencegahan-keluarga"],
  },
  {
    id: "pencegahan-pemadam",
    title: "Siapkan alat pemadam sederhana",
    category: "Pencegahan",
    section: "Pencegahan",
    date: "Panduan 04",
    dateISO: null,
    readTime: "2 menit baca",
    image: null,
    excerpt:
      "APAR kecil, selang air, atau pasir kering membantu menangani api yang masih sangat kecil dan terkendali.",
    body: [
      "Alat pemadam sederhana tidak harus mahal. Yang penting mudah dijangkau, kondisinya berfungsi, dan semua anggota keluarga tahu letaknya.",
      "Periksa alat pemadam secara berkala: tekanan APAR dalam batas aman, selang tidak berlubang, dan pasir kering tidak basah. Alat yang tidak terawat hanya memberikan rasa aman yang palsu.",
      "Catat juga nomor layanan darurat dan simpan di tempat yang mudah dilihat, bukan hanya tersimpan di ponsel.",
    ],
    related: ["api-membesar", "kebiasaan", "pencegahan-jalur"],
  },
  {
    id: "pencegahan-keluarga",
    title: "Latih keluarga setiap waktu",
    category: "Pencegahan",
    section: "Pencegahan",
    date: "Panduan 05",
    dateISO: null,
    readTime: "2 menit baca",
    image: null,
    excerpt:
      "Bahas titik kumpul, urutan evakuasi, dan siapa yang memanggil bantuan. Latihan kecil membuat semua orang lebih tenang.",
    body: [
      "Kesiapsiagaan keluarga bukan satu percakapan, melainkan kebiasaan. Diskusi singkat beberapa menit sudah cukup untuk memastikan setiap orang tahu perannya.",
      "Tentukan siapa yang membantu anggota keluarga yang membutuhkan bantuan, siapa yang mengambil jalur tertentu, dan siapa yang memanggil bantuan setelah keluar.",
      "Setelah berlatih, evaluasi: apakah ada bagian yang membingungkan? Perbaiki rencana, lalu ulangi. Rencana yang berulang menjadi kebiasaan.",
    ],
    related: ["rencana-evakuasi", "kebiasaan", "pencegahan-jalur"],
  },
];

/* --------------------------------------------------------------------------
   PENCARIAN — indeks sederhana atas judul, kategori, dan cuplikan
   -------------------------------------------------------------------------- */
function sigapSearch(query) {
  const q = String(query || "")
    .trim()
    .toLowerCase();
  if (!q) return [];
  return SIGAP_ARTICLES.filter((a) =>
    [a.title, a.category, a.section, a.excerpt]
      .join(" ")
      .toLowerCase()
      .includes(q),
  ).slice(0, 8);
}

/* --------------------------------------------------------------------------
   BERITA KOMUNITAS — Supabase
   -------------------------------------------------------------------------- */
const CommunityNews = {
  items: [],
  activeCategory: "Semua",
  rendered: 0,

  async fetch() {
    if (!window.sigapSupabase) {
      throw new Error("Konfigurasi Supabase belum termuat.");
    }
    const { data, error } = await window.sigapSupabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  categories() {
    const set = new Set();
    this.items.forEach((n) => {
      if (n.category) set.add(String(n.category).trim());
    });
    return [...set].sort((a, b) => a.localeCompare(b, "id"));
  },

  visible() {
    const items =
      this.activeCategory === "Semua"
        ? this.items
        : this.items.filter(
            (n) => String(n.category).trim() === this.activeCategory,
          );
    return items;
  },

  init(host) {
    if (!host) return;
    this.list = host.querySelector("#news-list");
    this.state = host.querySelector("#news-state");
    this.filters = host.querySelector("#news-filters");

    if (this.filters) {
      this.filters.addEventListener("click", (e) => {
        const btn = e.target.closest(".chip");
        if (!btn) return;
        this.activeCategory = btn.dataset.category || "Semua";
        this.filters
          .querySelectorAll(".chip")
          .forEach((c) =>
            c.setAttribute(
              "aria-pressed",
              String(c.dataset.category === this.activeCategory),
            ),
          );
        this.renderList();
      });
    }

    this.load();
  },

  renderFilters() {
    if (!this.filters) return;
    if (this.items.length === 0) {
      this.filters.hidden = true;
      return;
    }
    this.filters.hidden = false;
    const cats = ["Semua", ...this.categories()];
    this.filters.innerHTML = cats
      .map(
        (c) => `
        <button class="chip" type="button" data-category="${sigapEscape(c)}"
          aria-pressed="${c === this.activeCategory}">
          ${sigapEscape(c)}
          <span class="chip__count">${
            c === "Semua" ? this.items.length : this.countOf(c)
          }</span>
        </button>`,
      )
      .join("");
  },

  countOf(category) {
    return this.items.filter(
      (n) => String(n.category).trim() === category,
    ).length;
  },

  renderSkeleton() {
    if (!this.list) return;
    this.list.innerHTML = Array.from({ length: 3 })
      .map(
        () => `
        <article class="card card--surface">
          <span class="skeleton sk-media"></span>
          <span class="skeleton sk-line sk-line--w40"></span>
          <span class="skeleton sk-line sk-line--w80" style="height:1.5rem"></span>
          <span class="skeleton sk-line sk-line--w60"></span>
        </article>`,
      )
      .join("");
  },

  renderError(message) {
    if (this.state) {
      this.state.innerHTML = `
        <div class="state state--center">
          <span class="state__icon state__icon--error">
            <svg aria-hidden="true"><use href="#i-alert"/></svg>
          </span>
          <span class="state__title">Berita komunitas belum dapat dimuat</span>
          <span class="state__text">${sigapEscape(message)}</span>
          <span class="state__actions">
            <button class="btn btn--ghost btn--sm" type="button" id="news-retry">
              <svg aria-hidden="true"><use href="#i-refresh"/></svg> Coba lagi
            </button>
            <a class="btn btn--ghost btn--sm" href="admin.html">
              <svg aria-hidden="true"><use href="#i-lock"/></svg> Dashboard admin
            </a>
          </span>
        </div>`;
      const retry = this.state.querySelector("#news-retry");
      if (retry) retry.addEventListener("click", () => this.load());
    }
    if (this.list) this.list.innerHTML = "";
  },

  renderEmpty() {
    if (this.state) {
      this.state.innerHTML = `
        <div class="state state--center">
          <img
            class="state__photo"
            src="picture/optimized/peresean%20v2%20desa%20ende.webp"
            alt="Warga Desa Ende mengikuti tradisi peresean sebagai ruang berkumpul komunitas"
            width="1000"
            height="563"
            loading="lazy"
            decoding="async"
          />
          <span class="state__icon">
            <svg aria-hidden="true"><use href="#i-inbox"/></svg>
          </span>
          <span class="state__title">Belum ada berita komunitas</span>
          <span class="state__text">
            Berita yang dipublikasikan melalui dashboard admin akan muncul di
            sini bersama kategori dan tanggal terbitnya.
          </span>
          <span class="state__actions">
            <a class="btn btn--primary btn--sm" href="admin.html">
              <svg aria-hidden="true"><use href="#i-plus"/></svg> Tulis berita
            </a>
            <a class="btn btn--ghost btn--sm" href="#terkini">
              <svg aria-hidden="true"><use href="#i-arrow-right"/></svg> Berita redaksi
            </a>
          </span>
        </div>`;
    }
    if (this.list) this.list.innerHTML = "";
  },

  renderList() {
    if (!this.list) return;
    const items = this.visible();
    this.list.innerHTML = "";
    if (this.state) this.state.innerHTML = "";

    if (items.length === 0) {
      this.renderEmpty();
      return;
    }

    items.forEach((news, i) => {
      const title = news.title || "Tanpa judul";
      const category = news.category || "Berita";
      const date = news.date || "";
      const image = news.image || "";
      const excerpt = news.content || "";
      const article = document.createElement("article");
      article.className = "card card--surface";
      article.innerHTML = `
        <span class="card__media card__media--wide">
          ${
            image
              ? `<img src="${sigapEscape(image)}" alt="Foto berita: ${sigapEscape(title)}"
                   loading="lazy" decoding="async" width="1000" height="563" />`
              : `<span class="rail__glyph" style="width:100%;height:100%">
                   <svg aria-hidden="true"><use href="#i-flame"/></svg>
                 </span>`
          }
        </span>
        <span class="card__body">
          <span class="card__kicker">
            <span class="tag tag--accent">${sigapEscape(category)}</span>
            <span class="micro">${sigapEscape(date)}</span>
          </span>
          <span class="card__title" style="font-size: var(--fs-d3)">${sigapEscape(title)}</span>
          <span class="card__excerpt">${sigapEscape(excerpt)}</span>
          <span class="card__foot">
            <span class="text-link" style="pointer-events:none">
              Baca berita <svg aria-hidden="true"><use href="#i-arrow-right"/></svg>
            </span>
          </span>
        </span>`;
      article.style.cursor = "pointer";
      article.addEventListener("click", () => {
        if (window.SigapReader) {
          window.SigapReader.open({
            title,
            category,
            section: "Berita komunitas",
            date,
            dateISO: null,
            readTime: null,
            image: image || null,
            imageAlt: "Foto berita: " + title,
            excerpt,
            body: [
              excerpt,
              "<em>(Berita ini diunggah dari Dashboard Admin SIGAPI.)</em>",
            ],
            related: [],
            community: news,
          });
        }
      });
      this.list.appendChild(article);
    });
  },

  async load() {
    this.renderSkeleton();
    try {
      const data = await this.fetch();
      this.items = data;
      this.activeCategory = "Semua";
      this.renderFilters();
      if (this.items.length === 0) {
        this.renderEmpty();
      } else {
        this.renderList();
      }
    } catch (err) {
      console.error("Gagal memuat berita komunitas:", err);
      this.renderError(
        "Basis data berita komunitas tidak dapat dihubungi. Pastikan koneksi aktif, lalu coba lagi.",
      );
    }
  },
};

function sigapEscape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Ekspos katalog agar dapat dipakai script.js (pencarian & pembaca artikel) */
window.SIGAP_ARTICLES = SIGAP_ARTICLES;

/* Inisialisasi daftar berita komunitas saat DOM siap */
document.addEventListener("DOMContentLoaded", () => {
  const host = document.getElementById("komunitas");
  if (host) CommunityNews.init(host);
});
