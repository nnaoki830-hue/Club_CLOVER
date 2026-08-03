(function () {
  let casts = CLOVER.loadCasts();
  let selectedId = casts[0] ? casts[0].id : "";

  const form = document.getElementById("castForm");
  const siteForm = document.getElementById("siteForm");
  const list = document.getElementById("adminCastList");
  const status = document.getElementById("saveStatus");
  const siteStatus = document.getElementById("siteSaveStatus");
  const fields = {
    id: document.getElementById("castId"),
    name: document.getElementById("castName"),
    kana: document.getElementById("castKana"),
    title: document.getElementById("castTitle"),
    message: document.getElementById("castMessage"),
    pokepalaUrl: document.getElementById("pokepalaUrl"),
    order: document.getElementById("castOrder"),
    visible: document.getElementById("castVisible"),
    photoData: document.getElementById("photoData"),
    photoFile: document.getElementById("castPhoto"),
    photoPreview: document.getElementById("photoPreview"),
    blogDate: document.getElementById("blogDate"),
    blogTitle: document.getElementById("blogTitle"),
    blogUrl: document.getElementById("blogUrl"),
    blogList: document.getElementById("blogAdminList")
  };
  const siteFields = {
    heroEyebrow: document.getElementById("settingHeroEyebrow"),
    heroCopy: document.getElementById("settingHeroCopy"),
    newsText: document.getElementById("settingNewsText"),
    castLinkText: document.getElementById("settingCastLinkText"),
    systemTitle: document.getElementById("settingSystemTitle"),
    systemText: document.getElementById("settingSystemText"),
    shopName: document.getElementById("settingShopName"),
    area: document.getElementById("settingArea"),
    openHours: document.getElementById("settingOpenHours"),
    holiday: document.getElementById("settingHoliday"),
    reservationText: document.getElementById("settingReservationText"),
    reservationEmail: document.getElementById("settingReservationEmail"),
    lineUrl: document.getElementById("settingLineUrl"),
    socialX: document.getElementById("settingSocialX"),
    socialInstagram: document.getElementById("settingSocialInstagram"),
    socialTikTok: document.getElementById("settingSocialTikTok"),
    socialLine: document.getElementById("settingSocialLine"),
    priceLabels: [0, 1, 2, 3].map((index) => document.getElementById(`priceLabel${index}`)),
    priceValues: [0, 1, 2, 3].map((index) => document.getElementById(`priceValue${index}`))
  };
  let currentBlogs = [];

  function setStatus(message) {
    status.textContent = message;
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => {
      status.textContent = "";
    }, 2200);
  }

  function setSiteStatus(message) {
    siteStatus.textContent = message;
    window.clearTimeout(setSiteStatus.timer);
    setSiteStatus.timer = window.setTimeout(() => {
      siteStatus.textContent = "";
    }, 2200);
  }

  function fillSiteForm() {
    const settings = CLOVER.loadSettings();
    Object.entries(siteFields).forEach(([key, input]) => {
      if (Array.isArray(input)) return;
      input.value = settings[key] || "";
    });
    settings.prices.forEach((price, index) => {
      siteFields.priceLabels[index].value = price.label;
      siteFields.priceValues[index].value = price.value;
    });
  }

  function readSiteForm() {
    const settings = {};
    Object.entries(siteFields).forEach(([key, input]) => {
      if (Array.isArray(input)) return;
      settings[key] = input.value.trim();
    });
    settings.prices = siteFields.priceLabels.map((input, index) => ({
      label: input.value.trim(),
      value: siteFields.priceValues[index].value.trim()
    }));
    return settings;
  }

  function blankCast() {
    return {
      id: `cast-${Date.now()}`,
      name: "",
      kana: "",
      title: "",
      message: "",
      days: [],
      visible: true,
      order: casts.length + 1,
      photo: "",
      pokepalaUrl: "",
      blogs: []
    };
  }

  function selectedCast() {
    return casts.find((cast) => cast.id === selectedId) || blankCast();
  }

  function updatePhotoPreview(photo, name) {
    fields.photoPreview.classList.toggle("has-photo", Boolean(photo));
    if (photo) {
      fields.photoPreview.innerHTML = `<img src="${photo}" alt="${CLOVER.escapeHtml(name || "CAST")}">`;
    } else {
      fields.photoPreview.innerHTML = `<span class="placeholder-logo"><img src="assets/images/logo-clover-main.png" alt=""></span>`;
    }
  }

  function fillForm(cast) {
    fields.id.value = cast.id;
    fields.name.value = cast.name;
    fields.kana.value = cast.kana;
    fields.title.value = cast.title;
    fields.message.value = cast.message;
    fields.pokepalaUrl.value = cast.pokepalaUrl || "";
    fields.order.value = cast.order;
    fields.visible.checked = cast.visible;
    fields.photoData.value = cast.photo || "";
    fields.photoFile.value = "";
    fields.blogDate.value = new Date().toISOString().slice(0, 10);
    fields.blogTitle.value = "";
    fields.blogUrl.value = "";
    currentBlogs = Array.isArray(cast.blogs) ? [...cast.blogs] : [];
    form.querySelectorAll('input[name="days"]').forEach((input) => {
      input.checked = cast.days.includes(input.value);
    });
    updatePhotoPreview(cast.photo, cast.name);
    renderBlogList();
  }

  function renderBlogList() {
    fields.blogList.innerHTML = currentBlogs.length
      ? currentBlogs
          .map(
            (blog) => `
              <div class="blog-admin-item">
                <span>
                  <strong>${CLOVER.escapeHtml(blog.title)}</strong>
                  <small>${CLOVER.escapeHtml(blog.date)} / ${CLOVER.escapeHtml(blog.url)}</small>
                </span>
                <button class="button danger-button" type="button" data-blog-delete="${CLOVER.escapeHtml(blog.id)}">削除</button>
              </div>
            `
          )
          .join("")
      : `<p class="admin-empty">登録ブログはありません</p>`;
  }

  function renderList() {
    casts = CLOVER.sortCasts(casts);
    list.innerHTML = casts
      .map((cast) => {
        const photo = cast.photo
          ? `<img src="${cast.photo}" alt="${CLOVER.escapeHtml(cast.name)}">`
          : `<span class="placeholder-logo"><img src="assets/images/logo-clover-main.png" alt=""></span>`;
        const days = cast.days.map((day) => CLOVER.dayLabels[day]).join(" ");
        const latestBlog = CLOVER.recentBlogPosts([cast])[0];
        return `
          <button class="admin-cast-item ${cast.id === selectedId ? "is-active" : ""}" type="button" data-id="${cast.id}">
            <span class="admin-thumb ${cast.photo ? "has-photo" : ""}">${photo}</span>
            <span>
              <strong>${CLOVER.escapeHtml(cast.name || "未入力")}</strong>
              <small>${CLOVER.escapeHtml(latestBlog ? `ブログ ${latestBlog.date}` : days || "出勤未定")}</small>
            </span>
            <em>${cast.visible ? "表示" : "非表示"}</em>
          </button>
        `;
      })
      .join("");
  }

  function selectCast(id) {
    selectedId = id;
    fillForm(selectedCast());
    renderList();
  }

  function readForm() {
    return {
      id: fields.id.value || `cast-${Date.now()}`,
      name: fields.name.value.trim(),
      kana: fields.kana.value.trim(),
      title: fields.title.value.trim(),
      message: fields.message.value.trim(),
      pokepalaUrl: fields.pokepalaUrl.value.trim(),
      order: Number(fields.order.value) || casts.length + 1,
      visible: fields.visible.checked,
      photo: fields.photoData.value,
      blogs: currentBlogs,
      days: Array.from(form.querySelectorAll('input[name="days"]:checked')).map((input) => input.value)
    };
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const cast = readForm();
    const existingIndex = casts.findIndex((item) => item.id === cast.id);

    if (existingIndex >= 0) {
      casts[existingIndex] = cast;
    } else {
      casts.push(cast);
    }

    CLOVER.saveCasts(casts);
    selectedId = cast.id;
    renderList();
    fillForm(cast);
    setStatus("保存しました");
  });

  siteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    CLOVER.saveSettings(readSiteForm());
    fillSiteForm();
    setSiteStatus("サイト内容を保存しました");
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (button) selectCast(button.dataset.id);
  });

  document.getElementById("newCastButton").addEventListener("click", () => {
    const cast = blankCast();
    selectedId = cast.id;
    fillForm(cast);
    renderList();
    setStatus("新規入力");
  });

  document.getElementById("deleteCastButton").addEventListener("click", () => {
    if (!fields.id.value) return;
    const target = selectedCast();
    const ok = window.confirm(`${target.name || "このキャスト"}を削除しますか？`);
    if (!ok) return;
    casts = casts.filter((cast) => cast.id !== fields.id.value);
    CLOVER.saveCasts(casts);
    selectedId = casts[0] ? casts[0].id : "";
    renderList();
    fillForm(selectedCast());
    setStatus("削除しました");
  });

  document.getElementById("sampleResetButton").addEventListener("click", () => {
    const ok = window.confirm("キャストとサイト内容を初期データに戻しますか？");
    if (!ok) return;
    casts = CLOVER.resetCasts();
    CLOVER.resetSettings();
    selectedId = casts[0].id;
    fillSiteForm();
    renderList();
    fillForm(selectedCast());
    setStatus("初期データに戻しました");
    setSiteStatus("初期データに戻しました");
  });

  document.getElementById("clearPhotoButton").addEventListener("click", () => {
    fields.photoData.value = "";
    fields.photoFile.value = "";
    updatePhotoPreview("", fields.name.value);
  });

  document.getElementById("addBlogButton").addEventListener("click", () => {
    const title = fields.blogTitle.value.trim();
    const url = fields.blogUrl.value.trim();
    const date = fields.blogDate.value;
    if (!title || !url || !date) {
      setStatus("ブログの日付・タイトル・URLを入力してください");
      return;
    }
    currentBlogs = [
      {
        id: `blog-${Date.now()}`,
        title,
        url,
        date
      },
      ...currentBlogs
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    fields.blogTitle.value = "";
    fields.blogUrl.value = "";
    renderBlogList();
    setStatus("ブログを追加しました。保存してください");
  });

  fields.blogList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-blog-delete]");
    if (!button) return;
    currentBlogs = currentBlogs.filter((blog) => blog.id !== button.dataset.blogDelete);
    renderBlogList();
    setStatus("ブログを削除しました。保存してください");
  });

  fields.photoFile.addEventListener("change", () => {
    const file = fields.photoFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      fields.photoData.value = reader.result;
      updatePhotoPreview(reader.result, fields.name.value);
    });
    reader.readAsDataURL(file);
  });

  fields.name.addEventListener("input", () => {
    if (!fields.photoData.value) updatePhotoPreview("", fields.name.value);
  });

  renderList();
  fillSiteForm();
  fillForm(selectedCast());
})();
