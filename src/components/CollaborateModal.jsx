import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Users, X, Copy, Check, ArrowRight, Loader2,
  Sparkles, Link2, Hash, Wifi, WifiOff, LogOut,
  Shield, Zap, Activity, Radio
} from 'lucide-react';

/* ─────────────────────────────────────────
   UTILS
───────────────────────────────────────── */
const generateRoomId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) id += '-';
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

const AVATAR_COLORS = [
  { from: 'from-violet-500', to: 'to-indigo-600',  shadow: 'shadow-violet-500/30'  },
  { from: 'from-cyan-500',   to: 'to-teal-600',    shadow: 'shadow-cyan-500/30'    },
  { from: 'from-pink-500',   to: 'to-rose-600',    shadow: 'shadow-pink-500/30'    },
  { from: 'from-amber-500',  to: 'to-orange-600',  shadow: 'shadow-amber-500/30'   },
  { from: 'from-emerald-500',to: 'to-teal-600',    shadow: 'shadow-emerald-500/30' },
  { from: 'from-blue-500',   to: 'to-indigo-600',  shadow: 'shadow-blue-500/30'    },
];

/* ─────────────────────────────────────────
   ANIMATED BACKGROUND PARTICLES
───────────────────────────────────────── */
const Particle = ({ delay, x, y, size }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size,
      background: 'radial-gradient(circle, rgba(139,92,246,0.6), transparent)' }}
    animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0], scale: [0.5, 1.2, 0.5] }}
    transition={{ duration: 4 + Math.random() * 3, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const ParticleField = () => {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 0.4,
    x: 10 + (i * 8) % 80,
    y: 10 + (i * 13) % 80,
    size: 3 + (i % 3) * 2,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => <Particle key={p.id} {...p} />)}
    </div>
  );
};

/* ─────────────────────────────────────────
   ANIMATED GRADIENT BORDER
───────────────────────────────────────── */
const GlowBorder = ({ active = false }) => (
  <motion.div
    className="absolute inset-0 rounded-2xl pointer-events-none"
    animate={active ? { opacity: [0.4, 0.8, 0.4] } : { opacity: 0.3 }}
    transition={{ duration: 2, repeat: Infinity }}
    style={{
      background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2), rgba(236,72,153,0.25))',
      padding: 1,
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
    }}
  />
);

