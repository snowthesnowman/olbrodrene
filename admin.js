const STORAGE_KEY = "mathiasbooking.localCalendar.unavailableSlots.v1";
const SLOTS = [
  { start: "18:00", end: "20:00" },
  { start: "20:00", end: "22:00" },
  { start: "22:00", end: "00:00" },
];
const VALID_SLOT_KEY = /^2026-12-(0[4-9]|[12]\d|3[01])\|(18:00|20:00|22:00)$/;
const CLOSED_DATES = new Set([
  "2026-12-24",
  "2026-12-25",
  "2026-12-26",
  "2026-12-31",
]);
const calendar = document.querySelector("#admin-calendar");
const status = document.querySelector("#admin-status");

let blockedSlots = new Set();
let storageReady = true;

function readBlockedSlots() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) return new Set();

  const values = JSON.parse(saved);
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string" || !VALID_SLOT_KEY.test(value))) {
    throw new Error("Lokal kalenderdata har et ugyldig format.");
  }
  return new Set(values);
}

function setStatus(message, isError = false) {
  status.textContent = message;
  if (isError) status.dataset.state = "error";
  else status.removeAttribute("data-state");
}

function formatDate(day) {
  const date = new Date(Date.UTC(2026, 11, day));
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}

function renderCalendar() {
  calendar.replaceChildren();

  for (let day = 4; day <= 31; day += 1) {
    const date = `2026-12-${String(day).padStart(2, "0")}`;
    const isClosed = CLOSED_DATES.has(date);
    const card = document.createElement("section");
    const heading = document.createElement("h2");
    const slotList = document.createElement("div");
    card.className = "day-card";
    heading.textContent = formatDate(day);
    slotList.className = "slot-list";

    for (const slot of SLOTS) {
      const key = `${date}|${slot.start}`;
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      const text = document.createElement("span");
      label.className = "slot-option";
      checkbox.type = "checkbox";
      checkbox.checked = isClosed || blockedSlots.has(key);
      checkbox.disabled = !storageReady || isClosed;
      checkbox.addEventListener("change", () => {
        const next = new Set(blockedSlots);
        if (checkbox.checked) next.add(key);
        else next.delete(key);

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...next].sort()));
          blockedSlots = next;
          setStatus("Opptatt-statusen er lagret i denne nettleseren.");
        } catch (error) {
          checkbox.checked = blockedSlots.has(key);
          setStatus(`Kunne ikke lagre endringen: ${error.message}`, true);
        }
      });
      text.textContent = `${slot.start}–${slot.end} ${isClosed ? "stengt" : "opptatt"}`;
      label.append(checkbox, text);
      slotList.append(label);
    }

    card.append(heading, slotList);
    calendar.append(card);
  }
}

function loadCalendar() {
  try {
    blockedSlots = readBlockedSlots();
    storageReady = true;
    renderCalendar();
    setStatus("Endringer lagres bare i denne nettleseren.");
  } catch (error) {
    storageReady = false;
    renderCalendar();
    setStatus(`Kunne ikke lese lokal kalenderdata: ${error.message}`, true);
  }
}

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY || event.key === null) loadCalendar();
});

loadCalendar();
