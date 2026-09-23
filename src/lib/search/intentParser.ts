import type { SearchIntent } from '../types';

/**
 * Normalize a string for accent-insensitive matching.
 * Uses NFD decomposition to strip combining diacritical marks.
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

// --- Genre detection ---

const GENRE_MAP: Record<string, string> = {
  terror: 'Terror',
  comedia: 'Comedia',
  drama: 'Drama',
  accion: 'Accion',
  aventura: 'Aventura',
  'ciencia ficcion': 'Ciencia ficcion',
  animacion: 'Animacion',
  musical: 'Musical',
  romance: 'Romance',
  thriller: 'Thriller',
  fantasia: 'Fantasia',
  historico: 'Historico',
};

// --- Mood detection ---

const MOOD_MAP: Record<string, string> = {
  divertida: 'divertida',
  divertido: 'divertida',
  intensa: 'intensa',
  intenso: 'intensa',
  romantica: 'romantica',
  romantico: 'romantica',
  pensar: 'reflexiva',
  reflexionar: 'reflexiva',
  espectacular: 'espectacular',
  rara: 'rara',
  raro: 'rara',
  llorar: 'emotiva',
  reir: 'divertida',
};

// --- Day detection ---

const DAY_NAMES: Record<string, number> = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  domingo: 0,
};

function resolveDay(normalized: string): string | undefined {
  const today = new Date();

  if (normalized.includes('hoy')) {
    return formatDate(today);
  }

  if (normalized.includes('manana')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDate(tomorrow);
  }

  for (const [dayName, dayIndex] of Object.entries(DAY_NAMES)) {
    if (normalized.includes(dayName)) {
      return getNextDayOfWeek(today, dayIndex);
    }
  }

  return undefined;
}

function getNextDayOfWeek(from: Date, targetDay: number): string {
  const current = from.getDay();
  let daysAhead = targetDay - current;
  if (daysAhead <= 0) {
    daysAhead += 7;
  }
  const result = new Date(from);
  result.setDate(result.getDate() + daysAhead);
  return formatDate(result);
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- Time detection ---

interface TimeRange {
  timeFrom?: string;
  timeTo?: string;
}

function resolveTime(normalized: string): TimeRange {
  // "sobre las X" / "a las X"
  const sobreLasMatch = normalized.match(/(?:sobre|a)\s+las\s+(\d{1,2})/);
  if (sobreLasMatch) {
    const hour = parseInt(sobreLasMatch[1], 10);
    const adjustedHour = hour < 12 ? hour + 12 : hour; // assume PM for cinema times
    const from = `${String(adjustedHour - 1).padStart(2, '0')}:00`;
    const to = `${String(adjustedHour + 1).padStart(2, '0')}:30`;
    return { timeFrom: from, timeTo: to };
  }

  // "despues de cenar"
  if (normalized.includes('despues de cenar')) {
    return { timeFrom: '21:00' };
  }

  // "despues de comer"
  if (normalized.includes('despues de comer')) {
    return { timeFrom: '15:00', timeTo: '18:00' };
  }

  // "por la tarde"
  if (normalized.includes('por la tarde')) {
    return { timeFrom: '16:00', timeTo: '20:00' };
  }

  // "por la noche"
  if (normalized.includes('por la noche')) {
    return { timeFrom: '20:00' };
  }

  // "por la manana" / "matinal"
  if (normalized.includes('por la manana') || normalized.includes('matinal')) {
    return { timeFrom: '09:00', timeTo: '14:00' };
  }

  // "sesion golfa" / "sesion de noche"
  if (normalized.includes('sesion golfa') || normalized.includes('sesion de noche')) {
    return { timeFrom: '23:00' };
  }

  return {};
}

// --- Language detection ---

const LANGUAGE_MAP: Record<string, string> = {
  vose: 'VOSE',
  'version original subtitulada': 'VOSE',
  subtitulada: 'VOSE',
  vo: 'VO',
  'version original': 'VO',
  original: 'VO',
  castellano: 'castellano',
  doblada: 'castellano',
  espanol: 'castellano',
};

// --- Format detection ---

const FORMAT_MAP: Record<string, string> = {
  imax: 'IMAX',
  '3d': '3D',
  '4dx': '4DX',
};

// --- SimilarTo detection ---

function detectSimilarTo(
  normalized: string,
  knownMovies: Array<{ title: string; slug: string }>
): string | undefined {
  // "parecido a X" / "parecida a X" / "como X" / "similar a X" / "estilo X"
  const patterns = [
    /(?:parecid[oa]|similar)\s+a\s+(.+?)(?:\s+(?:en|por|para|hoy|manana|el|la|los|las|sobre|a|que|con|de)\b|$)/,
    /como\s+(.+?)(?:\s+(?:pero|en|por|para|hoy|manana|el|la|los|las|sobre|a|que|con|de)\b|$)/,
    /estilo\s+(.+?)(?:\s+(?:en|por|para|hoy|manana|el|la|los|las|sobre|a|que|con|de)\b|$)/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      const candidate = match[1].trim();
      // Try to match against known movies
      const movie = matchMovieTitle(candidate, knownMovies);
      if (movie) return movie.slug;
      // Return raw text if no match
      return candidate;
    }
  }

  return undefined;
}

// --- Location detection ---

const KNOWN_LOCATIONS = [
  'chueca',
  'centro',
  'malasana',
  'lavapies',
  'chamberi',
  'salamanca',
  'retiro',
  'arganzuela',
  'moncloa',
  'tetuan',
  'chamartin',
  'fuencarral',
  'latina',
  'carabanchel',
  'usera',
  'vallecas',
  'moratalaz',
  'hortaleza',
  'barajas',
  'callao',
  'gran via',
  'sol',
  'princesa',
  'ideal',
  'plaza espana',
];

function detectLocation(normalized: string): string | undefined {
  // "en X" / "cerca de X" / "por X" / "zona X"
  const locationPatterns = [
    /(?:en|cerca de|por|zona)\s+([\w\s]+?)(?:\s+(?:hoy|manana|sobre|a\s+las|por\s+la|para|que|con|de)\b|$)/,
  ];

  for (const pattern of locationPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const candidate = match[1].trim();
      for (const loc of KNOWN_LOCATIONS) {
        if (candidate.includes(loc) || loc.includes(candidate)) {
          return loc;
        }
      }
    }
  }

  // Direct keyword check
  for (const loc of KNOWN_LOCATIONS) {
    if (normalized.includes(loc)) {
      return loc;
    }
  }

  return undefined;
}

// --- Movie title matching ---

function matchMovieTitle(
  normalized: string,
  knownMovies: Array<{ title: string; slug: string }>
): { title: string; slug: string } | undefined {
  let bestMatch: { title: string; slug: string } | undefined;
  let bestLength = 0;

  for (const movie of knownMovies) {
    const normalizedTitle = normalize(movie.title);
    if (normalized.includes(normalizedTitle) && normalizedTitle.length > bestLength) {
      bestMatch = movie;
      bestLength = normalizedTitle.length;
    }
  }

  return bestMatch;
}

/**
 * Parse a natural language query string into a structured SearchIntent.
 *
 * Uses rule-based string matching with NFD normalization for accent-insensitive
 * comparison. Designed to be swappable with an LLM-based parser in the future.
 *
 * @param query - The natural language query string
 * @param knownMovies - List of known movies for title matching
 * @returns A SearchIntent with detected fields populated
 */
