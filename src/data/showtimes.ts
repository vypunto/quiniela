import type { Showtime } from '../lib/types';
import { movies } from './movies';
import { cinemas } from './cinemas';

// Deterministic pseudo-random based on a seed string
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: string): number {
  return (hashCode(seed) % 10000) / 10000;
}

function getToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const TIMES_WEEKDAY = ['16:00', '17:30', '18:15', '19:00', '20:00', '20:30', '21:45', '22:00', '22:30'];
const TIMES_WEEKEND = ['11:00', '12:00', '12:30', '15:00', '16:00', '16:30', '17:30', '18:00', '19:00', '19:30', '20:00', '20:30', '21:00', '21:45', '22:15', '22:30', '00:00'];

const LANGUAGES: Array<Showtime['language']> = ['castellano', 'VO', 'VOSE'];
const FORMATS: Array<Showtime['format']> = ['2D', '3D', 'IMAX', 'IMAX 3D', '4DX'];

// Which cinemas have IMAX/3D/4DX capability
const IMAX_CINEMAS = ['cin-001', 'cin-008', 'cin-009', 'cin-014', 'cin-015'];
const THREE_D_CINEMAS = ['cin-001', 'cin-002', 'cin-008', 'cin-009', 'cin-011', 'cin-014', 'cin-015', 'cin-016', 'cin-017', 'cin-018'];
const FOUR_DX_CINEMAS = ['cin-009', 'cin-014'];

// Art-house cinemas that primarily show VO/VOSE
const ARTHOUSE_CINEMAS = ['cin-003', 'cin-004', 'cin-005', 'cin-006', 'cin-007', 'cin-010', 'cin-013'];

// Distribution: which movies play at which cinemas (not all at all)
// Each movie gets 5-8 cinemas
function getCinemasForMovie(movieId: string): string[] {
  const movieIndex = movies.findIndex((m) => m.id === movieId);
  const allCinemaIds = cinemas.map((c) => c.id);
  const count = 5 + (hashCode(movieId) % 4); // 5 to 8 cinemas
  const selected: string[] = [];
  const offset = hashCode(movieId + 'offset') % allCinemaIds.length;

  for (let i = 0; i < allCinemaIds.length && selected.length < count; i++) {
    const idx = (offset + i * 3 + movieIndex) % allCinemaIds.length;
    const cinemaId = allCinemaIds[idx];
    if (!selected.includes(cinemaId)) {
      selected.push(cinemaId);
    }
  }

  // Art-house films always play at art-house cinemas
  const artMovies = ['mov-005', 'mov-006', 'mov-007', 'mov-008', 'mov-010', 'mov-012', 'mov-015'];
  if (artMovies.includes(movieId)) {
    const artCinemas = ARTHOUSE_CINEMAS.slice(0, 3);
    for (const ac of artCinemas) {
      if (!selected.includes(ac)) {
        selected.push(ac);
      }
    }
  }

  // Blockbusters always at multiplexes
  const blockbusters = ['mov-001', 'mov-004', 'mov-009', 'mov-011', 'mov-014'];
  if (blockbusters.includes(movieId)) {
    const multiplexes = ['cin-001', 'cin-008', 'cin-009', 'cin-014'];
    for (const mp of multiplexes) {
      if (!selected.includes(mp)) {
        selected.push(mp);
      }
    }
  }

  return selected;
}

function getLanguageForShowing(movieId: string, cinemaId: string, seed: string): Showtime['language'] {
  const movie = movies.find((m) => m.id === movieId);
  const isSpanish = movie?.country.includes('España');
  const isArthouse = ARTHOUSE_CINEMAS.includes(cinemaId);

  if (isSpanish) {
    return 'castellano';
  }

  if (isArthouse) {
    const r = seededRandom(seed + 'lang');
    return r < 0.6 ? 'VOSE' : r < 0.85 ? 'VO' : 'castellano';
  }

  const r = seededRandom(seed + 'lang');
  return r < 0.65 ? 'castellano' : r < 0.85 ? 'VOSE' : 'VO';
}

