import type { Movie, Cinema, Showtime, SearchParams, SearchResult } from '../types';

export interface DataProvider {
  getMovies(): Movie[];
  getMovie(slug: string): Movie | undefined;
  getCinemas(): Cinema[];
  getCinema(slug: string): Cinema | undefined;
  getShowtimes(params?: { movieId?: string; cinemaId?: string; date?: string }): Showtime[];
  searchSessions(params: SearchParams): SearchResult[];
}
