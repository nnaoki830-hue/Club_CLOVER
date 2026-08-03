(function () {
  if (!window.CLOVER) return;

  const ENDPOINT = "/.netlify/functions/site-data";
  const canUseCloud = window.location.protocol === "http:" || window.location.protocol === "https:";
  if (!canUseCloud) return;

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
      news: CLOVER.loadPickupNews()
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
    try {
      const response = await fetch(ENDPOINT, { cache: "no-store" });
      if (!response.ok) return;
      const result = await response.json();
      if (applyData(result.data)) {
        document.dispatchEvent(new CustomEvent("clover:data-sync"));
      }
    } catch (error) {
      // Netlify Functionsが使えない環境ではローカル保存だけで動かします。
    }
  }

  async function push() {
    try {
      await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentData())
      });
    } catch (error) {
      // 通信に失敗しても入力中のブラウザには保存済みです。
    }
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

  window.CLOVER_CLOUD = { pull, push };
  pull();
})();
