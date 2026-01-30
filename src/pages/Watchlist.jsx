import Navbar from "../components/Navbar";
import { useSettings } from "../hooks/useSettings";
import { BACKEND_URL } from "../services/Api";
import { auth, db } from "../services/Firebase";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Calendar,
  Play,
  Heart,
  Film,
  Tv,
  BookmarkX,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createToast } from "vercel-toast";

const WatchlistPage = () => {
  const [watchlistData, setWatchlistData] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userID, setUserID] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();
  const { getImageUrl } = useSettings();

  const fetchWatchlistData = async (userID) => {
    try {
      const q = query(
        collection(db, "watchlist"),
        where("userID", "==", userID)
      );
      const querySnapshot = await getDocs(q);
      const userWatchlist = [];

      querySnapshot.forEach((doc) => {
        userWatchlist.push({ ...doc.data(), docId: doc.id });
      });

      const promises = userWatchlist.map(async ({ type, id }) => {
        const url = `${BACKEND_URL}/api/info/${type}/${id}`;
        const response = await fetch(url);
        const data = await response.json();
        return { ...data, mediaType: type };
      });

      const watchlistDetails = await Promise.all(promises);
      setWatchlistData(watchlistDetails);
      setWatchlistLoading(false);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      setWatchlistLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const userID = user.uid;
          setUserID(userID);
          fetchWatchlistData(userID).then(() => {
            setLoading(false);
          });
        } else {
          navigate("/");
        }
      });
    };
    fetchUserData();
  }, [navigate]);

  const removeFromWatchlist = async (id, type) => {
    setRemovingId(id);
    try {
      const q = query(
        collection(db, "watchlist"),
        where("userID", "==", userID)
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        const data = doc.data();
        if (data.type === type && data.id === id) {
          await deleteDoc(doc.ref);
          createToast("Removed from watchlist", {
            type: "success",
            timeout: 2000,
          });
          fetchWatchlistData(userID);
        }
      });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      createToast("Failed to remove", { type: "error", timeout: 2000 });
    } finally {
      setRemovingId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] bg-bg-tertiary rounded-2xl skeleton"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-olive-drab rounded-full mb-4">
            <Heart className="w-8 h-8 text-floral-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-floral-white">
            My Watchlist
          </h1>
          <p className="text-text-secondary text-lg">
            {watchlistData.length}{" "}
            {watchlistData.length === 1 ? "item" : "items"} saved for later
          </p>
        </motion.div>

        {watchlistLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative w-12 h-12">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-olive-drab"
                style={{ borderTopColor: "transparent" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        ) : watchlistData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-bg-tertiary rounded-full mb-6">
              <BookmarkX className="w-10 h-10 text-text-muted" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-text-secondary">
              Your watchlist is empty
            </h2>
            <p className="text-text-tertiary mb-8 max-w-md mx-auto">
              Start adding movies and TV shows to your watchlist to keep track
              of what you want to watch.
            </p>
            <Button
              className="bg-olive-drab text-floral-white rounded-xl font-semibold hover:bg-olive-drab-hover"
              size="lg"
              onPress={() => navigate("/discover")}
            >
              Discover Content
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {watchlistData.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  layout
                  exit="exit"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Card className="bg-bg-secondary border border-border-default rounded-2xl shadow-lg group hover:shadow-xl hover:border-border-hover transition-all duration-300 overflow-hidden">
                    <div className="relative overflow-hidden">
                      <img
                        src={getImageUrl(item.poster_path, "poster")}
                        alt={item.title || item.name}
                        className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        onClick={() => {
                          const path = item.title
                            ? `/info/movie/${item.id}`
                            : `/info/tv/${item.id}`;
                          navigate(path);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          isIconOnly
                          className="bg-olive-drab text-floral-white rounded-full shadow-lg hover:bg-olive-drab-hover"
                          size="lg"
                          onPress={() => {
                            if (item.title) {
                              navigate(`/watch/movie/${item.id}`);
                            } else {
                              navigate(`/watch/tv/${item.id}/1/1`);
                            }
                          }}
                        >
                          <Play className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Chip
                          startContent={
                            item.title ? (
                              <Film className="w-3 h-3" />
                            ) : (
                              <Tv className="w-3 h-3" />
                            )
                          }
                          variant="solid"
                          size="sm"
                          className="bg-black/60 text-floral-white backdrop-blur-sm border-0"
                        >
                          {item.title ? "Movie" : "TV"}
                        </Chip>
                      </div>
                    </div>

                    <CardBody className="p-4 space-y-3">
                      <h2 className="text-lg font-semibold line-clamp-2 group-hover:text-bone transition-colors">
                        {item.title || item.name}
                      </h2>

                      <div className="flex items-center gap-2 text-sm text-text-tertiary">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(
                            item.release_date || item.first_air_date
                          ).getFullYear()}
                        </span>
                      </div>

                      <Button
                        color="danger"
                        variant="light"
                        startContent={<Trash2 className="w-4 h-4" />}
                        className="w-full rounded-lg font-medium"
                        isLoading={removingId === item.id}
                        onPress={() => {
                          const type = item.title ? "movie" : "tv";
                          removeFromWatchlist(item.id, type);
                        }}
                      >
                        Remove
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
