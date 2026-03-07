export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  original_title: string;
  video: boolean;
  media_type?: "movie";
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  original_name: string;
  origin_country: string[];
  media_type?: "tv";
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  known_for: (Movie | TVShow)[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  budget: number;
  revenue: number;
  tagline: string;
  status: string;
  homepage: string | null;
  imdb_id: string | null;
  production_companies: ProductionCompany[];
  credits?: Credits;
  videos?: {
    results: Video[];
  };
  recommendations?: TMDBResponse<Movie>;
}

export interface TVShowDetails extends TVShow {
  genres: Genre[];
  episode_run_time: number[];
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: Season[];
  tagline: string;
  status: string;
  homepage: string | null;
  in_production: boolean;
  last_air_date: string;
  production_companies: ProductionCompany[];
  credits?: Credits;
  videos?: {
    results: Video[];
  };
  recommendations?: TMDBResponse<TVShow>;
  external_ids?: {
    imdb_id: string | null;
    freebase_mid: string | null;
    freebase_id: string | null;
    tvdb_id: number | null;
    tvrage_id: number | null;
    wikidata_id: string | null;
    facebook_id: string | null;
    instagram_id: string | null;
    twitter_id: string | null;
  };
}

export interface PersonDetails extends Person {
  birthday: string | null;
  deathday: string | null;
  gender: number;
  biography: string;
  place_of_birth: string | null;
  imdb_id: string | null;
  homepage: string | null;
  combined_credits?: {
    cast: (Movie | TVShow)[];
    crew: (Movie | TVShow)[];
  };
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
  episodes?: Episode[];
  credits?: Credits;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
}

export type ContentType = "movie" | "tv";
export type SearchType = "movie" | "tv" | "multi";
export type DiscoverType = "all" | "movie" | "tv";
export type TrendingType = "all" | "movie" | "tv" | "person";
export type TimeWindow = "day" | "week";

export interface DiscoverParams {
  type?: DiscoverType;
  genre?: string;
  year?: number;
  rating_min?: number;
  rating_max?: number;
  sort_by?: string;
  page?: number;
}

export interface SearchParams {
  q: string;
  type?: SearchType;
  page?: number;
}
