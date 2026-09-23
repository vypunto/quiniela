import type { SearchParams, SearchResult } from '../types';
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
