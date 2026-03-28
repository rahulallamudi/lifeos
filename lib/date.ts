export function parseDate(value?: string | Date | null) {
  if (!value) {
    return null;
  }

  const parsed =
    value instanceof Date
      ? value
      : /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00`)
        : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function toDateKey(value?: string | Date | null) {
  const date = parseDate(value);

  if (!date) {
    return null;
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function sameDay(
  value?: string | Date | null,
  compareTo?: string | Date | null
) {
  const left = toDateKey(value);
  const right = toDateKey(compareTo);

  return Boolean(left && right && left === right);
}

export function isToday(value?: string | Date | null) {
  return sameDay(value, new Date());
}

export function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export function getCurrentTimestamp() {
  return new Date().toISOString();
}

export function shiftDate(value: string | Date, days: number) {
  const date = parseDate(value);

  if (!date) {
    return null;
  }

  const shiftedDate = new Date(date);
  shiftedDate.setDate(shiftedDate.getDate() + days);

  return shiftedDate;
}

export function shiftDateKey(value: string | Date, days: number) {
  return toDateKey(shiftDate(value, days));
}

export function toDateInputValue(value: Date) {
  return toDateKey(value) ?? "";
}

export function fromDateInputValue(value: string) {
  return new Date(`${value}T00:00:00`);
}
