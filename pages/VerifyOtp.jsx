import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyOtp, resendOtp, clearOtpError, clearPendingEmail } from '../src/authSlice';
import { Mail, RefreshCw, ArrowLeft, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

// ── Error code → human message ─────────────────────────────────────────────
const ERROR_MESSAGES = {
  INVALID_OTP: 'Incorrect code. Please check and try again.',
  OTP_EXPIRED: 'This code has expired. Please request a new one.',
  TOO_MANY_ATTEMPTS: 'Too many failed attempts. Please wait 10 minutes.',
  USER_NOT_FOUND: 'Account not found. Please sign up again.',
  RESEND_COOLDOWN: 'Please wait before requesting a new code.',
};

function getErrorMessage(otpError) {
  if (!otpError) return null;
  if (typeof otpError === 'string') return otpError;
  return ERROR_MESSAGES[otpError.code] || otpError.message || 'Something went wrong.';
}

// ── Shake animation for error ─────────────────────────────────────────────
const shakeVariants = {
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
  idle: { x: 0 },
};

// ── Success checkmark ──────────────────────────────────────────────────────
function SuccessAnimation() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="flex flex-col items-center gap-4 py-8"
    >
      {/* Glowing circle */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-xl opacity-60"
          style={{ background: 'radial-gradient(circle, #34d399, #22d3ee)' }} />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 18 }}
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #34d399, #22d3ee)', boxShadow: '0 0 40px rgba(52,211,153,0.4)' }}
        >
          <CheckCircle2 size={40} className="text-white" strokeWidth={2.5} />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-1">Verified! 🎉</h2>
        <p className="text-slate-400 text-sm">Redirecting you to CodeShastra...</p>
      </motion.div>
    </motion.div>
  );
}

