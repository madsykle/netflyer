'use client';

import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { providers, getEmbedUrl, Provider, StreamInfo } from "../../../lib/embed";
import { tmdbService } from "../../../lib/tmdb";
import { useSettings } from "../../../hooks/useSettings";
import { isReleased } from "../../../lib/release";
import { ContentType, MovieDetails, TVShowDetails, Season } from "../../../types/tmdb";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import WatchExperience from "../../../components/WatchExperience";

interface Props {
  params: Promise<{ params: string[] }>;
}

function directStreamUrl(stream: StreamInfo): string {
  if (stream.behaviorHints?.tokenHost) return `/api/stream/proxy?url=${encodeURIComponent(stream.url)}`;
  return stream.url;
}

const WatchClient = ({ params }: Props) => {
  const resolvedParams = use(params);
  const { params: routeParams } = resolvedParams;
  const rawType = routeParams[0];
  const rawId = routeParams[1];
  const rawSeason = routeParams[2];
  const rawEpisode = routeParams[3];

  const isValidType = rawType === "movie" || rawType === "tv";
  const isValidId = /^\d{1,10}$/.test(rawId || "");
  const parsedSeason = rawSeason ? parseInt(rawSeason) : 1;
  const parsedEpisode = rawEpisode ? parseInt(rawEpisode) : 1;
  const isValidSeason = !rawSeason || (Number.isInteger(parsedSeason) && parsedSeason > 0 && parsedSeason <= 100);
  const isValidEpisode = !rawEpisode || (Number.isInteger(parsedEpisode) && parsedEpisode > 0 && parsedEpisode <= 2000);
  const isValidParams = isValidType && isValidId && isValidSeason && isValidEpisode;

  const type = (isValidType ? rawType : "movie") as ContentType;
  const id = isValidId ? rawId : "0";
  const currentSeason = isValidSeason ? parsedSeason : 1;
  const currentEpisode = isValidEpisode ? parsedEpisode : 1;
  const router = useRouter();
  const { settings } = useSettings();

  const [provider, setProvider] = useState<Provider>(providers[0].key as Provider);
  const [embedUrl, setEmbedUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(isValidParams ? "" : "Invalid content URL. Please check the link and try again.");
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [details, setDetails] = useState<MovieDetails | TVShowDetails | null>(null);
  const [seasonData, setSeasonData] = useState<Season | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAdNotice, setShowAdNotice] = useState(false);
  const [showSeasonMenu, setShowSeasonMenu] = useState(false);
  const [selectedStream, setSelectedStream] = useState<StreamInfo | null>(null);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [isSecure, setIsSecure] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [nextEpisodeInfo, setNextEpisodeInfo] = useState<{ season: number; episode: number; title: string } | null>(null);
  const countdownActive = React.useRef(false);

  useEffect(() => {
    const savedAutoPlay = localStorage.getItem("netflyer_autoplay_next");
    if (savedAutoPlay !== null) setAutoPlayNext(savedAutoPlay === "true");
    setIsSecure(window.isSecureContext);
  }, []);

  const toggleAutoPlayNext = () => {
    const nextValue = !autoPlayNext;
    setAutoPlayNext(nextValue);
    localStorage.setItem("netflyer_autoplay_next", String(nextValue));
  };

  const getNextEpisodeInfo = useCallback(() => {
    if (type !== "tv" || !details || !seasonData) return null;
    const currentIndex = seasonData.episodes?.findIndex((episode) => episode.episode_number === currentEpisode) ?? -1;
    if (currentIndex !== -1 && currentIndex < (seasonData.episodes?.length ?? 0) - 1) {
      const nextEpisode = seasonData.episodes![currentIndex + 1];
      return { season: currentSeason, episode: nextEpisode.episode_number, title: nextEpisode.name };
    }
    if ("seasons" in details) {
      const nextSeason = currentSeason + 1;
      if (details.seasons?.some((season) => season.season_number === nextSeason && season.episode_count > 0)) {
        return { season: nextSeason, episode: 1, title: `Season ${nextSeason} Episode 1` };
      }
    }
    return null;
  }, [type, details, seasonData, currentSeason, currentEpisode]);

  useEffect(() => {
    countdownActive.current = false;
    setCountdown(null);
    setNextEpisodeInfo(null);
  }, [id, currentSeason, currentEpisode]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      if (nextEpisodeInfo) router.push(`/watch/tv/${id}/${nextEpisodeInfo.season}/${nextEpisodeInfo.episode}`);
      setCountdown(null);
      setNextEpisodeInfo(null);
      countdownActive.current = false;
      return;
    }
    const timer = setTimeout(() => setCountdown((value) => value !== null ? value - 1 : null), 1000);
    return () => clearTimeout(timer);
  }, [countdown, nextEpisodeInfo, id, router]);

  useEffect(() => {
    const hasSeenNotice = sessionStorage.getItem("netflyer_ad_notice");
    if (!hasSeenNotice) {
      const timer = setTimeout(() => setShowAdNotice(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissAdNotice = () => {
    sessionStorage.setItem("netflyer_ad_notice", "true");
    setShowAdNotice(false);
  };

  useEffect(() => onAuthStateChanged(auth, () => undefined), []);

  const fetchEmbedUrl = useCallback(async () => {
    setLoading(true);
    setError("");
    setSelectedStream(null);
    try {
      let currentDetails = details;
      if (!currentDetails) {
        try {
          currentDetails = await tmdbService.getContentDetails(type, parseInt(id));
          setDetails(currentDetails);
        } catch (fetchError) {
          console.error("Failed to load details for release check", fetchError);
        }
      }

      if (currentDetails) {
        const releaseDate = type === "tv" ? (currentDetails as TVShowDetails).first_air_date : (currentDetails as MovieDetails).release_date;
        if (!isReleased(releaseDate, currentDetails.status)) {
          setError("unreleased");
          setLoading(false);
          return;
        }
      }

      try {
        const queryParams = new URLSearchParams({ type, id });
        if (type === "tv") {
          queryParams.set("season", String(currentSeason));
          queryParams.set("episode", String(currentEpisode));
        }
        const response = await fetch(`/api/stream?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          const found = (data.streams ?? []) as StreamInfo[];
          const direct = found.find((stream) => directStreamUrl(stream));
          if (direct) {
            setSelectedStream({ ...direct, url: directStreamUrl(direct) });
            setLoading(false);
            return;
          }
        }
      } catch (streamError) {
        console.warn("Direct stream resolution failed, falling back to iframe:", streamError);
      }

      let url = getEmbedUrl(provider, type, parseInt(id), currentSeason, currentEpisode, settings.defaultVideoQuality);
      if (!url) throw new Error("No video source available");
      if (provider === "vidking") {
        const storageKey = type === "tv" ? `netflyer_progress_${id}_s${currentSeason}_e${currentEpisode}` : `netflyer_progress_${id}`;
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            const savedTime = Number(parsed?.currentTime);
            const savedDuration = Number(parsed?.duration);
            if (Number.isFinite(savedTime) && savedTime > 10 && (!Number.isFinite(savedDuration) || savedTime < savedDuration - 30)) url += `&progress=${Math.floor(savedTime)}`;
          }
        } catch (storageError) {
          console.error("Error reading saved progress:", storageError);
        }
      }
      setEmbedUrl(url);
      setTimeout(() => setLoading(false), 800);
    } catch (fetchError) {
      console.error("Failed to fetch embed URL:", fetchError);
      setError("Video source unavailable. Try another provider.");
      setLoading(false);
    }
  }, [provider, type, id, currentSeason, currentEpisode, details, settings.defaultVideoQuality]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await tmdbService.getContentDetails(type, parseInt(id));
        setDetails(data);
        const releaseDate = type === "tv" ? (data as TVShowDetails).first_air_date : (data as MovieDetails).release_date;
        if (!isReleased(releaseDate, data.status)) {
          setError("unreleased");
          setLoading(false);
          return;
        }
        if (type === "tv") setSeasonData(await tmdbService.getSeasonDetails(parseInt(id), currentSeason));
      } catch (fetchError) {
        console.error("Failed to fetch data:", fetchError);
      }
    };
    fetchData();
  }, [type, id, currentSeason]);

  useEffect(() => {
    fetchEmbedUrl();
  }, [fetchEmbedUrl]);

  useEffect(() => {
    if (!id || !type) return;
    const updateHistory = async () => {
      if (!auth.currentUser) return;
      try {
        await setDoc(doc(db, `watchHistory/${auth.currentUser.uid}/items`, id), { contentId: id, type, season: currentSeason || null, episode: currentEpisode || null, updatedAt: serverTimestamp() }, { merge: true });
      } catch (historyError) {
        console.error("Error updating watch history", historyError);
      }
    };
    updateHistory();
    const interval = setInterval(updateHistory, 30000);
    return () => clearInterval(interval);
  }, [id, type, currentSeason, currentEpisode]);

  useEffect(() => {
    const handlePlayerMessage = async (event: MessageEvent) => {
      const allowedOrigins = ["https://www.vidking.net", "https://vidking.net", "https://vidsrc.pk", "https://vidlink.pro", "https://vidsrc-embed.ru", "https://vidsrc-embed.su", "https://vsrc.su", "https://vixsrc.to", "https://vixsrc.io"];
      if (!allowedOrigins.includes(event.origin) && event.origin !== window.location.origin) return;
      let parsed: any;
      try { parsed = typeof event.data === "string" ? JSON.parse(event.data) : event.data; } catch { return; }
      if (!parsed || parsed.type !== "PLAYER_EVENT" || !parsed.data?.id || parsed.data.id.toString() !== id.toString()) return;
      const payload = parsed.data;
      const mediaType = payload.mediaType === "tv" || payload.mediaType === "movie" ? payload.mediaType : type;
      const currentTime = Number(payload.currentTime);
      const duration = Number(payload.duration);
      const progress = Number(payload.progress);
      if (!Number.isFinite(currentTime) || !Number.isFinite(duration)) return;
      const season = payload.season ? parseInt(payload.season) : currentSeason;
      const episode = payload.episode ? parseInt(payload.episode) : currentEpisode;
      const calculatedProgress = Number.isFinite(progress) ? progress : currentTime / (duration || 1);
      localStorage.setItem(mediaType === "tv" ? `netflyer_progress_${id}_s${season}_e${episode}` : `netflyer_progress_${id}`, JSON.stringify({ currentTime, duration, progress: calculatedProgress, updatedAt: Date.now() }));
      if (autoPlayNext && mediaType === "tv" && duration > 60 && currentTime > 60 && (calculatedProgress > 0.95 || currentTime > duration - 15) && !countdownActive.current) {
        const nextEpisode = getNextEpisodeInfo();
        if (nextEpisode) {
          countdownActive.current = true;
          setNextEpisodeInfo(nextEpisode);
          setCountdown(10);
        }
      }
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, `watchHistory/${auth.currentUser.uid}/items`, id), { contentId: id, type: mediaType, season, episode, progress: calculatedProgress, currentTime, duration, updatedAt: serverTimestamp() }, { merge: true });
        } catch (saveError) {
          console.error("Error saving progress to Firestore:", saveError);
        }
      }
    };
    window.addEventListener("message", handlePlayerMessage);
    return () => window.removeEventListener("message", handlePlayerMessage);
  }, [id, type, currentSeason, currentEpisode, autoPlayNext, getNextEpisodeInfo]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key.toLowerCase() === "r") { event.preventDefault(); fetchEmbedUrl(); }
      if (event.key === "?") { event.preventDefault(); setShowShortcuts((open) => !open); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fetchEmbedUrl]);

  const currentProvider = providers.find((item) => item.key === provider);
  const title = details ? ("title" in details ? details.title : details.name) : "Loading...";
  const fullTitle = type === "tv" ? `${title} - S${currentSeason} E${currentEpisode}` : title;
  const posterUrl = details?.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : undefined;

  return <WatchExperience
    type={type}
    id={id}
    currentSeason={currentSeason}
    currentEpisode={currentEpisode}
    fullTitle={fullTitle}
    posterUrl={posterUrl}
    details={details}
    seasonData={seasonData}
    providers={providers}
    provider={provider}
    setProvider={setProvider}
    currentProvider={currentProvider}
    showProviderMenu={showProviderMenu}
    setShowProviderMenu={setShowProviderMenu}
    fetchEmbedUrl={fetchEmbedUrl}
    loading={loading}
    error={error}
    isSecure={isSecure}
    setIsSecure={setIsSecure}
    selectedStream={selectedStream}
    embedUrl={embedUrl}
    countdown={countdown}
    nextEpisodeInfo={nextEpisodeInfo}
    setCountdown={setCountdown}
    setNextEpisodeInfo={setNextEpisodeInfo}
    countdownActive={countdownActive}
    autoPlayNext={autoPlayNext}
    toggleAutoPlayNext={toggleAutoPlayNext}
    settings={settings}
    showSeasonMenu={showSeasonMenu}
    setShowSeasonMenu={setShowSeasonMenu}
    showShortcuts={showShortcuts}
    setShowShortcuts={setShowShortcuts}
    showAdNotice={showAdNotice}
    dismissAdNotice={dismissAdNotice}
    router={router}
  />;
};

export default WatchClient;
