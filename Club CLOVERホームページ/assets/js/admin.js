(function () {
  let casts = CLOVER.loadCasts();
  let selectedId = casts[0] ? casts[0].id : "";

  const form = document.getElementById("castForm");
  const siteForm = document.getElementById("siteForm");
  const list = document.getElementById("adminCastList");
  const status = document.getElementById("saveStatus");
  const siteStatus = document.getElementById("siteSaveStatus");
  const pickupStatus = document.getElementById("pickupStatus");
  const fields = {
    id: document.getElementById("castId"),
    name: document.getElementById("castName"),
    kana: document.getElementById("castKana"),
    title: document.getElementById("castTitle"),
    birthday: document.getElementById("castBirthday"),
    age: document.getElementById("castAge"),
    height: document.getElementById("castHeight"),
    bloodType: document.getElementById("castBloodType"),
    socialX: document.getElementById("castSocialX"),
    socialInstagram: document.getElementById("castSocialInstagram"),
    socialTikTok: document.getElementById("castSocialTikTok"),
    socialLine: document.getElementById("castSocialLine"),
    qaQuestion: document.getElementById("qaQuestion"),
    qaAnswer: document.getElementById("qaAnswer"),
    addQaButton: document.getElementById("addQaButton"),
    qaList: document.getElementById("qaAdminList"),
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
  const pickupFields = {
    date: document.getElementById("pickupDate"),
    title: document.getElementById("pickupTitle"),
    text: document.getElementById("pickupText"),
    imageData: document.getElementById("pickupImageData"),
    imageFile: document.getElementById("pickupImage"),
    imagePreview: document.getElementById("pickupImagePreview"),
    list: document.getElementById("pickupNewsList")
  };
  let currentBlogs = [];
  let currentQa = [];
  let pickupNews = CLOVER.loadPickupNews ? CLOVER.loadPickupNews() : [];

  function showAdminPanel(panel) {
    document.body.dataset.activeAdmin = panel;
    document.querySelectorAll("[data-admin-tab]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.adminTab === panel);
    });
  }

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

  function setPickupStatus(message) {
    pickupStatus.textContent = message;
    window.clearTimeout(setPickupStatus.timer);
    setPickupStatus.timer = window.setTimeout(() => {
      pickupStatus.textContent = "";
    }, 2200);
  }

  function fillSiteForm() {
    const settings = CLOVER.loadSettings();
    Object.entries(siteFields).forEach(([key, input]) => {
      if (Array.isArray(input)) return;
      if (!input) return;
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
      if (!input) return;
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
      profile: "",
      birthday: "",
      age: "",
      height: "",
      bloodType: "",
      qa: [],
      sns: {},
      days: [],
      visible: true,
      order: casts.length + 1,
      createdAt: CLOVER.dateKey(new Date()),
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
    fields.birthday.value = cast.birthday || "";
    fields.age.value = cast.age || "";
    fields.height.value = cast.height || "";
    fields.bloodType.value = cast.bloodType || "";
    fields.socialX.value = cast.sns?.x || "";
    fields.socialInstagram.value = cast.sns?.instagram || "";
    fields.socialTikTok.value = cast.sns?.tiktok || "";
    fields.socialLine.value = cast.sns?.line || "";
    fields.pokepalaUrl.value = cast.pokepalaUrl || "";
    fields.order.value = cast.order;
    fields.visible.checked = cast.visible;
    fields.photoData.value = cast.photo || "";
    fields.photoFile.value = "";
    fields.blogDate.value = new Date().toISOString().slice(0, 10);
    fields.blogTitle.value = "";
    fields.blogUrl.value = "";
    currentBlogs = Array.isArray(cast.blogs) ? [...cast.blogs] : [];
    currentQa = Array.isArray(cast.qa) ? [...cast.qa] : [];
    form.querySelectorAll('input[name="days"]').forEach((input) => {
      input.checked = cast.days.includes(input.value);
    });
    updatePhotoPreview(cast.photo, cast.name);
    renderBlogList();
    renderQaList();
  }

  function renderQaList() {
    fields.qaList.innerHTML = currentQa.length
      ? currentQa
          .map(
            (item) => `
              <div class="blog-admin-item qa-admin-item">
                <span>
                  <strong>Q. ${CLOVER.escapeHtml(item.question || "質問未入力")}</strong>
                  <small>A. ${CLOVER.escapeHtml(item.answer || "回答未入力")}</small>
                </span>
                <button class="button danger-button" type="button" data-qa-delete="${CLOVER.escapeHtml(item.id)}">削除</button>
              </div>
            `
          )
          .join("")
      : `<p class="admin-empty">Q&Aはありません</p>`;
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

  function renderPickupNewsList() {
    pickupFields.list.innerHTML = pickupNews.length
      ? pickupNews
          .map(
            (item) => `
              <div class="blog-admin-item">
                ${item.image ? `<img class="admin-news-thumb" src="${item.image}" alt="">` : ""}
                <span>
                  <strong>${CLOVER.escapeHtml(item.title || "ピックアップ")}</strong>
                  <small>${CLOVER.escapeHtml(item.date)} / ${CLOVER.escapeHtml(item.text)}</small>
                </span>
                <button class="button danger-button" type="button" data-pickup-delete="${CLOVER.escapeHtml(item.id)}">削除</button>
              </div>
            `
          )
          .join("")
      : `<p class="admin-empty">ピックアップ投稿はありません</p>`;
  }

  function updatePickupImagePreview(image) {
    pickupFields.imagePreview.classList.toggle("has-photo", Boolean(image));
    pickupFields.imagePreview.innerHTML = image
      ? `<img src="${image}" alt="">`
      : `<span>IMAGE</span>`;
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
      message: "",
      profile: "",
      birthday: fields.birthday.value.trim(),
      age: fields.age.value.trim(),
      height: fields.height.value.trim(),
      bloodType: fields.bloodType.value,
      sns: {
        x: fields.socialX.value.trim(),
        instagram: fields.socialInstagram.value.trim(),
        tiktok: fields.socialTikTok.value.trim(),
        line: fields.socialLine.value.trim()
      },
      qa: currentQa,
      pokepalaUrl: fields.pokepalaUrl.value.trim(),
      order: Number(fields.order.value) || casts.length + 1,
      visible: fields.visible.checked,
      createdAt: selectedCast().createdAt || CLOVER.dateKey(new Date()),
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
      cast.createdAt = CLOVER.dateKey(new Date());
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
    if (CLOVER.resetPickupNews) {
      pickupNews = CLOVER.resetPickupNews();
      renderPickupNewsList();
    }
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

  fields.addQaButton.addEventListener("click", () => {
    const question = fields.qaQuestion.value.trim();
    const answer = fields.qaAnswer.value.trim();
    if (!question || !answer) {
      setStatus("Q&Aの質問と回答を入力してください");
      return;
    }
    currentQa = [
      ...currentQa,
      {
        id: `qa-${Date.now()}`,
        question,
        answer
      }
    ];
    fields.qaQuestion.value = "";
    fields.qaAnswer.value = "";
    renderQaList();
    setStatus("Q&Aを追加しました。保存してください");
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

  document.getElementById("addPickupButton").addEventListener("click", () => {
    const date = pickupFields.date.value;
    const title = pickupFields.title.value.trim();
    const text = pickupFields.text.value.trim();
    if (!date || !title) {
      setPickupStatus("投稿日とタイトルを入力してください");
      return;
    }
    pickupNews = CLOVER.savePickupNews([
      {
        id: `news-${Date.now()}`,
        date,
        title,
        text,
        image: pickupFields.imageData.value
      },
      ...pickupNews
    ]);
    pickupFields.title.value = "";
    pickupFields.text.value = "";
    pickupFields.imageData.value = "";
    pickupFields.imageFile.value = "";
    updatePickupImagePreview("");
    renderPickupNewsList();
    setPickupStatus("NEWSを投稿しました");
  });

  pickupFields.list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-pickup-delete]");
    if (!button) return;
    pickupNews = CLOVER.savePickupNews(pickupNews.filter((item) => item.id !== button.dataset.pickupDelete));
    renderPickupNewsList();
    setPickupStatus("NEWSを削除しました");
  });

  fields.qaList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-qa-delete]");
    if (!button) return;
    currentQa = currentQa.filter((item) => item.id !== button.dataset.qaDelete);
    renderQaList();
    setStatus("Q&Aを削除しました。保存してください");
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

  pickupFields.imageFile.addEventListener("change", () => {
    const file = pickupFields.imageFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      pickupFields.imageData.value = reader.result;
      updatePickupImagePreview(reader.result);
    });
    reader.readAsDataURL(file);
  });

  document.getElementById("clearPickupImageButton").addEventListener("click", () => {
    pickupFields.imageData.value = "";
    pickupFields.imageFile.value = "";
    updatePickupImagePreview("");
  });

  document.querySelectorAll("[data-admin-tab]").forEach((button) => {
    button.addEventListener("click", () => showAdminPanel(button.dataset.adminTab));
  });

  fields.name.addEventListener("input", () => {
    if (!fields.photoData.value) updatePhotoPreview("", fields.name.value);
  });

  renderList();
  pickupFields.date.value = CLOVER.dateKey(new Date());
  updatePickupImagePreview("");
  renderPickupNewsList();
  fillSiteForm();
  fillForm(selectedCast());

  document.addEventListener("clover:data-sync", () => {
    casts = CLOVER.loadCasts();
    selectedId = casts.some((cast) => cast.id === selectedId) ? selectedId : casts[0]?.id || "";
    pickupNews = CLOVER.loadPickupNews();
    renderList();
    renderPickupNewsList();
    fillSiteForm();
    fillForm(selectedCast());
  });
})();
