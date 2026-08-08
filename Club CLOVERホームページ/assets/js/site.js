(function () {
  const intro = document.querySelector(".intro");
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dotsWrap = document.querySelector(".hero-dots");
  const progress = document.querySelector(".hero-progress span");
  let activeSlide = 0;
  let slideTimer;
  let autoBlogPosts = [];
  let autoBlogLoading = false;

  if (intro) {
    const finishIntro = () => {
      intro.classList.add("is-finished");
      intro.remove();
    };

    intro.addEventListener("animationend", (event) => {
      if (event.animationName === "intro-hide") {
        finishIntro();
      }
    });
    window.setTimeout(finishIntro, 3600);
  }

  function resetProgress() {
    if (!progress) return;
    progress.style.animation = "none";
    progress.offsetHeight;
    progress.style.animation = "";
  }

  function showSlide(index) {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });
    document.querySelectorAll(".hero-dot").forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
      dot.setAttribute("aria-pressed", String(dotIndex === activeSlide));
    });
    resetProgress();
  }

  function startSlider() {
    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(() => showSlide(activeSlide + 1), 5200);
  }

  if (slides.length && dotsWrap) {
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `hero-dot${index === 0 ? " is-active" : ""}`;
      dot.setAttribute("aria-label", `店内写真 ${index + 1}`);
      dot.setAttribute("aria-pressed", String(index === 0));
      dot.addEventListener("click", () => {
        showSlide(index);
        startSlider();
      });
      dotsWrap.appendChild(dot);
    });

    document.querySelectorAll("[data-slide-control]").forEach((button) => {
      button.addEventListener("click", () => {
        const direction = button.dataset.slideControl === "next" ? 1 : -1;
        showSlide(activeSlide + direction);
        startSlider();
      });
    });

    startSlider();
  }

  function reservationMailto(email) {
    const subject = encodeURIComponent("Club CLOVER 予約希望");
    const body = encodeURIComponent(
      "【ご予約希望】\nお名前：\nご来店希望日：\nご来店時間：\n人数：\n電話番号：\nご要望："
    );
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  function applySiteSettings() {
    if (!CLOVER.loadSettings) return;
    const settings = CLOVER.loadSettings();

    document.querySelectorAll("[data-setting]").forEach((element) => {
      const value = settings[element.dataset.setting];
      if (value) element.textContent = value;
    });

    document.querySelectorAll("[data-price-board]").forEach((board) => {
      board.innerHTML = settings.prices.length
        ? settings.prices
            .map(
              (price) => `
                <div class="price-row">
                  <span>${CLOVER.escapeHtml(price.label)}</span>
                  <strong>${CLOVER.escapeHtml(price.value)}</strong>
                </div>
              `
            )
            .join("")
        : `<p class="empty-state">料金は店舗へお問い合わせください</p>`;
    });

    document.querySelectorAll("[data-social]").forEach((link) => {
      const url = settings[link.dataset.social];
      link.hidden = !url;
      if (url) link.href = url;
    });

    document.querySelectorAll("[data-line-url]").forEach((link) => {
      link.hidden = !settings.lineUrl;
      if (settings.lineUrl) link.href = settings.lineUrl;
    });

    document.querySelectorAll("[data-reservation-email]").forEach((link) => {
      link.hidden = !settings.reservationEmail;
      if (settings.reservationEmail) link.href = reservationMailto(settings.reservationEmail);
    });

    document.querySelectorAll("[data-recruit-apply]").forEach((link) => {
      link.hidden = !settings.recruitEmail;
      if (settings.recruitEmail) link.href = recruitMailto(settings.recruitEmail, link.dataset.recruitApply);
    });
  }

  function renderPlaceholderLogo() {
    return `
      <span class="placeholder-logo">
        <img src="assets/images/logo-clover-main.png" alt="">
      </span>
    `;
  }

  function socialIcon(label) {
    const icons = {
      x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h4.1l4.62 5.92L17.75 4H20l-6.16 7.25L20.5 20h-4.1l-4.96-6.36L6.05 20H3.8l6.54-7.7Z"></path></svg>',
      instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"></rect><circle cx="12" cy="12" r="3.8"></circle><circle cx="17.2" cy="6.8" r="1.2"></circle></svg>',
      tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v11.1a4.6 4.6 0 1 1-4-4.55v3.05a1.72 1.72 0 1 0 1.15 1.62V3h2.85c.42 2.1 1.75 3.52 4 3.95V10c-1.52-.12-2.86-.7-4-1.62Z"></path></svg>',
      line: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4C7 4 3 7.1 3 11c0 3.12 2.55 5.78 6.1 6.68L9 20.8c-.02.54.58.87 1.02.56l3.98-2.78c4-.62 7-3.55 7-7.58 0-3.9-4-7-9-7Z"></path></svg>'
    };
    return icons[label] || label.toUpperCase();
  }

  function renderCastSocialLinks(cast) {
    const sns = cast.sns || {};
    const items = [
      { key: "x", label: "X" },
      { key: "instagram", label: "Instagram" },
      { key: "tiktok", label: "TikTok" },
      { key: "line", label: "LINE" }
    ].filter((item) => sns[item.key]);

    if (!items.length) return "";
    return `
      <div class="cast-social-links" aria-label="SNSリンク">
        ${items
          .map(
            (item) => `<a class="cast-social-link cast-social-${item.key}" href="${CLOVER.escapeHtml(sns[item.key])}" target="_blank" rel="noopener" aria-label="${CLOVER.escapeHtml(item.label)}">${socialIcon(item.key)}</a>`
          )
          .join("")}
      </div>
    `;
  }

  function renderCastDetails(cast) {
    const details = [
      ["誕生日", cast.birthday],
      ["年齢", cast.age],
      ["身長", cast.height],
      ["血液型", cast.bloodType]
    ].filter((detail) => detail[1]);

    if (!details.length) return "";
    return `
      <dl class="cast-details">
        ${details
          .map(
            ([label, value]) => `
              <div class="cast-detail-item">
                <dt>${CLOVER.escapeHtml(label)}</dt>
                <dd>${CLOVER.escapeHtml(value)}</dd>
              </div>
            `
          )
          .join("")}
      </dl>
    `;
  }

  function renderCastQa(cast) {
    const qa = Array.isArray(cast.qa) ? cast.qa.filter((item) => item.question || item.answer) : [];
    if (!qa.length) return "";
    return `
      <div class="cast-qa">
        ${qa
          .map(
            (item) => `
              <div class="cast-qa-item">
                <p class="cast-qa-q">Q. ${CLOVER.escapeHtml(item.question)}</p>
                <p class="cast-qa-a">A. ${CLOVER.escapeHtml(item.answer)}</p>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function normalizeExternalUrl(url) {
    const value = String(url || "").trim();
    if (!value) return "";
    return value.replace(/^http:\/\//, "https://");
  }

  function normalizeImageUrl(url) {
    const value = String(url || "").trim();
    if (!value) return "";
    if (value.startsWith("//")) return `https:${value}`;
    if (value.startsWith("http://")) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(value.replace(/^http:\/\//, ""))}`;
    }
    return value;
  }

  function pokeparaRssUrl(url) {
    const match = String(url || "").match(/\/gal\/(\d+)\//);
    return match ? `https://www.pokepara.jp/rss/gal/${match[1]}/rss2.xml` : "";
  }

  async function fetchRssText(url) {
    const jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    try {
      const response = await fetch(jsonUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.status === "ok" && Array.isArray(data.items)) return data;
      }
    } catch (error) {
      // Keep trying with the original RSS feed below.
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("RSSを取得できませんでした");
    return response.text();
  }

  function toDateKey(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function textFromHtml(value) {
    const holder = document.createElement("div");
    holder.innerHTML = String(value || "");
    return holder.textContent.replace(/\s+/g, " ").trim();
  }

  function firstImageFromHtml(value) {
    const holder = document.createElement("div");
    holder.innerHTML = String(value || "");
    const image = holder.querySelector("img");
    const linkedLargeImage = image?.closest("a")?.getAttribute("href") || "";
    return normalizeImageUrl(linkedLargeImage || image?.getAttribute("src") || "");
  }

  function itemImageUrl(item, content) {
    if (typeof item.querySelector === "function") {
      const media = item.querySelector("thumbnail, content");
      return normalizeImageUrl(
        media?.getAttribute("url") ||
        item.querySelector("enclosure")?.getAttribute("url") ||
        firstImageFromHtml(content)
      );
    }

    return normalizeImageUrl(
      item.thumbnail ||
      item.enclosure?.link ||
      item.enclosure?.url ||
      firstImageFromHtml(content)
    );
  }

  function shortenText(value, length = 120) {
    const text = textFromHtml(value);
    return text.length > length ? `${text.slice(0, length)}...` : text;
  }

  function blogDetailUrl(blog) {
    return `blog.html?cast=${encodeURIComponent(blog.castId || "")}&url=${encodeURIComponent(blog.url || blog.id || "")}`;
  }

  function blogObjectFromRss(item, index, cast) {
    const title = item.title || item.querySelector?.("title")?.textContent || "";
    const link = normalizeExternalUrl(item.link || item.querySelector?.("link")?.textContent || "");
    const pubDate = item.pubDate || item.querySelector?.("pubDate")?.textContent || "";
    const content = item.content || item.description || item.querySelector?.("description")?.textContent || item.querySelector?.("content\\:encoded")?.textContent || "";
    const thumbnail = itemImageUrl(item, content);
    return {
      id: `pokepara-${cast.id}-${index}-${link}`,
      title,
      url: link,
      date: toDateKey(pubDate),
      castId: cast.id,
      castName: cast.name,
      castKana: cast.kana,
      castPhoto: cast.photo,
      pokepalaUrl: cast.pokepalaUrl,
      thumbnail,
      body: textFromHtml(content),
      excerpt: shortenText(content),
      source: "pokepara"
    };
  }

  function parsePokeparaRss(feedData, cast) {
    const items = typeof feedData === "string"
      ? Array.from(new DOMParser().parseFromString(feedData, "application/xml").querySelectorAll("item"))
      : feedData.items || [];

    return items
      .map((item, index) => blogObjectFromRss(item, index, cast))
      .filter((blog) => blog.title && blog.url && blog.date);
  }

  function recentAutoBlogPosts(now = new Date()) {
    const border = new Date(now);
    border.setHours(0, 0, 0, 0);
    border.setDate(border.getDate() - 30);

    return autoBlogPosts
      .filter((blog) => {
        const date = new Date(blog.date);
        return !Number.isNaN(date.getTime()) && date >= border && date <= now;
      });
  }

  function allRecentBlogPosts(casts) {
    const castIds = new Set(casts.map((cast) => cast.id));
    const seen = new Set();
    return [...CLOVER.recentBlogPosts(casts), ...recentAutoBlogPosts().filter((blog) => castIds.has(blog.castId))]
      .filter((blog) => {
        const key = normalizeExternalUrl(blog.url);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        blog.url = key;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async function loadPokeparaBlogs(casts) {
    if (autoBlogLoading) return;
    const targets = casts.filter((cast) => cast.visible && pokeparaRssUrl(cast.pokepalaUrl));
    if (!targets.length) {
      autoBlogPosts = [];
      return;
    }

    autoBlogLoading = true;
    try {
      const posts = await Promise.all(
        targets.map(async (cast) => {
          try {
            return parsePokeparaRss(await fetchRssText(pokeparaRssUrl(cast.pokepalaUrl)), cast);
          } catch (error) {
            return [];
          }
        })
      );
      autoBlogPosts = posts.flat();
      renderBlogs();
      renderCasts({ loadBlogs: false });
      renderCastProfileDetail({ loadBlogs: false });
      renderBlogDetail({ loadBlogs: false });
    } finally {
      autoBlogLoading = false;
    }
  }

  function castProfileUrl(cast) {
    return `cast-profile.html?id=${encodeURIComponent(cast.id)}`;
  }

  function renderCastCard(cast) {
    const photo = cast.photo
      ? `<img src="${cast.photo}" alt="${CLOVER.escapeHtml(cast.name)}">`
      : renderPlaceholderLogo();
    const latestBlog = allRecentBlogPosts([cast])[0];
    const blogLink = latestBlog
      ? `<a class="cast-blog-link" href="${CLOVER.escapeHtml(blogDetailUrl(latestBlog))}">最新ブログを見る</a>`
      : "";

    return `
      <article class="cast-card" data-profile-url="${CLOVER.escapeHtml(castProfileUrl(cast))}" tabindex="0">
        <div class="cast-photo ${cast.photo ? "has-photo" : ""}">${photo}${renderCastSocialLinks(cast)}</div>
        <div class="cast-body">
          <p>${CLOVER.escapeHtml(cast.title)}</p>
          <h3>${CLOVER.escapeHtml(cast.name)}</h3>
          <span>${CLOVER.escapeHtml(cast.kana)}</span>
          ${renderCastDetails(cast)}
          ${renderCastQa(cast)}
          <a class="cast-profile-link" href="${CLOVER.escapeHtml(castProfileUrl(cast))}">プロフィールを見る</a>
          ${blogLink}
        </div>
      </article>
    `;
  }

  function renderTodayCard(cast) {
    const photo = cast.photo
      ? `<img src="${cast.photo}" alt="${CLOVER.escapeHtml(cast.name)}">`
      : renderPlaceholderLogo();
    const time = cast.scheduleTime ? `<small>${CLOVER.escapeHtml(cast.scheduleTime)}</small>` : `<small>${CLOVER.escapeHtml(cast.kana || "Club CLOVER")}</small>`;

    return `
      <article class="today-card">
        <div class="today-photo ${cast.photo ? "has-photo" : ""}">${photo}</div>
        <div>
          <p>${CLOVER.escapeHtml(cast.title)}</p>
          <h4>${CLOVER.escapeHtml(cast.name)}</h4>
          ${time}
        </div>
      </article>
    `;
  }

  function renderCasts(options = {}) {
    const castGrid = document.getElementById("castGrid");
    const todaySchedule = document.getElementById("todaySchedule");
    const todayDate = document.getElementById("todayDate");
    if (!castGrid && !todaySchedule) return;

    const casts = CLOVER.loadCasts().filter((cast) => cast.visible);
    const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const now = new Date();
    const todayKey = dayKeys[now.getDay()];
    const daySchedule = CLOVER.scheduleForDate(now);
    const scheduledCastIds = Object.keys(daySchedule);
    const scheduleLabel = (entry) => `${entry.start} - ${entry.end === "Last" ? "LAST" : entry.end}`;
    const todayCasts = scheduledCastIds.length
      ? casts
          .filter((cast) => daySchedule[cast.id]?.status === "work")
          .map((cast) => ({
            ...cast,
            scheduleTime: scheduleLabel(daySchedule[cast.id])
          }))
      : [];

    if (todayDate) {
      todayDate.textContent = `${now.getMonth() + 1}/${now.getDate()} ${CLOVER.dayLabels[todayKey]}曜日`;
    }

    if (castGrid) {
      castGrid.innerHTML = casts.length
        ? casts.map(renderCastCard).join("")
        : `<p class="empty-state">CAST COMING SOON</p>`;
    }

    if (todaySchedule) {
      todaySchedule.innerHTML = todayCasts.length
        ? todayCasts.map(renderTodayCard).join("")
        : `<p class="today-empty">本日の出勤情報は店舗へご確認ください</p>`;
    }

    if (options.loadBlogs !== false) {
      loadPokeparaBlogs(casts);
    }
  }

  function formatBlogDate(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  function blogCard(blog, label = "BLOG") {
    const thumbnail = blog.thumbnail || blog.castPhoto || "";
    return `
      <a class="blog-card${thumbnail ? " has-blog-thumb" : ""}" href="${CLOVER.escapeHtml(blogDetailUrl(blog))}">
        <span class="blog-date">${CLOVER.escapeHtml(formatBlogDate(blog.date))}</span>
        ${thumbnail ? `<span class="blog-thumb"><img src="${CLOVER.escapeHtml(thumbnail)}" alt=""></span>` : ""}
        <span>
          <small>${CLOVER.escapeHtml(label)}</small>
          <strong>${CLOVER.escapeHtml(blog.title)}</strong>
          <em>${CLOVER.escapeHtml(blog.castName || "Club CLOVER")}</em>
          ${blog.excerpt ? `<span class="blog-excerpt">${CLOVER.escapeHtml(blog.excerpt)}</span>` : ""}
        </span>
      </a>
    `;
  }

  function renderBlogs() {
    const blogUpdates = document.getElementById("blogUpdates");
    if (!blogUpdates) return;
    const blogs = allRecentBlogPosts(CLOVER.loadCasts());

    blogUpdates.innerHTML = blogs.length
      ? blogs.map((blog) => blogCard(blog, "BLOG UPDATE")).join("")
      : `<p class="empty-state">30日以内のブログ更新はありません</p>`;
  }

  function selectedCastId() {
    return new URLSearchParams(window.location.search).get("id") || "";
  }

  function renderCastProfileDetail(options = {}) {
    const detail = document.getElementById("castProfileDetail");
    if (!detail) return;

    const casts = CLOVER.loadCasts().filter((cast) => cast.visible);
    const cast = casts.find((item) => item.id === selectedCastId()) || casts[0];
    if (!cast) {
      detail.innerHTML = `<p class="empty-state">プロフィールはまだ登録されていません</p>`;
      return;
    }

    const photo = cast.photo
      ? `<img src="${cast.photo}" alt="${CLOVER.escapeHtml(cast.name)}">`
      : renderPlaceholderLogo();
    const blogs = allRecentBlogPosts([cast]).slice(0, 5);
    const blogList = blogs.length
      ? blogs.map((blog) => blogCard(blog, "BLOG")).join("")
      : `<p class="empty-state">30日以内のブログ更新はありません</p>`;

    document.title = `${cast.name} | Club CLOVER`;
    detail.innerHTML = `
      <div class="cast-profile-visual">
        <div class="cast-photo cast-profile-photo ${cast.photo ? "has-photo" : ""}">${photo}${renderCastSocialLinks(cast)}</div>
      </div>
      <div class="cast-profile-content">
        <p class="section-kicker">CAST PROFILE</p>
        <h1>${CLOVER.escapeHtml(cast.name)}</h1>
        <span>${CLOVER.escapeHtml(cast.kana)}</span>
        ${renderCastDetails(cast)}
        ${renderCastQa(cast)}
      </div>
      <section class="cast-profile-blogs" aria-label="ブログ更新">
        <div class="section-heading compact">
          <p class="section-kicker">BLOG</p>
          <h2>ブログ更新</h2>
        </div>
        <div class="blog-list">${blogList}</div>
      </section>
    `;

    if (options.loadBlogs !== false) {
      loadPokeparaBlogs(casts);
    }
  }


  function selectedBlogUrl() {
    return normalizeExternalUrl(new URLSearchParams(window.location.search).get("url") || "");
  }

  function renderBlogDetail(options = {}) {
    const detail = document.getElementById("blogDetail");
    if (!detail) return;

    const casts = CLOVER.loadCasts().filter((cast) => cast.visible);
    const blogs = allRecentBlogPosts(casts);
    const targetUrl = selectedBlogUrl();
    const blog = blogs.find((item) => normalizeExternalUrl(item.url) === targetUrl) || blogs[0];

    if (!blog) {
      detail.innerHTML = `<p class="empty-state">ブログを読み込み中です</p>`;
      if (options.loadBlogs !== false && !autoBlogLoading) loadPokeparaBlogs(casts);
      return;
    }

    const cast = casts.find((item) => item.id === blog.castId) || {};
    const thumbnail = blog.thumbnail || blog.castPhoto || cast.photo || "";
    document.title = `${blog.title} | Club CLOVER`;
    detail.innerHTML = `
      <article class="blog-detail-article">
        <a class="back-link" href="${CLOVER.escapeHtml(cast.id ? castProfileUrl(cast) : "index.html#blog")}">BACK</a>
        <p class="section-kicker">CAST BLOG</p>
        <h1>${CLOVER.escapeHtml(blog.title)}</h1>
        <div class="blog-detail-meta">
          <span>${CLOVER.escapeHtml(formatBlogDate(blog.date))}</span>
          <span>${CLOVER.escapeHtml(blog.castName || "Club CLOVER")}</span>
        </div>
        ${thumbnail ? `<div class="blog-detail-photo"><img src="${CLOVER.escapeHtml(thumbnail)}" alt=""></div>` : ""}
        <div class="blog-detail-body">
          <p>${CLOVER.escapeHtml(blog.body || blog.excerpt || "ブログ本文を読み込みました。")}</p>
        </div>
      </article>
    `;

    if (options.loadBlogs !== false) {
      loadPokeparaBlogs(casts);
    }
  }


  function renderNews() {
    const newsTimeline = document.getElementById("newsTimeline");
    if (!newsTimeline || !CLOVER.recentNews) return;
    const news = CLOVER.recentNews(CLOVER.loadCasts());

    newsTimeline.innerHTML = news.length
      ? news
          .map(
            (item) => `
              <article class="news-card">
                <span class="news-date">${CLOVER.escapeHtml(formatBlogDate(item.date))}</span>
                ${item.image ? `<img class="news-image" src="${item.image}" alt="">` : ""}
                <span>
                  <em>${CLOVER.escapeHtml(item.label)}</em>
                  <strong>${CLOVER.escapeHtml(item.title)}</strong>
                  ${item.text ? `<small>${CLOVER.escapeHtml(item.text)}</small>` : ""}
                </span>
              </article>
            `
          )
          .join("")
      : `<p class="empty-state">30日以内のお知らせはありません</p>`;
  }

  applySiteSettings();
  renderNews();
  renderBlogs();
  renderCasts();
  renderCastProfileDetail();
  renderBlogDetail();

  document.addEventListener("clover:data-sync", () => {
    applySiteSettings();
    renderNews();
    renderBlogs();
    renderCasts();
    renderCastProfileDetail();
    renderBlogDetail();
  });

  document.addEventListener("click", (event) => {
    const card = event.target.closest?.(".cast-card[data-profile-url]");
    if (!card || event.target.closest("a, button")) return;
    window.location.href = card.dataset.profileUrl;
  });

  document.addEventListener("keydown", (event) => {
    const card = event.target.closest?.(".cast-card[data-profile-url]");
    if (!card || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    window.location.href = card.dataset.profileUrl;
  });
})();