/* ─────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────── */
const CopyBtn = ({ text }) => {
  const [state, setState] = useState('idle'); // idle | copying | copied

  const handleCopy = async () => {
    setState('copying');
    await navigator.clipboard.writeText(text);
    setState('copied');
    setTimeout(() => setState('idle'), 2000);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.93 }}
      onClick={handleCopy}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black
                  border transition-all duration-300 overflow-hidden
                  ${state === 'copied'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                    : 'bg-white/5 border-white/12 text-white/45 hover:text-white hover:bg-white/10 hover:border-violet-500/30'
                  }`}
    >
      {state === 'copied' && (
        <motion.div
          className="absolute inset-0 bg-emerald-500/10"
          initial={{ scale: 0, borderRadius: '100%' }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
      <AnimatePresence mode="wait">
        {state === 'copied' ? (
          <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className="flex items-center gap-1.5">
            <Check size={11} /> Copied!
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className="flex items-center gap-1.5">
            <Copy size={11} /> Copy
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

/* ─────────────────────────────────────────
   ROOM-ID CHARACTER CELLS
───────────────────────────────────────── */
const RoomIdDisplay = ({ roomId }) => {
  const chars = roomId.split('');
  return (
    <div className="flex items-center gap-1 justify-center flex-wrap">
      {chars.map((ch, i) =>
        ch === '-' ? (
          <span key={i} className="text-white/20 font-black text-lg mx-0.5">·</span>
        ) : (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -10, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 22 }}
            className="w-8 h-9 flex items-center justify-center rounded-lg
                       bg-white/5 border border-white/10
                       font-mono font-black text-base text-white/95
                       shadow-inner hover:border-violet-500/40 hover:bg-violet-500/8
                       transition-all duration-200 cursor-default select-all"
          >
            {ch}
          </motion.div>
        )
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   USER AVATAR ROW
───────────────────────────────────────── */
const UserRow = ({ user, index, isYou }) => {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = user.username
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 16, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 320, damping: 25 }}
      className="flex items-center gap-3 p-2.5 rounded-xl
                 bg-white/[0.03] border border-white/6
                 hover:bg-white/6 hover:border-white/12
                 transition-all duration-200 group"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color.from} ${color.to}
                         flex items-center justify-center text-white text-[12px] font-black
                         shadow-lg ${color.shadow}`}>
          {initials}
        </div>
        {/* Online ring pulse */}
        <span className="absolute -bottom-0.5 -right-0.5 flex">
          <span className="absolute inline-flex w-3 h-3 rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0d111e]" />
        </span>
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-white/90 truncate leading-none mb-0.5">
          {user.username}
          {isYou && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-2 text-[9px] font-black text-violet-400 bg-violet-500/15
                         border border-violet-500/25 px-1.5 py-0.5 rounded-full uppercase tracking-wider"
            >
              you
            </motion.span>
          )}
        </p>
        <div className="flex items-center gap-1">
          <Activity size={9} className="text-emerald-400" />
          <span className="text-[10px] text-emerald-400/80 font-semibold">Live coding</span>
        </div>
      </div>

      {/* Right badge */}
      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${color.from} ${color.to}
                       flex items-center justify-center opacity-0 group-hover:opacity-100
                       transition-opacity duration-200`}>
        <Radio size={10} className="text-white" />
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   NETWORK PULSE VISUALISER (decorative)
───────────────────────────────────────── */
const NetworkPulse = ({ count }) => {
  const nodes = Math.min(count, 5);
  if (nodes < 2) return null;

  const centerX = 50, centerY = 50, radius = 32;
  const getPos = (i) => ({
    x: centerX + radius * Math.cos((2 * Math.PI * i) / nodes - Math.PI / 2),
    y: centerY + radius * Math.sin((2 * Math.PI * i) / nodes - Math.PI / 2),
  });

  const positions = Array.from({ length: nodes }, (_, i) => getPos(i));

  return (
    <div className="relative w-full h-24 overflow-hidden rounded-xl bg-white/[0.02] border border-white/6 mb-3">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        {/* Lines between nodes */}
        {positions.map((p1, i) =>
          positions.slice(i + 1).map((p2, j) => (
            <motion.line
              key={`${i}-${j}`}
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke="rgba(139,92,246,0.25)"
              strokeWidth="0.6"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: (i + j) * 0.3 }}
            />
          ))
        )}
        {/* Nodes */}
        {positions.map((pos, i) => {
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
          return (
            <g key={i}>
              <motion.circle
                cx={pos.x} cy={pos.y} r="5"
                fill="rgba(139,92,246,0.15)"
                animate={{ r: [4, 7, 4], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
              />
              <circle cx={pos.x} cy={pos.y} r="3"
                fill="#8b5cf6" opacity="0.9" />
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-2 right-3 text-[10px] text-white/30 font-mono">
        {count} node{count !== 1 ? 's' : ''} syncing
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   OPTION CARD (home view)
───────────────────────────────────────── */
const OptionCard = ({ icon: Icon, title, subtitle, gradient, border, shadow, glow, onClick }) => {
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [5, -5]);

  return (
    <motion.button
      style={{ rotateX, transformPerspective: 800 }}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.97, y: 0 }}
      onClick={onClick}
      className={`relative w-full flex items-center justify-between p-5 rounded-2xl
                  ${gradient} ${border} ${shadow}
                  group overflow-hidden transition-all duration-300
                  hover:${glow}`}
    >
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />

      <div className="flex items-center gap-4 relative z-10">
        <motion.div
          whileHover={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 0.5 }}
          className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient.replace('bg-gradient-to-r','').trim()}
                      flex items-center justify-center shadow-xl`}
        >
          <Icon size={18} className="text-white" />
        </motion.div>
        <div className="text-left">
          <p className="text-[14px] font-black text-white tracking-tight">{title}</p>
          <p className="text-[11px] text-white/45 mt-0.5 font-medium">{subtitle}</p>
        </div>
      </div>

      <motion.div
        animate={{ x: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 text-white/30 group-hover:text-white/70 transition-colors"
      >
        <ArrowRight size={18} />
      </motion.div>
    </motion.button>
  );
};

