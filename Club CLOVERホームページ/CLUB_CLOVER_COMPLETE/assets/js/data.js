(function () {
  const STORAGE_KEY = "club-clover-casts-v1";
  const SETTINGS_KEY = "club-clover-site-settings-v1";

  const dayLabels = {
    mon: "月",
    tue: "火",
    wed: "水",
    thu: "木",
    fri: "金",
    sat: "土",
    sun: "日"
  };

  const defaultCasts = [
    {
      id: "cast-001",
      name: "RIN",
      kana: "りん",
      title: "Elegant Queen",
      message: "華やかな笑顔と落ち着いた会話で、特別な夜を上品に彩ります。",
      days: ["wed", "fri", "sat"],
      visible: true,
      order: 1,
      photo: "",
      pokepalaUrl: "",
      blogs: []
    },
    {
      id: "cast-002",
      name: "MIO",
      kana: "みお",
      title: "Sweet Rouge",
      message: "柔らかな空気感と明るい接客で、初めての方にも心地よい時間を。",
      days: ["tue", "thu", "sat"],
      visible: true,
      order: 2,
      photo: "",
      pokepalaUrl: "",
      blogs: []
    },
    {
      id: "cast-003",
      name: "SAKI",
      kana: "さき",
      title: "Luxury Smile",
      message: "洗練された立ち居振る舞いと会話で、CLOVERらしい華を添えます。",
      days: ["mon", "fri", "sun"],
      visible: true,
      order: 3,
      photo: "",
      pokepalaUrl: "",
      blogs: []
    }
  ];

  const defaultSiteSettings = {
    heroEyebrow: "KANAGAWA / NIGHT LOUNGE",
    heroCopy: "赤く艶めくソファとクリスタルの光が迎える、上質で華やかなナイトラウンジ。",
    newsText: "Club CLOVER 公式ホームページをリニューアル準備中。最新の出勤情報とブログ更新をご確認ください。",
    castLinkText: "在籍キャストのプロフィール、出勤曜日、ポケパラブログはこちらからご確認いただけます。",
    prices: [
      { label: "SET 60min", value: "お問い合わせください" },
      { label: "延長 30min", value: "お問い合わせください" },
      { label: "指名 / 場内", value: "お問い合わせください" },
      { label: "TAX / SERVICE", value: "店舗にてご案内" }
    ],
    systemTitle: "Party & VIP",
    systemText: "団体様、貸切、記念日のご利用もご相談ください。シーンに合わせたお席をご案内します。",
    shopName: "Club CLOVER",
    area: "神奈川",
    openHours: "20:00 - LAST",
    holiday: "店舗へご確認ください",
    reservationText: "ご来店日時、人数、ご希望のお席などを添えてお問い合わせください。内容を確認後、店舗よりご連絡いたします。",
    reservationEmail: "reservation@club-clover.jp",
    lineUrl: "https://line.me/R/ti/p/@clubclover",
    socialX: "https://x.com/clubclover",
    socialInstagram: "https://www.instagram.com/clubclover/",
    socialTikTok: "https://www.tiktok.com/@clubclover",
    socialLine: "https://line.me/R/ti/p/@clubclover"
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeCast(cast, index) {
    return {
      id: cast.id || `cast-${Date.now()}-${index}`,
      name: cast.name || "CAST",
      kana: cast.kana || "",
      title: cast.title || "Club CLOVER",
      message: cast.message || "",
      days: Array.isArray(cast.days) ? cast.days : [],
      visible: cast.visible !== false,
      order: Number(cast.order) || index + 1,
      photo: cast.photo || "",
      pokepalaUrl: cast.pokepalaUrl || "",
      blogs: normalizeBlogs(cast.blogs)
    };
  }

  function normalizeBlogs(blogs) {
    return (Array.isArray(blogs) ? blogs : [])
      .map((blog, index) => ({
        id: blog.id || `blog-${Date.now()}-${index}`,
        title: blog.title || "",
        url: blog.url || "",
        date: blog.date || ""
      }))
      .filter((blog) => blog.title && blog.url && blog.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function sortCasts(casts) {
    return casts
      .map(normalizeCast)
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "ja"));
  }

  function loadCasts() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        saveCasts(defaultCasts);
        return clone(defaultCasts);
      }
      const parsed = JSON.parse(saved);
      return sortCasts(Array.isArray(parsed) ? parsed : defaultCasts);
    } catch (error) {
      return clone(defaultCasts);
    }
  }

  function saveCasts(casts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortCasts(casts)));
  }

  function resetCasts() {
    saveCasts(defaultCasts);
    return clone(defaultCasts);
  }

  function normalizeSettings(settings) {
    const source = settings && typeof settings === "object" ? settings : {};
    const prices = Array.isArray(source.prices) ? source.prices : defaultSiteSettings.prices;

    return {
      ...defaultSiteSettings,
      ...source,
      prices: defaultSiteSettings.prices.map((price, index) => ({
        label: prices[index]?.label || price.label,
        value: prices[index]?.value || price.value
      }))
    };
  }

  function loadSettings() {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (!saved) {
        saveSettings(defaultSiteSettings);
        return clone(defaultSiteSettings);
      }
      return normalizeSettings(JSON.parse(saved));
    } catch (error) {
      return clone(defaultSiteSettings);
    }
  }

  function saveSettings(settings) {
    const normalized = normalizeSettings(settings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function resetSettings() {
    saveSettings(defaultSiteSettings);
    return clone(defaultSiteSettings);
  }

  function recentBlogPosts(casts, now = new Date()) {
    const border = new Date(now);
    border.setHours(0, 0, 0, 0);
    border.setDate(border.getDate() - 30);

    return sortCasts(casts)
      .filter((cast) => cast.visible)
      .flatMap((cast) =>
        normalizeBlogs(cast.blogs).map((blog) => ({
          ...blog,
          castId: cast.id,
          castName: cast.name,
          castKana: cast.kana,
          castPhoto: cast.photo,
          pokepalaUrl: cast.pokepalaUrl
        }))
      )
      .filter((blog) => {
        const date = new Date(blog.date);
        return !Number.isNaN(date.getTime()) && date >= border && date <= now;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function initials(name) {
    const clean = String(name || "C").trim();
    return clean.slice(0, 2).toUpperCase();
  }

  window.CLOVER = {
    STORAGE_KEY,
    SETTINGS_KEY,
    dayLabels,
    defaultCasts: clone(defaultCasts),
    defaultSiteSettings: clone(defaultSiteSettings),
    loadCasts,
    saveCasts,
    resetCasts,
    loadSettings,
    saveSettings,
    resetSettings,
    recentBlogPosts,
    sortCasts,
    escapeHtml,
    initials
  };
})();
