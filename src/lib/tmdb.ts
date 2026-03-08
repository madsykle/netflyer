import { 
  ContentType, 
  TrendingType, 
  TimeWindow, 
  SearchType, 
  DiscoverType, 
  MovieDetails, 
  TVShowDetails, 
  PersonDetails, 
  TMDBResponse, 
  Movie, 
  TVShow, 
  Season 
} from '../types/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class TMDBService {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private readonly DEFAULT_CACHE_TIME = 1000 * 60 * 60; // 1 hour

  constructor() {
    const publicApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const serverApiKey = process.env.TMDB_API_KEY;
    this.apiKey = serverApiKey || publicApiKey || '';
    
    if (!this.apiKey) {
      console.warn('TMDB_API_KEY is not set. API calls will fail.');
    }
    this.baseUrl = TMDB_BASE_URL;
  }

  private buildUrl(path: string, params?: Record<string, string | number>): string {
    const isServer = typeof window === 'undefined';

    if (isServer) {
      // Server-side direct request
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
    } else {
      // Client-side proxy request to hide API key
      const url = new URL('/api/tmdb', window.location.origin);
      url.searchParams.append('path', path);
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
  }

  private async fetcher<T>(url: string, revalidate: number = 3600): Promise<T> {
    const cacheKey = url;
    const ttl = revalidate * 1000; // Convert to milliseconds

    // Check memory cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T;
    }

    // Check for pending request to deduplicate
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending as Promise<T>;
    }

    const request = (async () => {
      try {
        const response = await fetch(url, {
          next: { revalidate },
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status}`);
        }

        const data = await response.json() as T;
        
        // Update cache
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });

        return data;
      } catch (error) {
        console.error('TMDB Fetch Error:', error);
        throw error;
      } finally {
        this.pendingRequests.delete(cacheKey);
      }
    })();

    this.pendingRequests.set(cacheKey, request);
    return request;
  }

  async getGenres(): Promise<{ movie: { id: number; name: string }[]; tv: { id: number; name: string }[] }> {
    const [movieGenres, tvGenres] = await Promise.all([
      this.fetcher<{ genres: { id: number; name: string }[] }>(this.buildUrl('/genre/movie/list'), 86400), // 24h
      this.fetcher<{ genres: { id: number; name: string }[] }>(this.buildUrl('/genre/tv/list'), 86400), // 24h
    ]);

    return {
      movie: movieGenres.genres,
      tv: tvGenres.genres,
    };
  }

  async getTrending(type: TrendingType = 'all', timeWindow: TimeWindow = 'week', page = 1): Promise<TMDBResponse<Movie | TVShow>> {
    const url = this.buildUrl(`/trending/${type}/${timeWindow}`, { page });
    return this.fetcher<TMDBResponse<Movie | TVShow>>(url, 3600); // 1h
  }

  async getTrendingMovies(timeWindow: TimeWindow = 'week', page = 1): Promise<TMDBResponse<Movie>> {
    const url = this.buildUrl(`/trending/movie/${timeWindow}`, { page });
    return this.fetcher<TMDBResponse<Movie>>(url, 3600); // 1h
  }

  async getTrendingTV(timeWindow: TimeWindow = 'week', page = 1): Promise<TMDBResponse<TVShow>> {
    const url = this.buildUrl(`/trending/tv/${timeWindow}`, { page });
    return this.fetcher<TMDBResponse<TVShow>>(url, 3600); // 1h
  }

  async getAiringToday(page = 1): Promise<TMDBResponse<TVShow>> {
    const url = this.buildUrl('/tv/airing_today', { page, sort_by: 'popularity.desc' });
    return this.fetcher<TMDBResponse<TVShow>>(url, 3600); // 1h
  }

  async getPopularMovies(page = 1): Promise<TMDBResponse<Movie>> {
    const url = this.buildUrl('/movie/popular', { page });
    return this.fetcher<TMDBResponse<Movie>>(url, 3600); // 1h
  }

  async getAnime(page = 1): Promise<TMDBResponse<TVShow>> {
    const url = this.buildUrl('/discover/tv', { 
      page, 
      with_keywords: '210024', 
      sort_by: 'vote_average.desc' 
    });
    return this.fetcher<TMDBResponse<TVShow>>(url, 3600); // 1h
  }

  async getMovieDetails(id: number): Promise<MovieDetails> {
    const url = this.buildUrl(`/movie/${id}`, {
      append_to_response: 'credits,videos,recommendations',
    });
    return this.fetcher<MovieDetails>(url, 43200); // 12h
  }

  async getTVDetails(id: number): Promise<TVShowDetails> {
    const url = this.buildUrl(`/tv/${id}`, {
      append_to_response: 'credits,videos,recommendations,external_ids',
    });
    return this.fetcher<TVShowDetails>(url, 43200); // 12h
  }

  async getPersonDetails(id: number): Promise<PersonDetails> {
    const url = this.buildUrl(`/person/${id}`, {
      append_to_response: 'combined_credits',
    });
    return this.fetcher<PersonDetails>(url, 43200); // 12h
  }

  async getRecommendations(type: ContentType, id: number): Promise<TMDBResponse<Movie | TVShow>> {
    const url = this.buildUrl(`/${type}/${id}/recommendations`);
    return this.fetcher<TMDBResponse<Movie | TVShow>>(url, 21600); // 6h
  }

  async getVideos(type: ContentType, id: number): Promise<{ results: any[] }> {
    const url = this.buildUrl(`/${type}/${id}/videos`);
    return this.fetcher<{ results: any[] }>(url, 43200); // 12h
  }

  async getSimilar(type: ContentType, id: number): Promise<TMDBResponse<Movie | TVShow>> {
    const url = this.buildUrl(`/${type}/${id}/similar`);
    return this.fetcher<TMDBResponse<Movie | TVShow>>(url, 21600); // 6h
  }

  async getSeasonDetails(tvId: number, seasonNumber: number): Promise<Season> {
    const url = this.buildUrl(`/tv/${tvId}/season/${seasonNumber}`, {
      append_to_response: 'credits',
    });
    return this.fetcher<Season>(url, 43200); // 12h
  }

  async search(query: string, type: SearchType = 'multi', page = 1): Promise<TMDBResponse<Movie | TVShow>> {
    const params: Record<string, string | number> = {
      query,
      page,
      include_adult: 'false',
    };

    const url = this.buildUrl(`/search/${type}`, params);
    return this.fetcher<TMDBResponse<Movie | TVShow>>(url, 3600); // 1h
  }

  async discover(params: {
    type: DiscoverType;
    genre?: string;
    year?: number;
    rating_min?: number;
    rating_max?: number;
    sort_by?: string;
    page?: number;
  }): Promise<TMDBResponse<Movie | TVShow>> {
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
      return this.fetcher<TMDBResponse<Movie>>(url, 3600); // 1h
    }

    if (params.type === 'tv') {
      if (params.year) {
        baseParams.first_air_date_year = params.year;
      }
      const url = this.buildUrl('/discover/tv', baseParams);
      return this.fetcher<TMDBResponse<TVShow>>(url, 3600); // 1h
    }

    const [moviesUrl, tvUrl] = [
      this.buildUrl('/discover/movie', baseParams),
      this.buildUrl('/discover/tv', baseParams),
    ];

    const [movies, tv] = await Promise.all([
      this.fetcher<TMDBResponse<Movie>>(moviesUrl, 3600),
      this.fetcher<TMDBResponse<TVShow>>(tvUrl, 3600),
    ]);

    const combinedResults = [...(movies.results || []), ...(tv.results || [])];
    
    return {
      page: params.page || 1,
      results: combinedResults,
      total_pages: Math.max(movies.total_pages || 1, tv.total_pages || 1),
      total_results: (movies.total_results || 0) + (tv.total_results || 0),
    };
  }

  async getMovieImages(id: number): Promise<{ backdrops: { file_path: string }[] }> {
    const url = this.buildUrl(`/movie/${id}/images`);
    return this.fetcher(url, 86400); // 24h
  }

  async getPersonCredits(id: number): Promise<{ cast: (Movie | TVShow & { media_type: string })[]; crew: any[] }> {
    const url = this.buildUrl(`/person/${id}/combined_credits`);
    return this.fetcher(url, 43200); // 12h
  }

  async getContentCredits(type: ContentType, id: number): Promise<any> {
    const url = this.buildUrl(`/${type}/${id}/credits`);
    return this.fetcher(url, 43200); // 12h
  }

  async getContentDetails(type: ContentType, id: number): Promise<MovieDetails | TVShowDetails> {
    if (type === 'movie') {
      return this.getMovieDetails(id);
    }
    return this.getTVDetails(id);
  }
}

export const tmdbService = new TMDBService();
