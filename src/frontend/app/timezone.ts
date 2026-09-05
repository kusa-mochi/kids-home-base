const TOKYO_OFFSET_MINUTES = 9 * 60;
const TOKYO_TIMEZONE = "Asia/Tokyo";

function parseDateParts(value: string): [number, number, number] {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD");
  }
  const [, y, m, d] = match;
  return [Number(y), Number(m), Number(d)];
}

function parseDateTimeParts(value: string): [number, number, number, number, number] {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) {
    throw new Error("Invalid datetime format. Expected YYYY-MM-DDTHH:mm");
  }
  const [, y, m, d, hh, mm] = match;
  return [Number(y), Number(m), Number(d), Number(hh), Number(mm)];
}

// Functions for converting between Tokyo local time and UTC ISO strings.
export function tokyoLocalDateTimeInputToUTCISO(value: string): string {
  const [y, m, d, hh, mm] = parseDateTimeParts(value);
  const utcMs = Date.UTC(y, m - 1, d, hh, mm - TOKYO_OFFSET_MINUTES, 0, 0);
  return new Date(utcMs).toISOString();
}

// Functions for converting between Tokyo local date and UTC ISO strings.
export function tokyoLocalDateInputToUTCISO(value: string): string {
  const [y, m, d] = parseDateParts(value);
  const utcMs = Date.UTC(y, m - 1, d, 0, -TOKYO_OFFSET_MINUTES, 0, 0);
  return new Date(utcMs).toISOString();
}

// Function for converting a Tokyo local Date object to a datetime UTC ISO string.
export function tokyoLocalDateToUTCISOString(date: Date): string {
  const utcMs = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes() - TOKYO_OFFSET_MINUTES,
    0,
    0
  );
  return new Date(utcMs).toISOString();
}

const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: TOKYO_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function utcIsoToTokyoDisplay(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateTimeFormatter.format(date);
}

export function utcIsoToTokyoDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date();
  }
  return new Date(date.toLocaleString("ja-JP", { timeZone: TOKYO_TIMEZONE }));
}

export function now(): Date {
  if (process.env.NEXT_PUBLIC_DEBUG_NOW) {
    return new Date(process.env.NEXT_PUBLIC_DEBUG_NOW);
  }
  return new Date();
}

// Date -> ローカル時刻文字列
export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