function getFormatForShowing(movieId: string, cinemaId: string, seed: string): Showtime['format'] {
  const movie = movies.find((m) => m.id === movieId);
  const hasImax = IMAX_CINEMAS.includes(cinemaId);
  const has3d = THREE_D_CINEMAS.includes(cinemaId);
  const has4dx = FOUR_DX_CINEMAS.includes(cinemaId);

  // Only certain movies in IMAX/3D
  const imaxMovies = ['mov-001', 'mov-004', 'mov-009', 'mov-011', 'mov-014'];
  const threeDMovies = ['mov-001', 'mov-009', 'mov-011'];

  const r = seededRandom(seed + 'format');

  if (hasImax && imaxMovies.includes(movieId) && r < 0.2) {
    if (has3d && threeDMovies.includes(movieId) && r < 0.05) {
      return 'IMAX 3D';
    }
    return 'IMAX';
  }

  if (has3d && threeDMovies.includes(movieId) && r < 0.15) {
    return '3D';
  }

  if (has4dx && imaxMovies.includes(movieId) && r < 0.1) {
    return '4DX';
  }

  return '2D';
}

function getPriceForShowing(format: Showtime['format'], cinemaId: string, dayOfWeek: number, seed: string): number {
  let base: number;

  // Art-house cinemas are cheaper
  if (ARTHOUSE_CINEMAS.includes(cinemaId)) {
    base = 7.5 + seededRandom(seed + 'price') * 2;
  } else {
    base = 8.5 + seededRandom(seed + 'price') * 3;
  }

  // Dia del espectador (miercoles)
  if (dayOfWeek === 3) {
    base -= 2.0;
  }

  // Weekend surcharge
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    base += 1.0;
  }

  // Format surcharges
  switch (format) {
    case '3D':
      base += 2.0;
      break;
    case 'IMAX':
      base += 3.5;
      break;
    case 'IMAX 3D':
      base += 5.0;
      break;
    case '4DX':
      base += 4.0;
      break;
  }

  return Math.round(base * 100) / 100;
}

export function generateShowtimes(): Showtime[] {
  const showtimes: Showtime[] = [];
  const today = getToday();
  let idCounter = 1;

  for (const movie of movies) {
    const movieCinemas = getCinemasForMovie(movie.id);

    for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
      const date = addDays(today, dayOffset);
      const dateObj = new Date(date + 'T00:00:00');
      const dayOfWeek = dateObj.getDay(); // 0=Sunday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const availableTimes = isWeekend ? TIMES_WEEKEND : TIMES_WEEKDAY;

      for (const cinemaId of movieCinemas) {
        // Each cinema shows 2-4 sessions per movie per day
        const seed = `${movie.id}-${cinemaId}-${date}`;
        const sessionCount = 2 + (hashCode(seed + 'count') % 3);
        const usedTimes = new Set<string>();

        for (let s = 0; s < sessionCount; s++) {
          const timeSeed = seed + `-s${s}`;
          let timeIdx = hashCode(timeSeed) % availableTimes.length;

          // Avoid duplicate times at same cinema
          let attempts = 0;
          while (usedTimes.has(availableTimes[timeIdx]) && attempts < availableTimes.length) {
            timeIdx = (timeIdx + 1) % availableTimes.length;
            attempts++;
          }
          if (attempts >= availableTimes.length) continue;

          const time = availableTimes[timeIdx];
          usedTimes.add(time);

          const language = getLanguageForShowing(movie.id, cinemaId, timeSeed);
          const format = getFormatForShowing(movie.id, cinemaId, timeSeed);
          const price = getPriceForShowing(format, cinemaId, dayOfWeek, timeSeed);

          const cinema = cinemas.find((c) => c.id === cinemaId);
          const bookingUrl = cinema ? `${cinema.bookingBaseUrl}?movie=${movie.slug}&date=${date}&time=${time}` : undefined;

          showtimes.push({
            id: `st-${String(idCounter++).padStart(5, '0')}`,
            movieId: movie.id,
            cinemaId,
            date,
            time,
            language,
            format,
            price,
            bookingUrl,
          });
        }
      }
    }
  }

  // Sort by date then time
  showtimes.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  return showtimes;
}
