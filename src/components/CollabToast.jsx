import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserMinus, Users } from 'lucide-react';

/* ─── Avatar colour palette (matches modal) ─── */
const AVATAR_GRADIENTS = [
  'from-violet-500 to-indigo-600',
  'from-cyan-500   to-teal-600',
  'from-pink-500   to-rose-600',
  'from-amber-500  to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-blue-500   to-indigo-600',
];

const hashStr = (s = '') =>
  [...s].reduce((acc, c) => acc + c.charCodeAt(0), 0);

const getInitials = (name = '') =>
  name
    .split(' ')
    .map(w => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??';

/* ─────────────────────────────────────────
   SINGLE TOAST CARD
───────────────────────────────────────── */
const ToastCard = ({ toast }) => {
  const isJoined = toast.type === 'joined';
  const initials  = getInitials(toast.username);
  const gradient  = AVATAR_GRADIENTS[hashStr(toast.username) % AVATAR_GRADIENTS.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 72, scale: 0.82, y: 8 }}
      animate={{ opacity: 1, x: 0,  scale: 1,    y: 0 }}
      exit={{   opacity: 0, x: 72, scale: 0.82, y: 8 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26 }}
      className="relative flex items-center gap-3.5 pr-4 pl-3.5 py-3
                 rounded-2xl overflow-hidden pointer-events-auto
                 min-w-[220px] max-w-[290px]"
      style={{
        background: isJoined
          ? 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(6,182,212,0.04))'
          : 'linear-gradient(135deg, rgba(244,63,94,0.06),  rgba(239,68,68,0.04))',
        border: `1px solid ${isJoined ? 'rgba(16,185,129,0.22)' : 'rgba(244,63,94,0.22)'}`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: isJoined
          ? '0 8px 32px rgba(16,185,129,0.12), 0 2px 8px rgba(0,0,0,0.4)'
          : '0 8px 32px rgba(244,63,94,0.12),  0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${
          isJoined ? 'bg-emerald-400' : 'bg-rose-400'
        }`}
      />

      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          background: `linear-gradient(105deg, transparent 30%,
            ${isJoined ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.07)'} 50%,
            transparent 70%)`,
        }}
      />

      {/* Avatar with pulsing glow ring */}
      <div className="relative flex-shrink-0">
        {/* Glow ring */}
        <motion.div
          className="absolute inset-[-3px] rounded-full"
          animate={{
            opacity: [0.35, 0.75, 0.35],
            scale:   [1,    1.12, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: isJoined
              ? 'radial-gradient(circle, rgba(16,185,129,0.5), transparent 70%)'
              : 'radial-gradient(circle, rgba(244,63,94,0.5),  transparent 70%)',
          }}
        />
        {/* Avatar */}
        <div className={`relative w-9 h-9 rounded-full bg-gradient-to-br ${gradient}
                         flex items-center justify-center text-white text-[11px] font-black
                         shadow-lg z-10`}>
          {initials}
        </div>
        {/* Status dot */}
        <span className={`absolute -bottom-0.5 -right-0.5 flex z-20`}>
          <span className={`absolute inline-flex w-3 h-3 rounded-full animate-ping opacity-60
                            ${isJoined ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          <span className={`relative inline-flex w-3 h-3 rounded-full border-2 border-[#0a0d1a]
                            ${isJoined ? 'bg-emerald-400' : 'bg-rose-400'}`} />
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-black truncate leading-none mb-0.5
                       ${isJoined ? 'text-emerald-300' : 'text-rose-300'}`}>
          {toast.username}
        </p>
        <p className="text-[10px] text-white/35 font-medium">
          {isJoined ? '✦ joined the session' : '✦ left the session'}
        </p>
      </div>

      {/* Icon badge */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
        className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center
                    ${isJoined
                      ? 'bg-emerald-500/15 border border-emerald-500/25'
                      : 'bg-rose-500/15    border border-rose-500/25'
                    }`}
      >
        {isJoined
          ? <UserPlus  size={12} className="text-emerald-400" />
          : <UserMinus size={12} className="text-rose-400"    />
        }
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   CONTAINER  (bottom-right stack)
───────────────────────────────────────── */
const CollabToast = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-[200]
                  flex flex-col items-end gap-2.5 pointer-events-none">
    <AnimatePresence mode="popLayout">
      {toasts.map(toast => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </AnimatePresence>
  </div>
);

export default CollabToast;
