import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { forgotPassword, clearResetError } from '../src/authSlice';
import { Mail, ArrowLeft, Loader2, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { resetLoading, resetError, resetEmail, isAuthenticated } = useSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Already logged in → go home
  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  // Navigate to OTP page once resetEmail is set in Redux
  useEffect(() => {
    if (resetEmail) navigate('/verify-reset-otp');
  }, [resetEmail, navigate]);

  const validate = () => {
    if (!email.trim()) { setEmailError('Email is required.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email address.'); return false; }
    setEmailError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(clearResetError());
    dispatch(forgotPassword(email.trim().toLowerCase()));
  };

  const errorMsg = resetError
    ? (typeof resetError === 'string' ? resetError : resetError.message)
    : null;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #080b14 0%, #0d0b1f 50%, #080b14 100%)' }}
    >
      {/* ── Orbs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #8b5cf6, #06b6d4)', animationDuration: '4s' }} />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #ec4899, #6366f1)', animationDuration: '6s', animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-auto px-4"
      >
        <div
          className="relative rounded-3xl p-8 sm:p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(13,11,31,0.92) 100%)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(139,92,246,0.2)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 64px rgba(0,0,0,0.5), 0 0 80px rgba(139,92,246,0.08)',
          }}
        >
          {/* Top glow edge */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.7), rgba(6,182,212,0.5), transparent)' }} />

          {/* ── Header ── */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.12, type: 'spring', stiffness: 300, damping: 20 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))',
                border: '1px solid rgba(139,92,246,0.3)',
                boxShadow: '0 0 30px rgba(139,92,246,0.15)',
              }}
            >
              <Mail size={28} className="text-violet-400" />
            </motion.div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Enter your email and we&apos;ll send a reset code.
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div
                className={`relative flex items-center rounded-xl border transition-all duration-300
                  ${emailError ? 'border-red-500/50 bg-slate-800/60' : 'border-slate-700/60 bg-slate-800/40 focus-within:border-violet-500/70 focus-within:bg-slate-800/70'}`}
                style={emailError ? {} : { boxShadow: 'none' }}
              >
                <Mail size={17} className="ml-4 shrink-0 text-slate-500" />
                <input
                  type="email"
                  id="forgot-email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); dispatch(clearResetError()); }}
                  placeholder="you@example.com"
                  autoFocus
                  className="flex-1 bg-transparent py-3.5 px-3 text-sm text-white placeholder-slate-600 outline-none"
                />
              </div>
              {emailError && (
                <p className="mt-1.5 text-xs text-red-400 pl-1 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                  {emailError}
                </p>
              )}
            </div>

            {/* ── API error ── */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <ShieldAlert size={15} className="text-red-400 shrink-0" />
                  <span className="text-red-300">{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={resetLoading}
              whileHover={{ scale: resetLoading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 px-5 rounded-xl text-white text-sm font-semibold
                flex items-center justify-center gap-2 transition-all duration-300
                disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #06b6d4 100%)',
                boxShadow: '0 4px 24px rgba(139,92,246,0.35)',
              }}
            >
              {resetLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Sending OTP...</>
              ) : (
                <><Send size={15} /> Send Reset Code</>
              )}
            </motion.button>
          </form>

          {/* ── Back to login ── */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <NavLink
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft size={12} />
              Back to Sign In
            </NavLink>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
