import type { Movie, Cinema, Showtime, SearchParams, SearchResult, CinemaResult } from '../types';
import type { DataProvider } from './DataProvider';
import { movies } from '../../data/movies';
import { cinemas } from '../../data/cinemas';
import { generateShowtimes } from '../../data/showtimes';
import { applyFilters } from '../search/filters';
import { haversineDistance } from '../search/distance';

export class MockDataProvider implements DataProvider {
  private movies: Movie[];
  private cinemas: Cinema[];
  private showtimes: Showtime[];

  constructor() {
    this.movies = movies;
    this.cinemas = cinemas;
    this.showtimes = generateShowtimes();
  }

  getMovies(): Movie[] {
    return this.movies;
  }

  getMovie(slug: string): Movie | undefined {
    return this.movies.find((m) => m.slug === slug);
  }

  getCinemas(): Cinema[] {
    return this.cinemas;
  }

  getCinema(slug: string): Cinema | undefined {
    return this.cinemas.find((c) => c.slug === slug);
  }

  getShowtimes(params?: { movieId?: string; cinemaId?: string; date?: string }): Showtime[] {
    let result = this.showtimes;

    if (params?.movieId) {
      result = result.filter((s) => s.movieId === params.movieId);
    }
    if (params?.cinemaId) {
      result = result.filter((s) => s.cinemaId === params.cinemaId);
    }
    if (params?.date) {
      result = result.filter((s) => s.date === params.date);
    }

    return result;
  }

  searchSessions(params: SearchParams): SearchResult[] {
    // Find matching movies
    let matchingMovies: Movie[];

    if (params.movieId) {
      const movie = this.movies.find((m) => m.id === params.movieId);
      matchingMovies = movie ? [movie] : [];
    } else if (params.query) {
      matchingMovies = this.fuzzyMatchMovies(params.query);
    } else {
      matchingMovies = this.movies;
    }

    const results: SearchResult[] = [];

    for (const movie of matchingMovies) {
      let showtimes = this.getShowtimes({ movieId: movie.id });

      // Apply filters
      showtimes = applyFilters(showtimes, {
        date: params.date,
        timeFrom: params.timeFrom,
        timeTo: params.timeTo,
        language: params.language,
        format: params.format,
      });

      if (showtimes.length === 0) continue;

      // Group by cinema
      const cinemaMap = new Map<string, Showtime[]>();
      for (const st of showtimes) {
        const existing = cinemaMap.get(st.cinemaId) || [];
        existing.push(st);
        cinemaMap.set(st.cinemaId, existing);
      }

      const cinemaResults: CinemaResult[] = [];
      for (const [cinemaId, cinemaShowtimes] of cinemaMap) {
        const cinema = this.cinemas.find((c) => c.id === cinemaId);
        if (!cinema) continue;

        let distance: number | undefined;
        if (params.latitude !== undefined && params.longitude !== undefined) {
          distance = haversineDistance(
            params.latitude,
            params.longitude,
            cinema.latitude,
            cinema.longitude
          );

          // Filter by max distance
          if (params.maxDistance && distance > params.maxDistance) continue;
        }

        // Sort showtimes by date then time
        cinemaShowtimes.sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.time.localeCompare(b.time);
        });

        cinemaResults.push({
          cinema,
          distance,
          showtimes: cinemaShowtimes,
        });
      }

      if (cinemaResults.length === 0) continue;

      // Sort cinema results
      this.sortCinemaResults(cinemaResults, params.sortBy);

      results.push({
        movie,
        cinemaResults,
        totalSessions: showtimes.length,
      });
    }

    return results;
  }

  private fuzzyMatchMovies(query: string): Movie[] {
    const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    return this.movies.filter((movie) => {
      const title = movie.title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const originalTitle = (movie.originalTitle || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const director = movie.director.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const genres = movie.genres.join(' ').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

      return (
        title.includes(normalizedQuery) ||
        originalTitle.includes(normalizedQuery) ||
        director.includes(normalizedQuery) ||
        genres.includes(normalizedQuery) ||
        normalizedQuery.includes(title)
      );
    });
  }

  private sortCinemaResults(
    results: CinemaResult[],
    sortBy?: 'relevance' | 'distance' | 'time' | 'price'
  ): void {
    switch (sortBy) {
      case 'distance':
        results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        break;
      case 'time':
        results.sort((a, b) => {
          const aFirst = a.showtimes[0]?.time ?? '99:99';
          const bFirst = b.showtimes[0]?.time ?? '99:99';
          return aFirst.localeCompare(bFirst);
        });
        break;
      case 'price':
        results.sort((a, b) => {
          const aMin = Math.min(...a.showtimes.map((s) => s.price ?? Infinity));
          const bMin = Math.min(...b.showtimes.map((s) => s.price ?? Infinity));
          return aMin - bMin;
        });
        break;
      case 'relevance':
      default:
        // By number of showtimes (more = more relevant), then distance
        results.sort((a, b) => {
          const diff = b.showtimes.length - a.showtimes.length;
          if (diff !== 0) return diff;
          return (a.distance ?? Infinity) - (b.distance ?? Infinity);
        });
        break;
    }
  }
}
