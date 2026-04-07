import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
  RotateCcw, RotateCw, BookOpen, Loader2, Settings
} from 'lucide-react';

/* ─── helpers ─── */
const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/* ─── Volume slider ─── */
const VolumeSlider = ({ volume, onVolume }) => (
  <div className="relative flex items-center group/vol">
    <input
      type="range" min={0} max={1} step={0.01}
      value={volume}
      onChange={e => onVolume(Number(e.target.value))}
      style={{ '--val': `${volume * 100}%` }}
      className="vol-range w-0 group-hover/vol:w-20 opacity-0 group-hover/vol:opacity-100
                 transition-all duration-300 ease-out cursor-pointer accent-indigo-400 h-1"
    />
  </div>
);

/* ─── Seek bar ─── */
const SeekBar = ({ current, duration, buffered, onSeek }) => {
  const barRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [hoverPct, setHoverPct] = useState(0);
  const [dragging, setDragging] = useState(false);

  const pct = duration ? (current / duration) * 100 : 0;
  const bufPct = duration ? (buffered / duration) * 100 : 0;

  const seek = useCallback((e) => {
    if (!barRef.current || !duration) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    onSeek(x * duration);
  }, [duration, onSeek]);

  const onMouseMove = useCallback((e) => {
    if (!barRef.current || !duration) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    setHoverPct(x * 100);
    if (dragging) onSeek(x * duration);
  }, [dragging, duration, onSeek]);

  useEffect(() => {
    if (!dragging) return;
    const up = () => setDragging(false);
    window.addEventListener('mouseup', up);
    window.addEventListener('mousemove', onMouseMove);
    return () => { window.removeEventListener('mouseup', up); window.removeEventListener('mousemove', onMouseMove); };
  }, [dragging, onMouseMove]);

  return (
    <div
      ref={barRef}
      className="relative flex items-center h-4 cursor-pointer group/seek"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseMove={onMouseMove}
      onMouseDown={(e) => { setDragging(true); seek(e); }}
    >
      {/* track */}
      <div className="absolute inset-x-0 h-1 rounded-full bg-white/10 group-hover/seek:h-[5px] transition-all duration-150" />
      {/* buffered */}
      <div className="absolute left-0 h-1 rounded-full bg-white/20 group-hover/seek:h-[5px] transition-all duration-150"
           style={{ width: `${bufPct}%` }} />
      {/* played */}
      <div className="absolute left-0 h-1 rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 group-hover/seek:h-[5px] transition-all duration-150"
           style={{ width: `${pct}%` }} />
      {/* hover ghost */}
      {hovering && (
        <div className="absolute left-0 h-1 rounded-full bg-white/15 pointer-events-none group-hover/seek:h-[5px] transition-all duration-150"
             style={{ width: `${hoverPct}%` }} />
      )}
      {/* thumb */}
      <div
        className="absolute w-3 h-3 rounded-full bg-white shadow-lg shadow-indigo-500/40 -translate-x-1/2 opacity-0 group-hover/seek:opacity-100 transition-opacity duration-150"
        style={{ left: `${pct}%` }}
      />
      {/* hover time tooltip */}
      {hovering && duration && (
        <div className="absolute -top-7 -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white text-[10px] font-mono px-1.5 py-0.5 rounded pointer-events-none border border-white/10"
             style={{ left: `${hoverPct}%` }}>
          {fmt((hoverPct / 100) * duration)}
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────── */
const Editorial = ({ secureUrl, thumbnailUrl, duration: propDuration }) => {
  const videoRef     = useRef(null);
  const wrapRef      = useRef(null);
  const hideTimer    = useRef(null);

  const [isPlaying,   setIsPlaying]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(propDuration || 0);
  const [buffered,    setBuffered]    = useState(0);
  const [volume,      setVolume]      = useState(1);
  const [muted,       setMuted]       = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering,  setIsBuffering]  = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const [ended,        setEnded]        = useState(false);
  const [hasStarted,   setHasStarted]   = useState(false);

  const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  /* ── controls auto-hide ── */
  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  }, [isPlaying]);

  const revealControls = useCallback(() => {
    setShowControls(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    if (!isPlaying) { clearTimeout(hideTimer.current); setShowControls(true); }
    else scheduleHide();
    return () => clearTimeout(hideTimer.current);
  }, [isPlaying, scheduleHide]);

  /* ── video event listeners ── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay      = () => { setIsPlaying(true);  setEnded(false); };
    const onPause     = () => setIsPlaying(false);
    const onEnded     = () => { setIsPlaying(false); setEnded(true); };
    const onTimeUpdate = () => {
      setCurrentTime(v.currentTime);
      if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
    };
    const onLoaded    = () => setDuration(v.duration);
    const onWaiting   = () => setIsBuffering(true);
    const onCanPlay   = () => setIsBuffering(false);
    const onVolumeChg = () => { setVolume(v.volume); setMuted(v.muted); };

    v.addEventListener('play',         onPlay);
    v.addEventListener('pause',        onPause);
    v.addEventListener('ended',        onEnded);
    v.addEventListener('timeupdate',   onTimeUpdate);
    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('waiting',      onWaiting);
    v.addEventListener('canplay',      onCanPlay);
    v.addEventListener('volumechange', onVolumeChg);

    return () => {
      v.removeEventListener('play',         onPlay);
      v.removeEventListener('pause',        onPause);
      v.removeEventListener('ended',        onEnded);
      v.removeEventListener('timeupdate',   onTimeUpdate);
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('waiting',      onWaiting);
      v.removeEventListener('canplay',      onCanPlay);
      v.removeEventListener('volumechange', onVolumeChg);
    };
  }, []);

  /* ── fullscreen change listener ── */
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  /* ── keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(document.activeElement) &&
          document.activeElement !== document.body) return;
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft':   e.preventDefault(); skip(-10); break;
        case 'ArrowRight':  e.preventDefault(); skip(10); break;
        case 'm': toggleMute(); break;
        case 'f': toggleFullscreen(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, muted]);

  /* ── actions ── */
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) { v.play(); setHasStarted(true); }
    else v.pause();
  };

  const skip = (secs) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = clamp(v.currentTime + secs, 0, v.duration || 0);
  };

  const handleSeek = (t) => {
    const v = videoRef.current;
    if (v) v.currentTime = t;
  };

  const handleVolume = (val) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted  = val === 0;
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) wrapRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  const setRate = (r) => {
    if (videoRef.current) videoRef.current.playbackRate = r;
    setPlaybackRate(r);
    setShowRateMenu(false);
  };

  const displayVolume = muted ? 0 : volume;

  /* ── no source ── */
  if (!secureUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-2xl border border-dashed border-indigo-500/20 bg-indigo-500/[0.03]">
        <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <BookOpen size={32} className="text-indigo-400/60" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white/40">No editorial video yet</p>
          <p className="text-xs text-white/20 mt-1">Check back after you solve the problem</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Heading row ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25">
            <BookOpen size={13} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-[13px] font-black text-white/90 leading-none">Video Editorial</p>
            <p className="text-[10px] text-white/30 mt-0.5">Step-by-step walkthrough</p>
          </div>
        </div>
        {duration > 0 && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/35">
            {fmt(duration)}
          </span>
        )}
      </div>

      {/* ── Player ── */}
      <div
        ref={wrapRef}
        tabIndex={0}
        className="relative w-full rounded-2xl overflow-hidden bg-black border border-white/8 shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 group"
        onMouseMove={revealControls}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        onClick={(e) => { if (e.target === wrapRef.current || e.target.tagName === 'VIDEO') { togglePlay(); revealControls(); } }}
        style={{ cursor: showControls ? 'default' : 'none' }}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={secureUrl}
          poster={thumbnailUrl}
          className="w-full aspect-video block"
          preload="metadata"
        />

        {/* ── Buffering spinner ── */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
              <Loader2 size={24} className="text-indigo-400 animate-spin" />
            </div>
          </div>
        )}

        {/* ── Big play/replay button (centre overlay, before start or after end) ── */}
        {(!hasStarted || ended) && !isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="p-5 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 shadow-2xl shadow-black/60
                            transition-transform duration-200 group-hover:scale-105">
              {ended
                ? <RotateCcw size={28} className="text-white" />
                : <Play size={28} className="text-white translate-x-0.5 fill-current" />
              }
            </div>
          </div>
        )}

        {/* ── Top gradient (for context) ── */}
        <div className={`absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-black/50 to-transparent pointer-events-none
                         transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} />

        {/* ── Controls overlay ── */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent
                       pt-10 pb-3 px-4 transition-opacity duration-300
                       ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {/* Seek bar */}
          <SeekBar
            current={currentTime}
            duration={duration}
            buffered={buffered}
            onSeek={handleSeek}
          />

          {/* Controls row */}
          <div className="flex items-center justify-between mt-2 gap-2">
            {/* Left cluster */}
            <div className="flex items-center gap-1">
              {/* Skip -10 */}
              <button
                onClick={() => skip(-10)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                title="Rewind 10s (←)"
              >
                <RotateCcw size={14} />
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white hover:text-indigo-300"
                title={isPlaying ? 'Pause (k)' : 'Play (k)'}
              >
                {isPlaying
                  ? <Pause size={18} className="fill-current" />
                  : <Play  size={18} className="fill-current translate-x-px" />
                }
              </button>

              {/* Skip +10 */}
              <button
                onClick={() => skip(10)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                title="Forward 10s (→)"
              >
                <RotateCw size={14} />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1 group/vol">
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                  title="Mute (m)"
                >
                  {displayVolume === 0
                    ? <VolumeX size={15} />
                    : <Volume2 size={15} />
                  }
                </button>
                <div className="overflow-hidden w-0 group-hover/vol:w-20 opacity-0 group-hover/vol:opacity-100 transition-all duration-300">
                  <input
                    type="range" min={0} max={1} step={0.01}
                    value={displayVolume}
                    onChange={e => handleVolume(Number(e.target.value))}
                    className="w-full h-1 cursor-pointer accent-indigo-400"
                    title="Volume"
                  />
                </div>
              </div>

              {/* Time */}
              <span className="text-[11px] font-mono text-white/50 ml-1 select-none tabular-nums">
                {fmt(currentTime)}
                <span className="text-white/25"> / </span>
                {fmt(duration)}
              </span>
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-1">
              {/* Playback speed */}
              <div className="relative">
                <button
                  onClick={() => setShowRateMenu(v => !v)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white text-[11px] font-bold"
                  title="Playback speed"
                >
                  <Settings size={12} />
                  {playbackRate}×
                </button>
                {showRateMenu && (
                  <div className="absolute bottom-full right-0 mb-1.5 py-1 rounded-xl border border-white/10 bg-[#111827]/95 backdrop-blur-xl shadow-2xl shadow-black/60 min-w-[80px] z-50">
                    {rates.map(r => (
                      <button
                        key={r}
                        onClick={() => setRate(r)}
                        className={`w-full text-right px-3 py-1.5 text-[11px] font-mono transition-colors
                          ${playbackRate === r
                            ? 'text-indigo-400 bg-indigo-500/15 font-black'
                            : 'text-white/55 hover:text-white hover:bg-white/6'
                          }`}
                      >
                        {r}×
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                title="Fullscreen (f)"
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Click-to-close rate menu */}
        {showRateMenu && (
          <div className="fixed inset-0 z-40" onClick={() => setShowRateMenu(false)} />
        )}
      </div>

      {/* ── Keyboard shortcuts hint ── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-1">
        {[
          ['Space / K', 'Play / Pause'],
          ['← / →', 'Seek ±10s'],
          ['M', 'Mute'],
          ['F', 'Fullscreen'],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/6 border border-white/10 text-[9px] font-mono font-bold text-white/40">{key}</kbd>
            <span className="text-[10px] text-white/25">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Editorial;