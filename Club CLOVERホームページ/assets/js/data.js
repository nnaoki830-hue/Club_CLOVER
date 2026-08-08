(function () {
  const STORAGE_KEY = "club-clover-casts-v1";
  const SETTINGS_KEY = "club-clover-site-settings-v1";
  const SCHEDULE_KEY = "club-clover-schedule-v1";
  const NEWS_KEY = "club-clover-pickup-news-v1";
  let memoryCasts = null;

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
      profile: "落ち着いた雰囲気と華やかな笑顔で、初めてのお客様にも心地よい時間をお届けします。",
      birthday: "",
      age: "",
      height: "",
      bloodType: "",
      qa: [],
      sns: {},
      days: ["wed", "fri", "sat"],
      visible: true,
      order: 1,
      createdAt: "2026-07-12",
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
      profile: "自然体の会話と明るい空気づくりが得意です。楽しく過ごしたい夜にぜひ会いに来てください。",
      birthday: "",
      age: "",
      height: "",
      bloodType: "",
      qa: [],
      sns: {},
      days: ["tue", "thu", "sat"],
      visible: true,
      order: 2,
      createdAt: "2026-07-12",
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
      profile: "上品でゆったりした時間を大切にしています。大人の夜に合う丁寧なおもてなしを心がけています。",
      birthday: "",
      age: "",
      height: "",
      bloodType: "",
      qa: [],
      sns: {},
      days: ["mon", "fri", "sun"],
      visible: true,
      order: 3,
      createdAt: "2026-07-12",
      photo: "",
      pokepalaUrl: "",
      blogs: []
    }
  ];

  const defaultSiteSettings = {
    heroEyebrow: "KANAGAWA / NIGHT LOUNGE",
    heroCopy: "赤く艶めくソファとクリスタルの光が迎える、上質で華やかなナイトラウンジ。",
    newsText: "Club CLOVER 公式ホームページをリニューアル準備中。最新の出勤情報とブログ更新をご確認ください。",
    castLinkText: "在籍キャストのプロフィール、SNS、ポケパラブログはこちらからご確認いただけます。",
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
    socialLine: "https://line.me/R/ti/p/@clubclover",
    recruitHeroText: "キャスト・黒服スタッフともに募集中。未経験の方も、経験を活かしたい方も、華やかな空間で自分らしく働けます。",
    recruitEmail: "recruit@club-clover.jp",
    recruitCastTime: "20:00 - LAST / 週1日から相談可",
    recruitCastPay: "面接時にご案内",
    recruitCastBenefit: "未経験歓迎、日払い相談、送り相談",
    recruitStaffTime: "18:00 - LAST / シフト相談可",
    recruitStaffPay: "面接時にご案内",
    recruitStaffWork: "ホール業務、キャストサポート、店舗運営補助",
    recruitNote: "20歳未満の方の応募はご遠慮ください。勤務条件の詳細は面接時にご案内します。"
  };

  const defaultPickupNews = [
    {
      id: "news-001",
      date: "2026-07-12",
      title: "ピックアップニュース",
      text: "Club CLOVERの最新情報をこちらでお知らせします。",
      image: ""
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeCastSns(sns) {
    const source = sns && typeof sns === "object" ? sns : {};
    return {
      x: source.x || "",
      instagram: source.instagram || "",
      tiktok: source.tiktok || "",
      line: source.line || ""
    };
  }

  function normalizeQa(items) {
    return (Array.isArray(items) ? items : [])
      .map((item, index) => ({
        id: item.id || `qa-${Date.now()}-${index}`,
        question: item.question || "",
        answer: item.answer || ""
      }))
      .filter((item) => item.question || item.answer);
  }

  function normalizeCast(cast, index) {
    return {
      id: cast.id || `cast-${Date.now()}-${index}`,
      name: cast.name || "CAST",
      kana: cast.kana || "",
      title: cast.title || "Club CLOVER",
      message: cast.message || "",
      profile: cast.profile || "",
      birthday: cast.birthday || "",
      age: cast.age || "",
      height: cast.height || "",
      bloodType: cast.bloodType || "",
      qa: normalizeQa(cast.qa),
      sns: normalizeCastSns(cast.sns),
      days: Array.isArray(cast.days) ? cast.days : [],
      visible: cast.visible !== false,
      order: Number(cast.order) || index + 1,
      createdAt: cast.createdAt || dateKey(new Date()),
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
    if (memoryCasts) return clone(memoryCasts);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        saveCasts(defaultCasts);
        return clone(defaultCasts);
      }
      const parsed = JSON.parse(saved);
      memoryCasts = sortCasts(Array.isArray(parsed) ? parsed : defaultCasts);
      return clone(memoryCasts);
    } catch (error) {
      return memoryCasts ? clone(memoryCasts) : clone(defaultCasts);
    }
  }

  function saveCasts(casts) {
    const sorted = sortCasts(casts);
    memoryCasts = clone(sorted);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    } catch (error) {
      console.warn("ブラウザ内保存の上限に達しました。Firebase保存を優先します。", error);
    }
    return clone(sorted);
  }

  function resetCasts() {
    memoryCasts = null;
    saveCasts(defaultCasts);
    return clone(defaultCasts);
  }

  function dateKey(date = new Date()) {
    const value = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(value.getTime())) return "";
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function timeOptions() {
    const options = [];
    for (let hour = 19; hour <= 23; hour += 1) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 23 && minute > 0) continue;
        options.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
      }
    }
    return options;
  }

  function endTimeOptions() {
    const options = ["Last"];
    for (let hour = 22; hour <= 24; hour += 1) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 24 && minute > 0) continue;
        options.push(`${String(hour % 24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
      }
    }
    return options;
  }

  function normalizeScheduleEntry(entry) {
    const status = ["work", "rest", "unknown"].includes(entry?.status) ? entry.status : "unknown";
    const validStarts = timeOptions();
    const validEnds = endTimeOptions();
    return {
      status,
      start: validStarts.includes(entry?.start) ? entry.start : "19:00",
      end: validEnds.includes(entry?.end) ? entry.end : "Last"
    };
  }

  function loadSchedule() {
    try {
      const saved = localStorage.getItem(SCHEDULE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function saveSchedule(schedule) {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule && typeof schedule === "object" ? schedule : {}));
  }

  function scheduleForDate(date) {
    const schedule = loadSchedule();
    const key = dateKey(date);
    const daySchedule = schedule[key] || {};
    return Object.fromEntries(
      Object.entries(daySchedule).map(([castId, entry]) => [castId, normalizeScheduleEntry(entry)])
    );
  }

  function saveScheduleForDate(date, entries) {
    const schedule = loadSchedule();
    const key = dateKey(date);
    schedule[key] = Object.fromEntries(
      Object.entries(entries || {}).map(([castId, entry]) => [castId, normalizeScheduleEntry(entry)])
    );
    saveSchedule(schedule);
    return schedule[key];
  }

  function normalizePrices(prices) {
    const source = Array.isArray(prices) ? prices : defaultSiteSettings.prices;
    const normalized = source
      .map((price, index) => ({
        id: price?.id || `price-${index + 1}`,
        label: price?.label || "",
        value: price?.value || ""
      }))
      .filter((price) => price.label || price.value);
    return normalized.length ? normalized : clone(defaultSiteSettings.prices);
  }

  function normalizeSettings(settings) {
    const source = settings && typeof settings === "object" ? settings : {};

    return {
      ...defaultSiteSettings,
      ...source,
      prices: normalizePrices(source.prices)
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

  function normalizePickupNews(items) {
    return (Array.isArray(items) ? items : [])
      .map((item, index) => ({
        id: item.id || `news-${Date.now()}-${index}`,
        date: item.date || dateKey(new Date()),
        title: item.title || "",
        text: item.text || "",
        image: item.image || ""
      }))
      .filter((item) => item.date && (item.title || item.text || item.image))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function loadPickupNews() {
    try {
      const saved = localStorage.getItem(NEWS_KEY);
      if (!saved) {
        savePickupNews(defaultPickupNews);
        return clone(defaultPickupNews);
      }
      return normalizePickupNews(JSON.parse(saved));
    } catch (error) {
      return clone(defaultPickupNews);
    }
  }

  function savePickupNews(items) {
    const normalized = normalizePickupNews(items);
    localStorage.setItem(NEWS_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function resetPickupNews() {
    savePickupNews(defaultPickupNews);
    return clone(defaultPickupNews);
  }

  function recentNews(casts, now = new Date()) {
    const border = new Date(now);
    border.setHours(0, 0, 0, 0);
    border.setDate(border.getDate() - 30);

    const pickup = loadPickupNews().map((item) => ({
      ...item,
      type: "pickup",
      label: "PICK UP"
    }));
    const castEntries = sortCasts(casts)
      .filter((cast) => cast.visible && cast.createdAt)
      .map((cast) => ({
        id: `cast-news-${cast.id}`,
        date: cast.createdAt,
        title: `${cast.name} 入店のお知らせ`,
        text: "新しいキャストを登録しました。",
        type: "cast",
        label: "CAST"
      }));

    return [...pickup, ...castEntries]
      .filter((item) => {
        const date = new Date(item.date);
        return !Number.isNaN(date.getTime()) && date >= border && date <= now;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
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
    SCHEDULE_KEY,
    NEWS_KEY,
    dayLabels,
    defaultCasts: clone(defaultCasts),
    defaultSiteSettings: clone(defaultSiteSettings),
    defaultPickupNews: clone(defaultPickupNews),
    loadCasts,
    saveCasts,
    resetCasts,
    dateKey,
    timeOptions,
    endTimeOptions,
    loadSchedule,
    saveSchedule,
    scheduleForDate,
    saveScheduleForDate,
    loadSettings,
    saveSettings,
    resetSettings,
    loadPickupNews,
    savePickupNews,
    resetPickupNews,
    recentNews,
    recentBlogPosts,
    sortCasts,
    escapeHtml,
    initials
  };
})();