/* ─────────────────────────────────────────
   LIVE SYNC TICKER
───────────────────────────────────────── */
const SyncTicker = () => (
  <motion.div
    className="flex items-center gap-2 px-3 py-1.5 rounded-full
               bg-emerald-500/8 border border-emerald-500/20
               shadow-[0_0_12px_rgba(16,185,129,0.12)]"
    animate={{ boxShadow: ['0 0 8px rgba(16,185,129,0.1)', '0 0 18px rgba(16,185,129,0.25)', '0 0 8px rgba(16,185,129,0.1)'] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    <span className="flex relative">
      <span className="absolute inline-flex w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
      <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
    </span>
    <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase">Live Sync</span>
    <Zap size={9} className="text-emerald-400 fill-current" />
  </motion.div>
);

/* ─────────────────────────────────────────
   MAIN MODAL
───────────────────────────────────────── */
const CollaborateModal = ({
  isOpen, onClose, onCreateRoom, onJoinRoom, onLeaveRoom,
  roomId, connectedUsers, mySocketId, myUsername, isInRoom, isConnecting,
}) => {
  const [view, setView]           = useState('home');
  const [joinInput, setJoinInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const inputRef = useRef(null);

  const handleCreate = () => {
    const id = generateRoomId();
    onCreateRoom(id);
    setView('created');
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    const trimmed = joinInput.trim().toUpperCase();
    if (!trimmed) { setJoinError('Please enter a room ID.'); return; }
    if (trimmed.replace('-', '').length < 4) { setJoinError('Invalid room ID format.'); return; }
    setJoinError('');
    onJoinRoom(trimmed);
  };

  const handleClose = () => {
    setView('home');
    setJoinInput('');
    setJoinError('');
    setConfirmLeave(false);
    onClose();
  };

  const handleLeave = () => {
    if (!confirmLeave) {
      setConfirmLeave(true);
      setTimeout(() => setConfirmLeave(false), 3000);
      return;
    }
    onLeaveRoom?.();
    handleClose();
  };

  const inRoom = isInRoom || view === 'created';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── BACKDROP ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100]"
            style={{ background: 'rgba(4,7,18,0.75)', backdropFilter: 'blur(16px)' }}
          />

          {/* ── MODAL POSITIONER ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.86, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.86, y: 28 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-[420px] pointer-events-auto rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #0d1020 0%, #0a0d1a 60%, #0d0f1e 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 0 0 1px rgba(139,92,246,0.12), 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(139,92,246,0.08)',
              }}
            >
              {/* Particle field */}
              <ParticleField />

              {/* Ambient top glow */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-40
                              bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-48 h-48
                              bg-cyan-600/8 rounded-full blur-3xl pointer-events-none" />

              {/* Top rainbow shimmer line */}
              <div className="absolute top-0 left-0 w-full h-[1px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(6,182,212,0.6), rgba(236,72,153,0.5), transparent)' }} />

              {/* ── HEADER ── */}
              <div className="relative flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  {/* Animated icon */}
                  <motion.div
                    animate={{ boxShadow: ['0 0 10px rgba(139,92,246,0.3)', '0 0 24px rgba(139,92,246,0.6)', '0 0 10px rgba(139,92,246,0.3)'] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600
                               flex items-center justify-center"
                  >
                    <Users size={16} className="text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-[15px] font-black text-white tracking-tight">Collaborate</h2>
                    <p className="text-[10px] text-white/35 font-medium">Real-time code sharing</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {inRoom && <SyncTicker />}
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="w-8 h-8 rounded-xl flex items-center justify-center
                               text-white/25 hover:text-white transition-all duration-200"
                  >
                    <X size={15} />
                  </motion.button>
                </div>
              </div>

              {/* ── CONTENT ── */}
              <div className="relative p-6">
                <AnimatePresence mode="wait">

                  {/* ══ HOME VIEW ══ */}
                  {!inRoom && view === 'home' && (
                    <motion.div key="home"
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}
                      className="space-y-3"
                    >
                      <p className="text-[13px] text-white/45 leading-relaxed mb-5 font-medium">
                        Code together in real-time — like VS Code Live Share, right in your browser.
                      </p>

                      <OptionCard
                        icon={Sparkles} title="Create Room" subtitle="Start a new collaborative session"
                        gradient="bg-gradient-to-r from-cyan-500/12 to-blue-600/12"
                        border="border border-cyan-500/20 hover:border-cyan-400/45"
                        shadow="shadow-[0_4px_24px_rgba(6,182,212,0.08)]"
                        glow="shadow-[0_4px_40px_rgba(6,182,212,0.22)]"
                        onClick={handleCreate}
                      />
                      <OptionCard
                        icon={Link2} title="Join Room" subtitle="Enter an existing session ID"
                        gradient="bg-gradient-to-r from-violet-600/12 to-indigo-600/12"
                        border="border border-violet-500/20 hover:border-violet-400/45"
                        shadow="shadow-[0_4px_24px_rgba(139,92,246,0.08)]"
                        glow="shadow-[0_4px_40px_rgba(139,92,246,0.22)]"
                        onClick={() => setView('join')}
                      />

                      {/* Feature pills */}
                      <div className="flex gap-2 pt-2 flex-wrap">
                        {['⚡ Instant sync', '🔒 Room-scoped', '🌐 Zero latency'].map(f => (
                          <span key={f} className="text-[10px] text-white/30 px-2.5 py-1 rounded-full
                                                   bg-white/4 border border-white/6 font-semibold">
                            {f}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* ══ JOIN VIEW ══ */}
                  {!inRoom && view === 'join' && (
                    <motion.div key="join"
                      initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}
                      className="space-y-5"
                    >
                      <motion.button
                        whileHover={{ x: -3 }} whileTap={{ scale: 0.96 }}
                        onClick={() => { setView('home'); setJoinError(''); }}
                        className="flex items-center gap-1.5 text-[11px] text-white/35
                                   hover:text-white/65 transition-colors font-semibold"
                      >
                        ← Back
                      </motion.button>

                      <div>
                        <div className="flex items-center gap-1.5 mb-3">
                          <Hash size={11} className="text-violet-400" />
                          <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">
                            Room ID
                          </span>
                        </div>

                        <form onSubmit={handleJoinSubmit} className="space-y-4">
                          <div className="relative group">
                            {/* Glow focus ring */}
                            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-violet-500/0 via-violet-500/50 to-cyan-500/0
                                            opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <input
                              ref={inputRef}
                              autoFocus
                              type="text"
                              value={joinInput}
                              onChange={e => setJoinInput(e.target.value.toUpperCase())}
                              placeholder="e.g.  ABCD-1234"
                              maxLength={9}
                              className="relative w-full px-5 py-4 rounded-2xl text-center
                                         bg-white/[0.04] border border-white/10
                                         text-white placeholder-white/18 font-mono text-lg font-black tracking-[0.25em]
                                         focus:outline-none focus:border-violet-500/50 focus:bg-white/6
                                         transition-all duration-250"
                            />
                          </div>

                          <AnimatePresence>
                            {joinError && (
                              <motion.p
                                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="text-[11px] text-rose-400 flex items-center gap-1.5 font-semibold"
                              >
                                <span className="w-1 h-1 rounded-full bg-rose-400 flex-shrink-0" />
                                {joinError}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <motion.button
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            disabled={isConnecting}
                            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl
                                       font-black text-[13px] text-white
                                       bg-gradient-to-r from-violet-600 to-indigo-600
                                       shadow-[0_6px_30px_rgba(139,92,246,0.35)]
                                       hover:shadow-[0_8px_40px_rgba(139,92,246,0.5)]
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       transition-all duration-250"
                          >
                            {isConnecting
                              ? <><Loader2 size={14} className="animate-spin" /> Joining...</>
                              : <><Link2 size={14} /> Join Session</>}
                          </motion.button>
                        </form>
                      </div>
                    </motion.div>
                  )}

                  {/* ══ IN-ROOM VIEW ══ */}
                  {inRoom && (
                    <motion.div key="room"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.28 }}
                      className="space-y-4"
                    >
                      {/* Room ID card */}
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-3
                                      shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/4 to-cyan-500/2 pointer-events-none" />
                        <div className="relative">
                          <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em] text-center mb-3">
                            Session Room ID
                          </p>
                          <RoomIdDisplay roomId={roomId} />
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-[10px] text-white/25 font-medium">
                              Share with collaborators
                            </p>
                            <CopyBtn text={roomId} />
                          </div>
                        </div>
                      </div>

                      {/* Network pulse */}
                      {connectedUsers.length >= 2 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                        >
                          <NetworkPulse count={connectedUsers.length} />
                        </motion.div>
                      )}

                      {/* Users list */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <Wifi size={10} className="text-emerald-400" />
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                              Connected
                            </span>
                          </div>
                          <motion.span
                            key={connectedUsers.length}
                            initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                            className="text-[10px] font-black text-emerald-400
                                       bg-emerald-500/12 border border-emerald-500/20
                                       px-2.5 py-0.5 rounded-full"
                          >
                            {connectedUsers.length} online
                          </motion.span>
                        </div>

                        <div className="space-y-1.5 max-h-44 overflow-y-auto
                                        [&::-webkit-scrollbar]:w-[3px]
                                        [&::-webkit-scrollbar-track]:bg-transparent
                                        [&::-webkit-scrollbar-thumb]:bg-white/10
                                        [&::-webkit-scrollbar-thumb]:rounded-full">
                          <AnimatePresence>
                            {connectedUsers.map((u, i) => (
                              <UserRow
                                key={u.socketId}
                                user={u}
                                index={i}
                                isYou={u.socketId === mySocketId}
                              />
                            ))}
                          </AnimatePresence>

                          {connectedUsers.length === 0 && (
                            <motion.div
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="flex flex-col items-center gap-2 py-6 text-center"
                            >
                              <WifiOff size={20} className="text-white/15" />
                              <p className="text-[11px] text-white/25 font-semibold">
                                Waiting for others to join...
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Leave button */}
                      <motion.button
                        onClick={handleLeave}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        animate={confirmLeave ? {
                          boxShadow: ['0 0 0px rgba(244,63,94,0)', '0 0 20px rgba(244,63,94,0.3)', '0 0 0px rgba(244,63,94,0)'],
                        } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={`w-full py-3 rounded-2xl border text-[12px] font-black
                                    flex items-center justify-center gap-2
                                    transition-all duration-300
                                    ${confirmLeave
                                      ? 'border-rose-500/50 text-rose-400 bg-rose-500/10'
                                      : 'border-white/8 text-white/35 hover:border-rose-500/30 hover:text-rose-400 hover:bg-rose-500/5'
                                    }`}
                      >
                        {confirmLeave ? (
                          <>
                            <motion.span
                              animate={{ scale: [1, 1.4, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              className="w-1.5 h-1.5 rounded-full bg-rose-400"
                            />
                            Confirm — click again to leave
                          </>
                        ) : (
                          <>
                            <LogOut size={13} />
                            Leave Room
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CollaborateModal;
