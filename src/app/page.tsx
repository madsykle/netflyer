import HeroSection from "../components/Hero";
import HomeClient from "./HomeClient";
import { tmdbService } from "../lib/tmdb";
import { Movie, TVShow, TMDBResponse } from "../types/tmdb";

export default async function Home() {
  let heroMovie = null;
  let trendingMovies: TMDBResponse<Movie> = { page: 1, results: [], total_pages: 0, total_results: 0 };
  let trendingTV: TMDBResponse<TVShow> = { page: 1, results: [], total_pages: 0, total_results: 0 };
  let anime: TMDBResponse<TVShow> = { page: 1, results: [], total_pages: 0, total_results: 0 };
  let popular: TMDBResponse<Movie> = { page: 1, results: [], total_pages: 0, total_results: 0 };
  let airingToday: TMDBResponse<TVShow> = { page: 1, results: [], total_pages: 0, total_results: 0 };

  try {
    const [
      trendingMoviesData,
      trendingTVData,
      animeData,
      popularData,
      airingTodayData,
      weeklyTrending
    ] = await Promise.all([
      tmdbService.getTrendingMovies('week'),
      tmdbService.getTrendingTV('week'),
      tmdbService.getAnime(),
      tmdbService.getPopularMovies(),
      tmdbService.getAiringToday(),
      tmdbService.getTrending('all', 'week')
    ]);

    trendingMovies = trendingMoviesData;
    trendingTV = trendingTVData;
    anime = animeData;
    popular = popularData;
    airingToday = airingTodayData;

    const heroMovies = weeklyTrending.results || [];
    if (heroMovies.length > 0) {
      heroMovies.sort((a: Movie | TVShow, b: Movie | TVShow) => {
        const dateA = new Date((a as Movie).release_date || (a as TVShow).first_air_date || 0);
        const dateB = new Date((b as Movie).release_date || (b as TVShow).first_air_date || 0);
        return dateB.getTime() - dateA.getTime();
      });
      const randomIndex = Math.floor(Math.random() * Math.min(heroMovies.length, 10));
      heroMovie = heroMovies[randomIndex];
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <main className="pb-16">
        <HeroSection movie={heroMovie} />
        <HomeClient 
          trendingMovies={trendingMovies}
          trendingTV={trendingTV}
          anime={anime}
          popular={popular}
          airingToday={airingToday}
        />
      </main>
    </div>
  );
}
