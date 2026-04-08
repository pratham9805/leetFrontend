import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { resetPassword, clearResetError, clearResetEmail } from '../src/authSlice';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair', color: '#f59e0b' };
  if (score <= 3) return { score, label: 'Good', color: '#3b82f6' };
  return { score, label: 'Strong', color: '#22c55e' };
}

export default function ResetPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { resetEmail, resetVerified, resetLoading, resetError, isAuthenticated } = useSelector((s) => s.auth);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Guards
  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated, navigate]);
  useEffect(() => {
    if (!resetEmail || !resetVerified) navigate('/forgot-password');
  }, [resetEmail, resetVerified, navigate]);

  // After success → redirect to login after 2s
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => {
        dispatch(clearResetEmail());
        navigate('/login');
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [success, navigate, dispatch]);

  const validate = () => {
    const errors = {};
    if (!newPassword) errors.newPassword = 'Password is required.';
    else if (newPassword.length < 8) errors.newPassword = 'Must be at least 8 characters.';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.';
    else if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(clearResetError());
    const result = await dispatch(resetPassword({ emailId: resetEmail, newPassword, confirmPassword }));
    if (resetPassword.fulfilled.match(result)) setSuccess(true);
  };

  const strength = getPasswordStrength(newPassword);
  const errorMsg = resetError
    ? (typeof resetError === 'string' ? resetError : resetError.message)
    : null;

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #080b14 0%, #0d0b1f 50%, #080b14 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5 text-center px-6"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-60"
              style={{ background: 'radial-gradient(circle, #34d399, #22d3ee)' }} />
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
              className="relative w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #34d399, #22d3ee)', boxShadow: '0 0 50px rgba(52,211,153,0.5)' }}
            >
              <CheckCircle2 size={46} className="text-white" strokeWidth={2.5} />
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h2 className="text-3xl font-bold text-white mb-2">Password Updated! 🎉</h2>
            <p className="text-slate-400">Redirecting you to login...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.7), rgba(6,182,212,0.5), transparent)' }} />

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.12, type: 'spring', stiffness: 300, damping: 20 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))',
                border: '1px solid rgba(139,92,246,0.3)',
                boxShadow: '0 0 30px rgba(139,92,246,0.15)',
              }}
            >
              <Lock size={28} className="text-violet-400" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
              Set New Password
            </h1>
            <p className="text-slate-400 text-sm">
              For <span className="text-violet-300 font-semibold">{resetEmail}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <div
                className={`relative flex items-center rounded-xl border transition-all duration-300
                  ${fieldErrors.newPassword ? 'border-red-500/50' : 'border-slate-700/60 focus-within:border-violet-500/70'}
                  bg-slate-800/40 focus-within:bg-slate-800/70`}
              >
                <Lock size={17} className="ml-4 shrink-0 text-slate-500" />
                <input
                  type={showNew ? 'text' : 'password'}
                  id="new-password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setFieldErrors((p) => ({ ...p, newPassword: '' })); }}
                  className="flex-1 bg-transparent py-3.5 px-3 text-sm text-white placeholder-slate-600 outline-none"
                />
                <button type="button" onClick={() => setShowNew((v) => !v)} className="pr-4 text-slate-500 hover:text-slate-300 transition-colors">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {newPassword && (
                <div className="mt-2 px-1">
                  <div className="flex gap-1.5 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{
                          background: strength.score >= i ? strength.color : 'rgba(100,116,139,0.3)',
                          boxShadow: strength.score >= i ? `0 0 6px ${strength.color}70` : 'none',
                        }} />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strength.color }}>{strength.label} password</p>
                </div>
              )}
              {fieldErrors.newPassword && (
                <p className="mt-1.5 text-xs text-red-400 pl-1 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />{fieldErrors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div
                className={`relative flex items-center rounded-xl border transition-all duration-300
                  ${fieldErrors.confirmPassword ? 'border-red-500/50' : 'border-slate-700/60 focus-within:border-violet-500/70'}
                  bg-slate-800/40 focus-within:bg-slate-800/70`}
              >
                <Lock size={17} className="ml-4 shrink-0 text-slate-500" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="confirm-password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: '' })); }}
                  className="flex-1 bg-transparent py-3.5 px-3 text-sm text-white placeholder-slate-600 outline-none"
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="pr-4 text-slate-500 hover:text-slate-300 transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Match tick */}
              {confirmPassword && newPassword === confirmPassword && (
                <p className="mt-1.5 text-xs text-emerald-400 pl-1 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Passwords match
                </p>
              )}
              {fieldErrors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-400 pl-1 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />{fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* API Error */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
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
              {resetLoading ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Reset Password'}
            </motion.button>
          </form>

          {/* Back */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <button
              onClick={() => { dispatch(clearResetEmail()); navigate('/forgot-password'); }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              <ArrowLeft size={12} /> Start over
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
