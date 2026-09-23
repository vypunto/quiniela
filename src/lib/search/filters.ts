import type { Showtime } from '../types';

export function filterByLanguage(showtimes: Showtime[], language: string): Showtime[] {
  return showtimes.filter((s) => s.language === language);
}

export function filterByFormat(showtimes: Showtime[], format: string): Showtime[] {
  return showtimes.filter((s) => s.format === format);
}

export function filterByDate(showtimes: Showtime[], date: string): Showtime[] {
  return showtimes.filter((s) => s.date === date);
}

export function filterByTimeRange(
  showtimes: Showtime[],
  timeFrom?: string,
  timeTo?: string
): Showtime[] {
  return showtimes.filter((s) => {
    if (timeFrom && s.time < timeFrom) return false;
    if (timeTo && s.time > timeTo) return false;
    return true;
  });
}

export function applyFilters(
  showtimes: Showtime[],
  params: {
    date?: string;
    timeFrom?: string;
    timeTo?: string;
    language?: string;
    format?: string;
  }
): Showtime[] {
  let result = showtimes;

  if (params.date) {
    result = filterByDate(result, params.date);
  }
  if (params.language) {
    result = filterByLanguage(result, params.language);
  }
  if (params.format) {
    result = filterByFormat(result, params.format);
  }
  if (params.timeFrom || params.timeTo) {
    result = filterByTimeRange(result, params.timeFrom, params.timeTo);
  }

  return result;
}
