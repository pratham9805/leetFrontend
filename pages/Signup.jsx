'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { registerUser, googleLoginUser } from "../src/authSlice";
import { Eye, EyeOff, Mail, Lock, User, Zap, Trophy, Users, Code2, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

const signupSchema = z.object({
  firstName: z.string().min(3, 'Name must be at least 3 characters'),
  emailId: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const stats = [
  { icon: Code2, value: "1,000+", label: "Problems", color: "from-blue-400 to-cyan-400" },
  { icon: Users, value: "50K+", label: "Developers", color: "from-purple-400 to-pink-400" },
  { icon: Trophy, value: "Live", label: "Contests", color: "from-amber-400 to-orange-400" },
  { icon: Zap, value: "Real-time", label: "Leaderboard", color: "from-green-400 to-emerald-400" },
];

// Password strength calculator
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair', color: '#f59e0b' };
  if (score <= 3) return { score, label: 'Good', color: '#3b82f6' };
  return { score, label: 'Strong', color: '#22c55e' };
}

function FloatingInput({ id, fieldName, type, placeholder, icon: Icon, register, error, rightElement, onChange }) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef(null);

  return (
    <div className="relative group">
      <div
        className={`relative flex items-center rounded-xl border transition-all duration-300 overflow-hidden
          ${focused
            ? 'border-violet-500/70 shadow-[0_0_0_3px_rgba(139,92,246,0.15)] bg-slate-800/80'
            : error
              ? 'border-red-500/50 bg-slate-800/50'
              : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600/80 hover:bg-slate-800/60'
          }`}
      >
        {/* Left icon */}
        <div className={`pl-4 pr-2 transition-colors duration-300 ${focused ? 'text-violet-400' : 'text-slate-500'}`}>
          <Icon size={17} />
        </div>

        {/* Input + floating label */}
        <div className="relative flex-1 py-[14px] pr-2">
          <label
            htmlFor={id}
            onClick={() => inputRef.current?.focus()}
            className={`absolute left-0 pointer-events-none transition-all duration-200 font-medium
              ${focused || hasValue
                ? 'top-[2px] text-[10px] text-violet-400'
                : 'top-1/2 -translate-y-1/2 text-[14px] text-slate-500'
              }`}
          >
            {placeholder}
          </label>
          <input
            id={id}
            ref={inputRef}
            type={type}
            {...register(fieldName, {
              onChange: (e) => {
                setHasValue(e.target.value.length > 0);
                onChange?.(e.target.value);
              },
            })}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); setHasValue(inputRef.current?.value.length > 0); }}
            className="w-full bg-transparent text-white text-sm pt-3 focus:outline-none"
            autoComplete={type === 'password' ? 'new-password' : type === 'email' ? 'email' : 'name'}
          />
        </div>

        {/* Right element */}
        {rightElement && (
          <div className="pr-3">{rightElement}</div>
        )}

        {/* Focus shimmer line */}
        <div className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-300 ${focused ? 'w-full' : 'w-0'}`} />
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5 pl-1 animate-[fadeSlideIn_0.2s_ease]">
          <span className="w-1 h-1 rounded-full bg-red-400 shrink-0 inline-block" />
          {error.message}
        </p>
      )}
    </div>
  );
}

function PasswordStrengthBar({ password }) {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2 px-1">
      <div className="flex gap-1.5 mb-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-400"
            style={{
              background: score >= i ? color : 'rgba(100,116,139,0.3)',
              boxShadow: score >= i ? `0 0 6px ${color}80` : 'none',
            }}
          />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color }}>{label} password</p>
    </div>
  );
}

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, pendingEmail } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  const [passwordValue, setPasswordValue] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  // Redirect already-authenticated users to home
  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  // After register dispatch sets pendingEmail → go to OTP page
  useEffect(() => {
    if (pendingEmail) navigate('/verify-otp');
  }, [pendingEmail, navigate]);

  const onSubmit = (data) => dispatch(registerUser(data));

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        setGoogleError(null);
        const result = await dispatch(googleLoginUser(tokenResponse.access_token));
        if (googleLoginUser.rejected.match(result)) {
          setGoogleError(result.payload || 'Google sign-up failed');
        }
      } catch {
        setGoogleError('Google sign-up failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setGoogleError('Google sign-in was cancelled or failed.'),
    flow: 'implicit',
  });

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #020817 0%, #0a0f1e 40%, #130b1f 70%, #020817 100%)' }}
    >
      {/* === Animated background === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #8b5cf6, #ec4899)' }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ animationDelay: '1.5s', background: 'radial-gradient(circle, #06b6d4, #6366f1)' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #3b82f6, #8b5cf6)' }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        {/* Diagonal lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diag2" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="60" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag2)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-12">

        {/* ===== LEFT: Branding ===== */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">

          {/* Logo badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-violet-500/30"
            style={{ background: 'rgba(139,92,246,0.08)', backdropFilter: 'blur(8px)' }}>
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Join CodeShastra Today
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 leading-[1.1] tracking-tight">
            Start Your<br />
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Coding Journey
            </span>
            <br />Right Now
          </h2>

          <p className="text-slate-400 text-sm sm:text-base mb-10 leading-relaxed max-w-sm">
            Create your free account and get instant access to 1,000+ problems, live contests, and an expert community.
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {stats.map(({ icon: Icon, value, label, color }) => (
              <div key={label}
                className="group flex items-center gap-3 p-4 rounded-2xl border border-white/5 cursor-default
                  hover:border-white/10 transition-all duration-300 hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(8px)' }}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} bg-opacity-10 shrink-0`}
                  style={{ boxShadow: '0 0 16px rgba(139,92,246,0.2)' }}>
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  <p className={`text-sm font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badge */}
          <div className="mt-8 flex items-center gap-2 text-slate-500 text-xs">
            <ShieldCheck size={14} className="text-green-500" />
            Free forever · No credit card required · Cancel anytime
          </div>
        </div>

        {/* ===== RIGHT: Form card ===== */}
        <div className="w-full lg:w-1/2 max-w-md mx-auto">
          <div
            className="relative rounded-3xl p-8 sm:p-10"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.7) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(139,92,246,0.15)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 64px rgba(0,0,0,0.4), 0 0 80px rgba(139,92,246,0.06)',
            }}
          >
            {/* Glow top edge */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)' }} />

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">Create Account ✨</h1>
              <p className="text-slate-400 text-sm">It&apos;s free — join in seconds</p>
            </div>

            {/* Google button — FIRST for best UX */}
            <button
              type="button"
              id="google-signup-btn"
              onClick={() => handleGoogleSignup()}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold
                bg-white text-slate-800 border border-slate-200
                hover:bg-slate-50 hover:shadow-lg hover:shadow-white/10
                active:scale-[0.98] transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {googleLoading ? (
                <svg className="w-5 h-5 animate-spin text-slate-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>{googleLoading ? 'Signing up with Google...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-xs text-slate-500 font-medium"
                  style={{ background: 'linear-gradient(135deg, #0f172a, #130b1f)' }}>
                  or sign up with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

              {/* Full Name */}
              <FloatingInput
                id="name"
                fieldName="firstName"
                type="text"
                placeholder="Full Name"
                icon={User}
                register={register}
                error={errors.firstName}
              />

              {/* Email */}
              <FloatingInput
                id="emailSignup"
                fieldName="emailId"
                type="email"
                placeholder="Email Address"
                icon={Mail}
                register={register}
                error={errors.emailId}
              />

              {/* Password */}
              <div>
                <FloatingInput
                  id="passwordSignup"
                  fieldName="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  icon={Lock}
                  register={register}
                  error={errors.password}
                  onChange={(val) => setPasswordValue(val)}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <PasswordStrengthBar password={passwordValue} />
              </div>

              {/* Errors */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-300 border border-red-500/20"
                  style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {error}
                </div>
              )}
              {googleError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-300 border border-red-500/20"
                  style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {googleError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-3.5 px-5 mt-2 rounded-xl text-white text-sm font-semibold
                  flex items-center justify-center gap-2
                  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  hover:shadow-xl hover:shadow-violet-500/25 hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #ec4899 100%)',
                  boxShadow: '0 4px 24px rgba(139,92,246,0.3)',
                }}
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <ArrowRight size={16} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                )}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-slate-500 text-xs sm:text-sm mt-6">
              Already have an account?{' '}
              <NavLink to="/login"
                className="text-violet-400 hover:text-violet-300 font-semibold transition-colors duration-200 hover:underline underline-offset-2">
                Sign in instead →
              </NavLink>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Signup;
