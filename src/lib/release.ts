/**
 * Checks if a title (movie or series) is released based on its release date string
 * and optionally its production status.
 */
export const isReleased = (
  releaseDateStr?: string | null,
  status?: string | null
): boolean => {
  if (!releaseDateStr) {
    // If no release date is specified but status indicates it is in development
    if (status && ["Planned", "Post Production", "In Production", "Rumored"].includes(status)) {
      return false;
    }
    return true; // Default to true if no data is available to avoid false positives
  }

  try {
    const releaseDate = new Date(releaseDateStr);
    
    // Check if the parsed date is valid
    if (isNaN(releaseDate.getTime())) {
      return true;
    }

    const now = new Date();
    
    // If the release date is in the future, it is not released
    if (releaseDate > now) {
      return false;
    }

    // Double check status flags from TMDB if available
    if (status && ["Planned", "Rumored"].includes(status)) {
      return false;
    }

    return true;
  } catch (e) {
    return true; // Graceful fallback
  }
};

/**
 * Formats a release date string into a user-friendly format (e.g., "November 20, 2026")
 */
export const formatReleaseDate = (dateStr?: string | null): string => {
  if (!dateStr) return "Release date TBD";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};
