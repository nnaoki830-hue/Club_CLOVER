(function () {
  const intro = document.querySelector(".intro");
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dotsWrap = document.querySelector(".hero-dots");
  const progress = document.querySelector(".hero-progress span");
  let activeSlide = 0;
  let slideTimer;

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

    settings.prices.forEach((price, index) => {
      const label = document.querySelector(`[data-price-label="${index}"]`);
      const value = document.querySelector(`[data-price-value="${index}"]`);
      if (label) label.textContent = price.label;
      if (value) value.textContent = price.value;
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
  }

  function formatDays(days) {
    if (!days.length) return "出勤未定";
    return days.map((day) => CLOVER.dayLabels[day] || day).join(" / ");
  }

  function renderPlaceholderLogo() {
    return `
      <span class="placeholder-logo">
        <img src="assets/images/logo-clover-main.png" alt="">
      </span>
    `;
  }

  function renderCastCard(cast) {
    const photo = cast.photo
      ? `<img src="${cast.photo}" alt="${CLOVER.escapeHtml(cast.name)}">`
      : renderPlaceholderLogo();
    const latestBlog = CLOVER.recentBlogPosts([cast])[0];
    const blogLink = latestBlog
      ? `<a class="cast-blog-link" href="${CLOVER.escapeHtml(latestBlog.url)}" target="_blank" rel="noopener">最新ブログを見る</a>`
      : cast.pokepalaUrl
        ? `<a class="cast-blog-link" href="${CLOVER.escapeHtml(cast.pokepalaUrl)}" target="_blank" rel="noopener">ポケパラを見る</a>`
        : "";

    return `
      <article class="cast-card">
        <div class="cast-photo ${cast.photo ? "has-photo" : ""}">${photo}</div>
        <div class="cast-body">
          <p>${CLOVER.escapeHtml(cast.title)}</p>
          <h3>${CLOVER.escapeHtml(cast.name)}</h3>
          <span>${CLOVER.escapeHtml(cast.kana)}</span>
          <small>${CLOVER.escapeHtml(formatDays(cast.days))}</small>
          <p class="cast-message">${CLOVER.escapeHtml(cast.message)}</p>
          ${cast.profile ? `<p class="cast-profile">${CLOVER.escapeHtml(cast.profile)}</p>` : ""}
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

  function renderCasts() {
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
      : casts.filter((cast) => cast.days.includes(todayKey));

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
  }

  function formatBlogDate(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  function renderBlogs() {
    const blogUpdates = document.getElementById("blogUpdates");
    if (!blogUpdates) return;
    const blogs = CLOVER.recentBlogPosts(CLOVER.loadCasts());

    blogUpdates.innerHTML = blogs.length
      ? blogs
          .map(
            (blog) => `
              <a class="blog-card" href="${CLOVER.escapeHtml(blog.url)}" target="_blank" rel="noopener">
                <span class="blog-date">${CLOVER.escapeHtml(formatBlogDate(blog.date))}</span>
                <span>
                  <strong>${CLOVER.escapeHtml(blog.title)}</strong>
                  <small>${CLOVER.escapeHtml(blog.castName)} / Pokepala</small>
                </span>
              </a>
            `
          )
          .join("")
      : `<p class="empty-state">30日以内のブログ更新はありません</p>`;
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

  document.addEventListener("clover:data-sync", () => {
    applySiteSettings();
    renderNews();
    renderBlogs();
    renderCasts();
  });
})();
