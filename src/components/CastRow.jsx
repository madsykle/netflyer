import { useSettings } from "../hooks/useSettings";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CastRow = ({ items, title }) => {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const { settings } = useSettings();

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const row = rowRef.current;
    if (row) {
      row.addEventListener("scroll", checkScroll);
      return () => row.removeEventListener("scroll", checkScroll);
    }
  }, [items]);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  const showScrollIndicators = settings.showScrollIndicators !== false;

  return (
    <motion.div
      className="my-8 relative group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {title && (
        <motion.h2
          className="text-2xl font-semibold text-white mb-4 ml-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {title}
        </motion.h2>
      )}

      <div className="relative">
        {/* Left scroll button */}
        <AnimatePresence>
          {showScrollIndicators && canScrollLeft && isHovering && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onClick={() => scroll("left")}
              className="absolute left-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-r from-[var(--color-bg-primary)] to-transparent flex items-center justify-start pl-2"
              aria-label="Scroll left"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[var(--color-bg-elevated)] transition-all duration-200 hover:scale-110">
                <ChevronLeft className="w-6 h-6 text-white" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right scroll button */}
        <AnimatePresence>
          {showScrollIndicators && canScrollRight && isHovering && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onClick={() => scroll("right")}
              className="absolute right-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-l from-[var(--color-bg-primary)] to-transparent flex items-center justify-end pr-2"
              aria-label="Scroll right"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)]/80 backdrop-blur-sm flex items-center justify-center hover:bg-[var(--color-bg-elevated)] transition-all duration-200 hover:scale-110">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Scrollable container */}
        <div
          ref={rowRef}
          className="flex items-start overflow-x-auto scrollbar-hide space-x-4 px-2 scroll-smooth pb-2"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {items.map((item, index) => (
            <CastCard key={item.id || index} item={item} index={index} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

function CastCard({ item, index }) {
  const navigate = useNavigate();
  const { getImageUrl } = useSettings();
  const [imageLoaded, setImageLoaded] = useState(false);

  const onClick = () => {
    navigate(`/actor/${item.id}`);
  };

  const profileUrl = item.profile_path
    ? getImageUrl(item.profile_path, "profile")
    : "/placeholder-avatar.png";

  return (
    <motion.div
      className="flex-shrink-0 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`View profile of ${item.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="relative group/card w-32 sm:w-40">
        {/* Image container */}
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[var(--color-bg-tertiary)]">
          {/* Skeleton placeholder */}
          {!imageLoaded && <div className="absolute inset-0 skeleton" />}

          {/* Actual image */}
          <img
            src={profileUrl}
            alt={item.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.src = "/placeholder-avatar.png";
              setImageLoaded(true);
            }}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Name */}
        <div className="mt-2 text-center">
          <p className="text-white text-sm font-medium line-clamp-2 group-hover/card:text-[var(--color-accent-primary)] transition-colors">
            {item.name}
          </p>
          {item.character && (
            <p className="text-[var(--color-text-tertiary)] text-xs line-clamp-1 mt-0.5">
              {item.character}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default CastRow;
