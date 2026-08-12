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

export function tokyoLocalDateTimeInputToUTCISO(value: string): string {
  const [y, m, d, hh, mm] = parseDateTimeParts(value);
  const utcMs = Date.UTC(y, m - 1, d, hh, mm - TOKYO_OFFSET_MINUTES, 0, 0);
  return new Date(utcMs).toISOString();
}

export function tokyoLocalDateInputToUTCISO(value: string): string {
  const [y, m, d] = parseDateParts(value);
  const utcMs = Date.UTC(y, m - 1, d, 0, -TOKYO_OFFSET_MINUTES, 0, 0);
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
