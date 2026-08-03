(function () {
  const dateInput = document.getElementById("scheduleDate");
  const list = document.getElementById("scheduleCastList");
  const status = document.getElementById("scheduleStatus");
  const startOptions = CLOVER.timeOptions();
  const endOptions = CLOVER.endTimeOptions();

  function setStatus(message) {
    status.textContent = message;
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => {
      status.textContent = "";
    }, 2200);
  }

  function optionHtml(options, selected) {
    return options
      .map((time) => `<option value="${time}" ${time === selected ? "selected" : ""}>${time}</option>`)
      .join("");
  }

  function render() {
    const casts = CLOVER.loadCasts().filter((cast) => cast.visible);
    const schedule = CLOVER.scheduleForDate(dateInput.value);

    list.innerHTML = casts
      .map((cast) => {
        const entry = schedule[cast.id] || { status: "unknown", start: "19:00", end: "Last" };
        return `
          <article class="schedule-card ${entry.status === "work" ? "" : "is-not-work"}" data-cast-id="${CLOVER.escapeHtml(cast.id)}">
            <div class="schedule-card-head">
              <span>
                <strong>${CLOVER.escapeHtml(cast.name)}</strong>
                <small>${CLOVER.escapeHtml(cast.kana || cast.title)}</small>
              </span>
            </div>
            <div class="schedule-status" role="group" aria-label="${CLOVER.escapeHtml(cast.name)}の出勤状態">
              <label><input type="radio" name="status-${CLOVER.escapeHtml(cast.id)}" value="work" ${entry.status === "work" ? "checked" : ""}>出勤</label>
              <label><input type="radio" name="status-${CLOVER.escapeHtml(cast.id)}" value="rest" ${entry.status === "rest" ? "checked" : ""}>休み</label>
              <label><input type="radio" name="status-${CLOVER.escapeHtml(cast.id)}" value="unknown" ${entry.status === "unknown" ? "checked" : ""}>未定</label>
            </div>
            <div class="schedule-time">
              <label>
                <span>出勤</span>
                <select data-start>${optionHtml(startOptions, entry.start)}</select>
              </label>
              <span>から</span>
              <label>
                <span>退勤</span>
                <select data-end>${optionHtml(endOptions, entry.end)}</select>
              </label>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function collectEntries() {
    const entries = {};
    list.querySelectorAll("[data-cast-id]").forEach((card) => {
      const castId = card.dataset.castId;
      entries[castId] = {
        status: card.querySelector("input[type='radio']:checked")?.value || "unknown",
        start: card.querySelector("[data-start]").value,
        end: card.querySelector("[data-end]").value
      };
    });
    return entries;
  }

  function shiftDate(days) {
    const date = new Date(`${dateInput.value}T00:00:00`);
    date.setDate(date.getDate() + days);
    dateInput.value = CLOVER.dateKey(date);
    render();
  }

  dateInput.value = CLOVER.dateKey(new Date());
  dateInput.addEventListener("change", render);
  list.addEventListener("change", (event) => {
    const input = event.target.closest("input[type='radio']");
    if (!input) return;
    input.closest(".schedule-card").classList.toggle("is-not-work", input.value !== "work");
  });
  document.getElementById("prevDateButton").addEventListener("click", () => shiftDate(-1));
  document.getElementById("nextDateButton").addEventListener("click", () => shiftDate(1));
  document.getElementById("saveScheduleButton").addEventListener("click", () => {
    CLOVER.saveScheduleForDate(dateInput.value, collectEntries());
    setStatus("出勤を保存しました");
  });

  document.addEventListener("clover:data-sync", render);

  render();
})();
