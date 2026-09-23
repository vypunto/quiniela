export interface Movie {
  id: string;
  title: string;
  slug: string;
  originalTitle?: string;
  year: number;
  duration: number; // minutes
  genres: string[];
  director: string;
  cast: string[];
  country: string;
  poster?: string;
  synopsis: string;
  rating: number; // 0-10
  ageRating?: string;
  releaseDate?: string; // YYYY-MM-DD
  moods?: string[]; // e.g. ['divertida', 'intensa', 'romantica']
  posterColor?: string; // dominant color hex for placeholder
  editorialTags: EditorialTag[];
  editorialReview?: EditorialReview;
  worthIt?: WorthIt;
}

export interface EditorialTag {
  emoji: string;
  label: string;
  key: string;
}

export interface EditorialReview {
  score: number;
  text: string;
  scores: {
    historia: number;
    direccion: number;
    visual: number;
    entretenimiento: number;
    bandaSonora: number;
  };
}

export interface WorthIt {
  yes: string[];
  no: string[];
}

export interface Cinema {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  neighborhood?: string;
  latitude: number;
  longitude: number;
  website: string;
  bookingBaseUrl: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  language: 'castellano' | 'VO' | 'VOSE';
  format: '2D' | '3D' | 'IMAX' | 'IMAX 3D' | '4DX';
  price?: number;
  bookingUrl?: string;
}

export interface SearchParams {
  query?: string;
  movieId?: string;
  date?: string;
  timeFrom?: string;
  timeTo?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
  language?: string;
  format?: string;
  sortBy?: 'relevance' | 'distance' | 'time' | 'price';
}

export interface SearchResult {
  movie: Movie;
  cinemaResults: CinemaResult[];
  totalSessions: number;
}

export interface CinemaResult {
  cinema: Cinema;
  distance?: number;
  showtimes: Showtime[];
}

export interface NaturalLanguageQuery {
  movieTitle?: string;
  genre?: string;
  date?: string;
  time?: string;
  location?: string;
}

export interface SearchIntent {
  query?: string;
  movie?: string;
  genre?: string[];
  mood?: string[];
  date?: string;
  timeFrom?: string;
  timeTo?: string;
  location?: string;
  radius?: number;
  language?: string[];
  format?: string[];
  similarTo?: string;
}
