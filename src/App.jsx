import HeroSection from "./components/Hero";
import Loading from "./components/Loading";
import Row from "./components/MovieRow";
import Header from "./components/Navbar";
import { MovieRowSkeleton } from "./components/Skeleton";
import { endpoints } from "./services/Api";
import { BACKEND_URL } from "./services/Api";
import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const useFetchData = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    trending_tv: null,
    trending_movies: null,
    trending: null,
    airing_today: null,
    popular: null,
    anime: null,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDataPromises = Object.entries(endpoints).map(([key, endpoint]) =>
      axios
        .get(`${BACKEND_URL}${endpoint}`)
        .then((response) => [key, response.data.results])
        .catch((err) => {
          console.error(`Error fetching ${key}:`, err);
          return [key, null];
        })
    );

    Promise.all(fetchDataPromises)
      .then((results) => {
        setData(Object.fromEntries(results));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load content");
        setLoading(false);
      });
  }, []);

  return { loading, data, error };
};

const App = () => {
  const { loading, data, error } = useFetchData();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)]">
        <Header />
        <div className="pt-4">
          <div className="px-4 sm:px-6 lg:px-8 mb-8">
            <div className="relative w-full h-[400px] md:h-[600px] rounded-3xl overflow-hidden bg-[var(--color-bg-tertiary)] skeleton" />
          </div>
          <div className="container mx-auto px-4">
            <MovieRowSkeleton title={true} count={6} />
            <MovieRowSkeleton title={true} count={6} />
            <MovieRowSkeleton title={true} count={6} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--color-bg-secondary)] rounded-2xl p-8 border border-[var(--color-border)]"
            >
              <p className="text-[var(--color-text-secondary)] mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[var(--color-accent-primary)] text-white rounded-full hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <Header />
      <main className="relative">
        <HeroSection />
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {data.trending_movies && (
              <Row items={data.trending_movies} title="Trending Movies" />
            )}
            {data.trending_tv && (
              <Row items={data.trending_tv} title="Trending TV" />
            )}
            {data.anime && <Row items={data.anime} title="Anime" />}
            {data.popular && <Row items={data.popular} title="Popular" />}
            {data.airing_today && (
              <Row items={data.airing_today} title="Airing Today" />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default App;
