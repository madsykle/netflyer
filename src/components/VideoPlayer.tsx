'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  SpeakerHigh, 
  SpeakerSlash, 
  ArrowsOut, 
  ArrowsIn,
  Gear, 
  ArrowUUpLeft,
  ArrowUUpRight,
  Spinner,
  SpeakerSimpleHigh
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  url, 
  title = "Streaming", 
  poster,
  autoPlay = true 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowStreamSettings] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const lastPlayPromise = useRef<Promise<void> | null>(null);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        lastPlayPromise.current = videoRef.current.play();
        lastPlayPromise.current.catch(err => {
          if (err.name !== 'AbortError') console.error(err);
        });
      } else {
        if (lastPlayPromise.current !== null) {
          lastPlayPromise.current.then(() => {
            videoRef.current?.pause();
          }).catch(() => {
            // Already aborted or failed, safe to pause anyway
            videoRef.current?.pause();
          });
        } else {
          videoRef.current.pause();
        }
      }
    }
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setMuted(val === 0);
    }
  };

  const toggleMute = useCallback(() => {
    const newMuted = !muted;
    setMuted(newMuted);
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
  }, [muted]);

  // Synchronize volume state with the actual HTML5 video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      if (volume > 0 && muted) {
        setMuted(false);
        videoRef.current.muted = false;
      }
    }
  }, [volume, muted]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skip = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  }, []);

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Autohide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setBuffering(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (url.includes('.m3u8') || url.includes('m3u8-proxy')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      }
    } else {
      video.src = url;
    }

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setBuffering(false);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [url, autoPlay]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          skip(10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(v => Math.min(1, v + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(v => Math.max(0, v - 0.1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, skip]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-black group select-none ${isFullscreen ? 'fixed inset-0 z-[9999]' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        playsInline
        crossOrigin="anonymous"
      />

      {/* Buffering Overlay */}
      <AnimatePresence>
        {buffering && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] pointer-events-none z-10"
          >
             <Spinner className="w-12 h-12 text-[var(--accent)] animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/40 z-20"
          >
            {/* Top Bar */}
            <div className="p-6 flex items-center justify-between">
              <h3 className="text-white font-medium drop-shadow-md truncate max-w-md">
                {title}
              </h3>
            </div>

            {/* Bottom Controls */}
            <div className="p-6 pt-0 space-y-4">
              {/* Progress Bar */}
              <div className="relative w-full h-1.5 group/progress flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                />
                <div className="absolute inset-0 w-full h-full bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--accent)] relative"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button onClick={togglePlay} className="text-white hover:text-[var(--accent)] transition-colors">
                    {playing ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>

                  <div className="flex items-center gap-2">
                    <button onClick={() => skip(-10)} className="text-white/80 hover:text-white transition-colors">
                       <ArrowUUpLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => skip(10)} className="text-white/80 hover:text-white transition-colors">
                       <ArrowUUpRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 group/volume">
                    <button onClick={toggleMute} className="text-white hover:text-[var(--accent)] transition-colors">
                       {muted || volume === 0 ? <SpeakerSlash className="w-6 h-6" /> : volume < 0.5 ? <SpeakerSimpleHigh className="w-6 h-6" /> : <SpeakerHigh className="w-6 h-6" />}
                    </button>
                    <div className="w-0 group-hover/volume:w-24 transition-all duration-300 overflow-hidden flex items-center">
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={muted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-full accent-[var(--accent)]"
                      />
                    </div>
                  </div>

                  <div className="text-xs font-medium text-white/80 font-mono">
                    {formatTime(currentTime)} <span className="opacity-40">/</span> {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <button 
                      onClick={() => setShowStreamSettings(!showSettings)}
                      className="text-white hover:text-[var(--accent)] transition-colors"
                    >
                       <Gear className="w-5 h-5" />
                    </button>
                    
                    <AnimatePresence>
                      {showSettings && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute bottom-full right-0 mb-4 w-48 bg-[#161619] border border-white/10 rounded-[var(--radius-sm)] shadow-2xl p-2 z-50"
                        >
                          <div className="text-[10px] uppercase font-bold text-white/40 px-3 py-2 mb-1 border-b border-white/5">
                            Playback Speed
                          </div>
                          {[0.5, 1, 1.25, 1.5, 2].map(rate => (
                            <button
                              key={rate}
                              onClick={() => {
                                setPlaybackRate(rate);
                                if (videoRef.current) videoRef.current.playbackRate = rate;
                                setShowStreamSettings(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-[var(--radius-sm)] text-xs font-medium transition-colors ${playbackRate === rate ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                            >
                              {rate === 1 ? 'Normal' : `${rate}x`}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button onClick={toggleFullscreen} className="text-white hover:text-[var(--accent)] transition-colors">
                     {isFullscreen ? <ArrowsIn className="w-6 h-6" /> : <ArrowsOut className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;
