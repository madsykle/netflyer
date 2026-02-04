import { config } from '../config/index.js';
import type { ContentType, TrendingType, TimeWindow, SearchType, DiscoverType, MovieDetails, TVShowDetails, PersonDetails, TMDBResponse, Movie, TVShow, Season } from '../types/index.js';
import { ExternalAPIError, NotFoundError } from '../errors/index.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

class TMDBService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = config.TMDB_API_KEY;
    this.baseUrl = TMDB_BASE_URL;
  }

  private buildUrl(path: string, params?: Record<string, string | number>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    url.searchParams.append('api_key', this.apiKey);
    url.searchParams.append('language', 'en-US');

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async fetch<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundError();
        }
        throw new ExternalAPIError(`TMDB API error: ${response.status}`);
      }

      return await response.json() as Promise<T>;
    } finally {
      clearTimeout(id);
    }
  }

  async getGenres(): Promise<{ movie: { id: number; name: string }[]; tv: { id: number; name: string }[] }> {
    const [movieGenres, tvGenres] = await Promise.all([
      this.fetch<{ genres: { id: number; name: string }[] }>(this.buildUrl('/genre/movie/list')),
      this.fetch<{ genres: { id: number; name: string }[] }>(this.buildUrl('/genre/tv/list')),
    ]);

    return {
      movie: movieGenres.genres,
      tv: tvGenres.genres,
    };
  }

  async getTrending(type: TrendingType = 'all', timeWindow: TimeWindow = 'week', page = 1): Promise<TMDBResponse<Movie | TVShow>> {
    const url = this.buildUrl(`/trending/${type}/${timeWindow}`, { page });
    return this.fetch<TMDBResponse<Movie | TVShow>>(url);
  }

  async getTrendingMovies(timeWindow: TimeWindow = 'week', page = 1): Promise<TMDBResponse<Movie>> {
    const url = this.buildUrl(`/trending/movie/${timeWindow}`, { page });
    return this.fetch<TMDBResponse<Movie>>(url);
  }

  async getTrendingTV(timeWindow: TimeWindow = 'week', page = 1): Promise<TMDBResponse<TVShow>> {
    const url = this.buildUrl(`/trending/tv/${timeWindow}`, { page });
    return this.fetch<TMDBResponse<TVShow>>(url);
  }

  async getAiringToday(page = 1): Promise<TMDBResponse<TVShow>> {
    const url = this.buildUrl('/tv/airing_today', { page, sort_by: 'popularity.desc' });
    return this.fetch<TMDBResponse<TVShow>>(url);
  }

  async getPopularMovies(page = 1): Promise<TMDBResponse<Movie>> {
    const url = this.buildUrl('/movie/popular', { page });
    return this.fetch<TMDBResponse<Movie>>(url);
  }

  async getAnime(page = 1): Promise<TMDBResponse<TVShow>> {
    const url = this.buildUrl('/discover/tv', { 
      page, 
      with_keywords: '210024', 
      sort_by: 'vote_average.desc' 
    });
    return this.fetch<TMDBResponse<TVShow>>(url);
  }

  async getMovieDetails(id: number): Promise<MovieDetails> {
    const url = this.buildUrl(`/movie/${id}`, {
      append_to_response: 'credits,videos,recommendations',
    });
    return this.fetch<MovieDetails>(url);
  }

  async getTVDetails(id: number): Promise<TVShowDetails> {
    const url = this.buildUrl(`/tv/${id}`, {
      append_to_response: 'credits,videos,recommendations,external_ids',
    });
    return this.fetch<TVShowDetails>(url);
  }

  async getPersonDetails(id: number): Promise<PersonDetails> {
    const url = this.buildUrl(`/person/${id}`, {
      append_to_response: 'combined_credits',
    });
    return this.fetch<PersonDetails>(url);
  }

  async getPersonCredits(id: number): Promise<unknown> {
    const url = this.buildUrl(`/person/${id}/combined_credits`);
    return this.fetch<unknown>(url);
  }

  async getContentCredits(type: ContentType, id: number): Promise<unknown> {
    const url = this.buildUrl(`/${type}/${id}/credits`);
    return this.fetch<unknown>(url);
  }

  async getRecommendations(type: ContentType, id: number): Promise<TMDBResponse<Movie | TVShow>> {
    const url = this.buildUrl(`/${type}/${id}/recommendations`);
    return this.fetch<TMDBResponse<Movie | TVShow>>(url);
  }

  async getSimilar(type: ContentType, id: number): Promise<TMDBResponse<Movie | TVShow>> {
    const url = this.buildUrl(`/${type}/${id}/similar`);
    return this.fetch<TMDBResponse<Movie | TVShow>>(url);
  }

  async getSeasonDetails(tvId: number, seasonNumber: number): Promise<Season> {
    const url = this.buildUrl(`/tv/${tvId}/season/${seasonNumber}`, {
      append_to_response: 'credits',
    });
    return this.fetch<Season>(url);
  }

  async search(query: string, type: SearchType = 'multi', page = 1): Promise<TMDBResponse<Movie | TVShow>> {
    const params: Record<string, string | number> = {
      query,
      page,
      include_adult: 'false',
    };

    const url = this.buildUrl(`/search/${type}`, params);
    return this.fetch<TMDBResponse<Movie | TVShow>>(url);
  }

  async discover(params: {
    type: DiscoverType;
    genre?: string;
    year?: number;
    rating_min?: number;
    rating_max?: number;
    sort_by?: string;
    page?: number;
  }): Promise<TMDBResponse<Movie | TVShow> | { movies: TMDBResponse<Movie>; tv: TMDBResponse<TVShow> }> {
    const baseParams: Record<string, string | number> = {
      page: params.page || 1,
      sort_by: params.sort_by || 'popularity.desc',
    };

    if (params.genre) {
      baseParams.with_genres = params.genre;
    }

    if (params.rating_min !== undefined) {
      baseParams['vote_average.gte'] = params.rating_min;
    }

    if (params.rating_max !== undefined) {
      baseParams['vote_average.lte'] = params.rating_max;
    }

    if (params.type === 'movie') {
      if (params.year) {
        baseParams.year = params.year;
      }
      const url = this.buildUrl('/discover/movie', baseParams);
      return this.fetch<TMDBResponse<Movie>>(url);
    }

    if (params.type === 'tv') {
      if (params.year) {
        baseParams.first_air_date_year = params.year;
      }
      const url = this.buildUrl('/discover/tv', baseParams);
      return this.fetch<TMDBResponse<TVShow>>(url);
    }

    const [moviesUrl, tvUrl] = [
      this.buildUrl('/discover/movie', baseParams),
      this.buildUrl('/discover/tv', baseParams),
    ];

    const [movies, tv] = await Promise.all([
      this.fetch<TMDBResponse<Movie>>(moviesUrl),
      this.fetch<TMDBResponse<TVShow>>(tvUrl),
    ]);

    return {
      movies: { ...movies, results: movies.results.slice(0, 10) },
      tv: { ...tv, results: tv.results.slice(0, 10) },
    };
  }

  async getContentDetails(type: ContentType, id: number): Promise<MovieDetails | TVShowDetails> {
    if (type === 'movie') {
      return this.getMovieDetails(id);
    }
    return this.getTVDetails(id);
  }
}

export const tmdbService = new TMDBService();
