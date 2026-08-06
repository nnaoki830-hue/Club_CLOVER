(function () {
  let casts = CLOVER.loadCasts();
  let currentQa = [];
  const select = document.getElementById("profileCastSelect");
  const status = document.getElementById("profileStatus");
  const fields = {
    photoData: document.getElementById("profilePhotoData"),
    photoFile: document.getElementById("profilePhoto"),
    photoPreview: document.getElementById("profilePhotoPreview"),
    name: document.getElementById("profileName"),
    kana: document.getElementById("profileKana"),
    title: document.getElementById("profileTitle"),
    pokepalaUrl: document.getElementById("profilePokepalaUrl"),
    birthday: document.getElementById("profileBirthday"),
    age: document.getElementById("profileAge"),
    height: document.getElementById("profileHeight"),
    bloodType: document.getElementById("profileBloodType"),
    socialX: document.getElementById("profileSocialX"),
    socialInstagram: document.getElementById("profileSocialInstagram"),
    socialTikTok: document.getElementById("profileSocialTikTok"),
    socialLine: document.getElementById("profileSocialLine"),
    qaQuestion: document.getElementById("profileQaQuestion"),
    qaAnswer: document.getElementById("profileQaAnswer"),
    addQaButton: document.getElementById("profileAddQaButton"),
    qaList: document.getElementById("profileQaList")
  };

  function setStatus(message) {
    status.textContent = message;
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => {
      status.textContent = "";
    }, 2200);
  }

  function selectedCast() {
    return casts.find((cast) => cast.id === select.value) || casts[0];
  }

  function updatePhoto(photo, name) {
    fields.photoPreview.classList.toggle("has-photo", Boolean(photo));
    fields.photoPreview.innerHTML = photo
      ? `<img src="${photo}" alt="${CLOVER.escapeHtml(name || "CAST")}">`
      : `<span class="placeholder-logo"><img src="assets/images/logo-clover-main.png" alt=""></span>`;
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

  function fillSelect() {
    select.innerHTML = casts
      .map((cast) => `<option value="${CLOVER.escapeHtml(cast.id)}">${CLOVER.escapeHtml(cast.name)}</option>`)
      .join("");
  }

  function fillForm() {
    const cast = selectedCast();
    if (!cast) return;
    fields.photoData.value = cast.photo || "";
    fields.photoFile.value = "";
    fields.name.value = cast.name || "";
    fields.kana.value = cast.kana || "";
    fields.title.value = cast.title || "";
    fields.pokepalaUrl.value = cast.pokepalaUrl || "";
    fields.birthday.value = cast.birthday || "";
    fields.age.value = cast.age || "";
    fields.height.value = cast.height || "";
    fields.bloodType.value = cast.bloodType || "";
    fields.socialX.value = cast.sns?.x || "";
    fields.socialInstagram.value = cast.sns?.instagram || "";
    fields.socialTikTok.value = cast.sns?.tiktok || "";
    fields.socialLine.value = cast.sns?.line || "";
    currentQa = Array.isArray(cast.qa) ? [...cast.qa] : [];
    updatePhoto(cast.photo, cast.name);
    renderQaList();
  }

  document.getElementById("profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const id = select.value;
    casts = casts.map((cast) =>
      cast.id === id
        ? {
            ...cast,
            name: fields.name.value.trim(),
            kana: fields.kana.value.trim(),
            title: fields.title.value.trim(),
            pokepalaUrl: fields.pokepalaUrl.value.trim(),
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
            message: "",
            profile: "",
            photo: fields.photoData.value
          }
        : cast
    );
    CLOVER.saveCasts(casts);
    casts = CLOVER.loadCasts();
    fillSelect();
    select.value = id;
    fillForm();
    setStatus("プロフィールを保存しました");
  });

  fields.addQaButton.addEventListener("click", () => {
    const question = fields.qaQuestion.value.trim();
    const answer = fields.qaAnswer.value.trim();
    if (!question || !answer) {
      setStatus("Q&Aの質問と回答を入力してください");
      return;
    }
    currentQa = [...currentQa, { id: `qa-${Date.now()}`, question, answer }];
    fields.qaQuestion.value = "";
    fields.qaAnswer.value = "";
    renderQaList();
    setStatus("Q&Aを追加しました。保存してください");
  });

  fields.qaList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-qa-delete]");
    if (!button) return;
    currentQa = currentQa.filter((item) => item.id !== button.dataset.qaDelete);
    renderQaList();
    setStatus("Q&Aを削除しました。保存してください");
  });

  select.addEventListener("change", fillForm);
  document.getElementById("profileClearPhoto").addEventListener("click", () => {
    fields.photoData.value = "";
    fields.photoFile.value = "";
    updatePhoto("", fields.name.value);
  });
  fields.photoFile.addEventListener("change", () => {
    const file = fields.photoFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      fields.photoData.value = reader.result;
      updatePhoto(reader.result, fields.name.value);
    });
    reader.readAsDataURL(file);
  });

  document.addEventListener("clover:data-sync", () => {
    const selectedId = select.value;
    casts = CLOVER.loadCasts();
    fillSelect();
    if (casts.some((cast) => cast.id === selectedId)) select.value = selectedId;
    fillForm();
  });

  fillSelect();
  fillForm();
})();
