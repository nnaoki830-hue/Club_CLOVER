(function () {
  if (!window.CLOVER) return;

  const canUseCloud = window.location.protocol === "http:" || window.location.protocol === "https:";
  const config = window.CLOVER_FIREBASE_CONFIG;
  const hasConfig = config && config.apiKey && !String(config.apiKey).includes("ここに") && config.projectId && !String(config.projectId).includes("ここに");

  if (!canUseCloud || !hasConfig || !window.firebase) {
    window.CLOVER_CLOUD = {
      ready: false,
      pull: async function () {},
      push: async function () {}
    };
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }

  const db = firebase.firestore();
  const docRef = db.collection("site").doc("club-clover");

  const original = {
    saveCasts: CLOVER.saveCasts,
    saveSettings: CLOVER.saveSettings,
    saveSchedule: CLOVER.saveSchedule,
    saveScheduleForDate: CLOVER.saveScheduleForDate,
    savePickupNews: CLOVER.savePickupNews,
    resetCasts: CLOVER.resetCasts,
    resetSettings: CLOVER.resetSettings,
    resetPickupNews: CLOVER.resetPickupNews
  };

  let pulling = false;
  let savingTimer = null;

  function readJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function currentData() {
    return {
      casts: CLOVER.loadCasts(),
      settings: CLOVER.loadSettings(),
      schedule: readJson(CLOVER.SCHEDULE_KEY, {}),
      news: CLOVER.loadPickupNews(),
      updatedAt: new Date().toISOString()
    };
  }

  function applyData(data) {
    if (!data || typeof data !== "object") return false;
    let changed = false;

    if (Array.isArray(data.casts) && data.casts.length) {
      localStorage.setItem(CLOVER.STORAGE_KEY, JSON.stringify(data.casts));
      changed = true;
    }
    if (data.settings && Object.keys(data.settings).length) {
      localStorage.setItem(CLOVER.SETTINGS_KEY, JSON.stringify(data.settings));
      changed = true;
    }
    if (data.schedule && typeof data.schedule === "object") {
      localStorage.setItem(CLOVER.SCHEDULE_KEY, JSON.stringify(data.schedule));
      changed = true;
    }
    if (Array.isArray(data.news)) {
      localStorage.setItem(CLOVER.NEWS_KEY, JSON.stringify(data.news));
      changed = true;
    }

    return changed;
  }

  async function pull() {
    pulling = true;
    try {
      const snapshot = await docRef.get();
      if (snapshot.exists && applyData(snapshot.data())) {
        document.dispatchEvent(new CustomEvent("clover:data-sync"));
      }
    } catch (error) {
      console.warn("Firebaseから読み込みできませんでした", error);
    } finally {
      pulling = false;
    }
  }

  async function pushNow() {
    if (pulling) return;
    try {
      await docRef.set(currentData(), { merge: true });
    } catch (error) {
      console.warn("Firebaseへ保存できませんでした", error);
    }
  }

  function push() {
    clearTimeout(savingTimer);
    savingTimer = setTimeout(pushNow, 250);
  }

  CLOVER.saveCasts = function patchedSaveCasts(casts) {
    const value = original.saveCasts(casts);
    push();
    return value;
  };

  CLOVER.saveSettings = function patchedSaveSettings(settings) {
    const value = original.saveSettings(settings);
    push();
    return value;
  };

  CLOVER.saveSchedule = function patchedSaveSchedule(schedule) {
    const value = original.saveSchedule(schedule);
    push();
    return value;
  };

  CLOVER.saveScheduleForDate = function patchedSaveScheduleForDate(date, entries) {
    const value = original.saveScheduleForDate(date, entries);
    push();
    return value;
  };

  CLOVER.savePickupNews = function patchedSavePickupNews(items) {
    const value = original.savePickupNews(items);
    push();
    return value;
  };

  CLOVER.resetCasts = function patchedResetCasts() {
    const value = original.resetCasts();
    push();
    return value;
  };

  CLOVER.resetSettings = function patchedResetSettings() {
    const value = original.resetSettings();
    push();
    return value;
  };

  CLOVER.resetPickupNews = function patchedResetPickupNews() {
    const value = original.resetPickupNews();
    push();
    return value;
  };

  window.CLOVER_CLOUD = { ready: true, pull, push: pushNow };
  pull();
})();