export function parseIntent(
  query: string,
  knownMovies: Array<{ title: string; slug: string }>
): SearchIntent {
  const normalized = normalize(query);
  const intent: SearchIntent = {};

  // Store original query
  intent.query = query;

  // Detect movie title
  const movieMatch = matchMovieTitle(normalized, knownMovies);
  if (movieMatch) {
    intent.movie = movieMatch.slug;
  }

  // Detect similarTo (before genres/moods to avoid false positives)
  const similarTo = detectSimilarTo(normalized, knownMovies);
  if (similarTo) {
    intent.similarTo = similarTo;
  }

  // Detect genres
  const genres: string[] = [];
  for (const [keyword, genre] of Object.entries(GENRE_MAP)) {
    if (normalized.includes(keyword)) {
      genres.push(genre);
    }
  }
  if (genres.length > 0) {
    intent.genre = [...new Set(genres)];
  }

  // Detect moods
  const moods: string[] = [];
  for (const [keyword, mood] of Object.entries(MOOD_MAP)) {
    if (normalized.includes(keyword)) {
      moods.push(mood);
    }
  }
  if (moods.length > 0) {
    intent.mood = [...new Set(moods)];
  }

  // Detect date
  const date = resolveDay(normalized);
  if (date) {
    intent.date = date;
  }

  // Detect time
  const timeRange = resolveTime(normalized);
  if (timeRange.timeFrom) intent.timeFrom = timeRange.timeFrom;
  if (timeRange.timeTo) intent.timeTo = timeRange.timeTo;

  // Detect languages
  const languages: string[] = [];
  for (const [keyword, lang] of Object.entries(LANGUAGE_MAP)) {
    if (normalized.includes(keyword)) {
      languages.push(lang);
    }
  }
  if (languages.length > 0) {
    intent.language = [...new Set(languages)];
  }

  // Detect formats
  const formats: string[] = [];
  for (const [keyword, fmt] of Object.entries(FORMAT_MAP)) {
    if (normalized.includes(keyword)) {
      formats.push(fmt);
    }
  }
  if (formats.length > 0) {
    intent.format = [...new Set(formats)];
  }

  // Detect location
  const location = detectLocation(normalized);
  if (location) {
    intent.location = location;
  }

  return intent;
}