// ── Single OTP box ────────────────────────────────────────────────────────
function OtpBox({ value, focused, hasError }) {
  return (
    <motion.div
      animate={hasError ? 'shake' : 'idle'}
      variants={shakeVariants}
      className={`w-11 h-14 sm:w-13 sm:h-16 rounded-xl border-2 flex items-center justify-center
        text-xl sm:text-2xl font-bold transition-all duration-200
        ${focused
          ? 'border-violet-500 shadow-[0_0_0_3px_rgba(139,92,246,0.25)] bg-slate-800/90'
          : value
            ? 'border-violet-500/50 bg-slate-800/70'
            : hasError
              ? 'border-red-500/70 bg-slate-800/60'
              : 'border-slate-700/60 bg-slate-800/40'
        }`}
      style={focused ? { boxShadow: '0 0 0 3px rgba(139,92,246,0.25), 0 0 20px rgba(139,92,246,0.15)' } : {}}
    >
      <span className={value ? 'text-white' : 'text-slate-700'}>
        {value || '·'}
      </span>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function VerifyOtp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pendingEmail, otpLoading, otpError, isAuthenticated } = useSelector((s) => s.auth);

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [showError, setShowError] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef([]);

  // ── Guard: must have pendingEmail ──────────────────────────────────────
  useEffect(() => {
    if (!pendingEmail) navigate('/signup');
  }, [pendingEmail, navigate]);

  // ── After verify success, redirect ────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && verified) {
      const timer = setTimeout(() => navigate('/'), 1800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, verified, navigate]);

  // ── OTP Error shake trigger ───────────────────────────────────────────
  useEffect(() => {
    if (otpError) {
      setShowError(true);
      const t = setTimeout(() => setShowError(false), 600);
      return () => clearTimeout(t);
    }
  }, [otpError]);

  // ── Resend cooldown timer ─────────────────────────────────────────────
  useEffect(() => {
    if (canResend) return;
    if (cooldown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown, canResend]);

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  // ── Verify handler ────────────────────────────────────────────────────
  const handleVerify = useCallback(async (otp) => {
    if (!pendingEmail) return;
    dispatch(clearOtpError());
    const result = await dispatch(verifyOtp({ emailId: pendingEmail, otp }));
    if (verifyOtp.fulfilled.match(result)) {
      setVerified(true);
    }
  }, [dispatch, pendingEmail]);

  // Auto-submit when all digits filled
  useEffect(() => {
    const otp = digits.join('');
    if (otp.length === OTP_LENGTH && otp.match(/^\d{6}$/)) {
      handleVerify(otp);
    }
  }, [digits, handleVerify]);

  // ── Input change ──────────────────────────────────────────────────────
  const handleChange = (index, value) => {
    // Allow only digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  // ── Backspace ─────────────────────────────────────────────────────────
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  // ── Paste OTP ─────────────────────────────────────────────────────────
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newDigits = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((d, i) => { newDigits[i] = d; });
    setDigits(newDigits);
    const nextEmpty = pasted.length < OTP_LENGTH ? pasted.length : OTP_LENGTH - 1;
    inputRefs.current[nextEmpty]?.focus();
    setFocusedIndex(nextEmpty);
  };

  // ── Resend OTP ────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend || !pendingEmail) return;
    dispatch(clearOtpError());
    setResendSuccess(false);
    const result = await dispatch(resendOtp(pendingEmail));
    if (resendOtp.fulfilled.match(result)) {
      setDigits(Array(OTP_LENGTH).fill(''));
      setCooldown(RESEND_COOLDOWN);
      setCanResend(false);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 4000);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  };

  // ── Change email ──────────────────────────────────────────────────────
  const handleChangeEmail = () => {
    dispatch(clearPendingEmail());
    navigate('/signup');
  };

  const errorMessage = getErrorMessage(otpError);
  const otp = digits.join('');

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #080b14 0%, #0d0b1f 50%, #080b14 100%)' }}
    >
      {/* ── Animated orbs ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #8b5cf6, #06b6d4)', animationDuration: '4s' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #ec4899, #6366f1)', animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
      </div>

      {/* ── Card ──────────────────────────────────────────────────────── */}
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
          {/* Glow top edge */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.7), rgba(6,182,212,0.5), transparent)' }} />

          <AnimatePresence mode="wait">
            {verified ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <SuccessAnimation />
              </motion.div>
            ) : (
              <motion.div key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* ── Header ──────────────────────────────────────────── */}
                <div className="text-center mb-8">
                  {/* Icon badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))',
                      border: '1px solid rgba(139,92,246,0.3)',
                      boxShadow: '0 0 30px rgba(139,92,246,0.15)',
                    }}
                  >
                    <Mail size={28} className="text-violet-400" />
                  </motion.div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                    Check your inbox
                  </h1>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    We sent a 6-digit code to
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-violet-300">{pendingEmail}</span>
                    <button
                      onClick={handleChangeEmail}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
                    >
                      change
                    </button>
                  </div>
                </div>

                {/* ── OTP Inputs ──────────────────────────────────────── */}
                <motion.div
                  animate={showError ? 'shake' : 'idle'}
                  variants={shakeVariants}
                  className="flex justify-center gap-2 sm:gap-3 mb-6"
                  onPaste={handlePaste}
                >
                  {digits.map((digit, i) => (
                    <div key={i} className="relative">
                      <OtpBox
                        value={digit}
                        focused={focusedIndex === i}
                        hasError={showError}
                      />
                      <input
                        ref={(el) => (inputRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onFocus={() => setFocusedIndex(i)}
                        onPaste={handlePaste}
                        className="absolute inset-0 opacity-0 cursor-text"
                        aria-label={`OTP digit ${i + 1}`}
                      />
                    </div>
                  ))}
                </motion.div>

                {/* ── Error message ────────────────────────────────────── */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      <ShieldAlert size={15} className="text-red-400 shrink-0" />
                      <span className="text-red-300">{errorMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Resend success ───────────────────────────────────── */}
                <AnimatePresence>
                  {resendSuccess && (
                    <motion.div
                      key="resent"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm"
                      style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
                    >
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <span className="text-emerald-300">New OTP sent! Check your email.</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Verify button ────────────────────────────────────── */}
                <motion.button
                  onClick={() => handleVerify(otp)}
                  disabled={otpLoading || otp.length !== OTP_LENGTH}
                  whileHover={{ scale: otpLoading || otp.length !== OTP_LENGTH ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 px-5 rounded-xl text-white text-sm font-semibold
                    flex items-center justify-center gap-2 transition-all duration-300
                    disabled:opacity-40 disabled:cursor-not-allowed mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #06b6d4 100%)',
                    boxShadow: otp.length === OTP_LENGTH && !otpLoading
                      ? '0 4px 24px rgba(139,92,246,0.4)'
                      : '0 4px 12px rgba(139,92,246,0.15)',
                  }}
                >
                  {otpLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </motion.button>

                {/* ── Resend ───────────────────────────────────────────── */}
                <div className="text-center">
                  <span className="text-slate-500 text-sm">Didn&apos;t receive it? </span>
                  <button
                    onClick={handleResend}
                    disabled={!canResend || otpLoading}
                    className={`text-sm font-semibold transition-all duration-200 inline-flex items-center gap-1.5
                      ${canResend && !otpLoading
                        ? 'text-violet-400 hover:text-violet-300 cursor-pointer'
                        : 'text-slate-600 cursor-not-allowed'
                      }`}
                  >
                    {otpLoading ? null : canResend ? (
                      <>
                        <RefreshCw size={13} />
                        Resend OTP
                      </>
                    ) : (
                      `Resend in ${cooldown}s`
                    )}
                  </button>
                </div>

                {/* ── Back to signup ───────────────────────────────────── */}
                <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                  <button
                    onClick={handleChangeEmail}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    <ArrowLeft size={12} />
                    Back to Sign Up
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
