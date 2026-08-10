// src/utils/dateLogic.js

const CUTOFF_HOUR = 14;
const CUTOFF_MINUTE = 40;

export const CONTENT_CUTOFF_HOUR = CUTOFF_HOUR;
export const CONTENT_CUTOFF_MINUTE = CUTOFF_MINUTE;

export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isBeforeCutoff(now = new Date()) {
  return (
    now.getHours() < CUTOFF_HOUR ||
    (now.getHours() === CUTOFF_HOUR && now.getMinutes() < CUTOFF_MINUTE)
  );
}

// Zwraca datę "aktywnej" treści: wczoraj przed 11:11, dziś od 11:11.
// new Date(y, m, d) + setDate() poprawnie obsługuje przejście przez
// koniec miesiąca/roku (np. 1 marca - 1 dzień = 28/29 lutego).
export function getActiveContentDate(now = new Date()) {
  const reference = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (isBeforeCutoff(now)) {
    reference.setDate(reference.getDate() - 1);
  }

  return reference;
}

export function getActiveContentDateKey(now = new Date()) {
  return formatDateKey(getActiveContentDate(now));
}

// Najbliższy moment 11:11:00.000 w przyszłości (dziś albo jutro).
export function getNextCutoffDate(now = new Date()) {
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    CUTOFF_HOUR,
    CUTOFF_MINUTE,
    0,
    0
  );

  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}
