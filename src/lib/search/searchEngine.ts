import type { SearchParams, SearchResult, SearchIntent, Movie } from '../types';
import { MockDataProvider } from '../providers/MockDataProvider';

let providerInstance: MockDataProvider | null = null;

function getProvider(): MockDataProvider {
  if (!providerInstance) {
    providerInstance = new MockDataProvider();
  }
  return providerInstance;
}

/**
 * Main search function: accepts SearchParams, returns matching sessions
 * grouped by movie and cinema.
 */
export function searchSessions(params: SearchParams): SearchResult[] {
  const provider = getProvider();
  return provider.searchSessions(params);
}

/**
 * Get all movies currently in the catalog.
 */
export function getAllMovies() {
  return getProvider().getMovies();
}

/**
 * Get a single movie by slug.
 */
export function getMovieBySlug(slug: string) {
  return getProvider().getMovie(slug);
}

/**
 * Get all cinemas.
 */
export function getAllCinemas() {
  return getProvider().getCinemas();
}

/**
 * Get a single cinema by slug.
 */
export function getCinemaBySlug(slug: string) {
  return getProvider().getCinema(slug);
}

/**
 * Get showtimes, optionally filtered.
 */
export function getShowtimes(params?: { movieId?: string; cinemaId?: string; date?: string }) {
  return getProvider().getShowtimes(params);
}

/**
 * Reset the provider instance (useful for testing or refreshing data).
 */
export function resetProvider(): void {
  providerInstance = null;
}

/**
 * Normalize a string for accent-insensitive comparison.
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Check if a movie matches genre criteria (accent-insensitive).
 */
function movieMatchesGenres(movie: Movie, genres: string[]): boolean {
  const normalizedMovieGenres = movie.genres.map(normalize);
  return genres.some((g) => normalizedMovieGenres.includes(normalize(g)));
}

/**
 * Check if a movie matches mood criteria (accent-insensitive).
 */
function movieMatchesMoods(movie: Movie, moods: string[]): boolean {
  if (!movie.moods) return false;
  const normalizedMovieMoods = movie.moods.map(normalize);
  return moods.some((m) => normalizedMovieMoods.includes(normalize(m)));
}

/**
 * Search sessions using a SearchIntent (from the intent parser).
 *
 * Converts the intent into SearchParams and filters by genre/mood/similarTo
 * before delegating to searchSessions.
 */
export function searchByIntent(intent: SearchIntent): SearchResult[] {
  const provider = getProvider();
  const allMovies = provider.getMovies();

  // Find movies matching genre/mood/similarTo criteria
  let candidateMovieIds: string[] | undefined;

  // Handle similarTo: find source movie's genres and moods, then find similar
  if (intent.similarTo) {
    const sourceMovie = allMovies.find(
      (m) => m.slug === intent.similarTo || normalize(m.title) === normalize(intent.similarTo!)
    );
    if (sourceMovie) {
      const similarMovies = allMovies.filter((m) => {
        if (m.id === sourceMovie.id) return false;
        const genreMatch = movieMatchesGenres(m, sourceMovie.genres);
        const moodMatch = sourceMovie.moods ? movieMatchesMoods(m, sourceMovie.moods) : false;
        return genreMatch || moodMatch;
      });
      candidateMovieIds = similarMovies.map((m) => m.id);
    }
  }

  // Handle genre filtering
  if (intent.genre && intent.genre.length > 0) {
    const genreMatches = allMovies
      .filter((m) => movieMatchesGenres(m, intent.genre!))
      .map((m) => m.id);

    if (candidateMovieIds) {
      candidateMovieIds = candidateMovieIds.filter((id) => genreMatches.includes(id));
    } else {
      candidateMovieIds = genreMatches;
    }
  }

  // Handle mood filtering
  if (intent.mood && intent.mood.length > 0) {
    const moodMatches = allMovies
      .filter((m) => movieMatchesMoods(m, intent.mood!))
      .map((m) => m.id);

    if (candidateMovieIds) {
      candidateMovieIds = candidateMovieIds.filter((id) => moodMatches.includes(id));
    } else {
      candidateMovieIds = moodMatches;
    }
  }

  // If we have a specific movie from the intent, use that
  if (intent.movie) {
    const movie = allMovies.find((m) => m.slug === intent.movie);
    if (movie) {
      candidateMovieIds = [movie.id];
    }
  }

  // If we have candidate movies, search for each one; otherwise search broadly
  if (candidateMovieIds && candidateMovieIds.length > 0) {
    const results: SearchResult[] = [];
    for (const movieId of candidateMovieIds) {
      const params: SearchParams = {
        movieId,
        date: intent.date,
        timeFrom: intent.timeFrom,
        timeTo: intent.timeTo,
        language: intent.language?.[0],
        format: intent.format?.[0],
      };
      const movieResults = searchSessions(params);
      results.push(...movieResults);
    }
    return results;
  }

  // Fallback: broad search with whatever params we have
  const params: SearchParams = {
    query: intent.query,
    date: intent.date,
    timeFrom: intent.timeFrom,
    timeTo: intent.timeTo,
    language: intent.language?.[0],
    format: intent.format?.[0],
  };

  return searchSessions(params);
}
