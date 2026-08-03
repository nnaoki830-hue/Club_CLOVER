(function () {
  let casts = CLOVER.loadCasts();
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
    message: document.getElementById("profileMessage"),
    profile: document.getElementById("profileLong")
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
    fields.message.value = cast.message || "";
    fields.profile.value = cast.profile || "";
    updatePhoto(cast.photo, cast.name);
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
            message: fields.message.value.trim(),
            profile: fields.profile.value.trim(),
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
