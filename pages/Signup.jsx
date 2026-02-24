'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate,NavLink } from "react-router";
import { useEffect } from "react";
import { registerUser } from "../src/authSlice";
import { Eye, EyeOff } from "lucide-react";

const signupSchema = z.object({
  firstName: z.string('name should be string').min(3, 'Name Should Contain Atleast 3 char'),
  emailId: z.string().email("Enter Valid Email"),
  password: z.string().min(8, "password should contain atleast 8 char")
});

function Signup() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {isAuthenticated,loading ,error} =useSelector((state)=>state.auth)

  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema)
  });

  useEffect(()=>{
    if(isAuthenticated){
      navigate('/');
    }
  },[isAuthenticated,navigate])

  const onSubmit = (data) => {
      dispatch(registerUser(data))
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-linear-to-br from-blue-500 to-purple-600 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-72 h-72 sm:w-96 sm:h-96 bg-linear-to-tr from-cyan-500 to-blue-500 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-linear-to-br from-purple-500 to-pink-500 rounded-full opacity-5 blur-3xl"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 to-transparent pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(100, 200, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      {/* Left Section - Branding (Visible on all screens, displayed on top on mobile) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start px-4 sm:px-6 lg:px-12 py-8 lg:py-0 relative z-10">
        <div className="max-w-md w-full text-center lg:text-left">
          <div className="mb-8">
            <div className="inline-block px-4 py-2 rounded-full bg-linear-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 backdrop-blur-sm">
              <span className="text-xs sm:text-sm font-medium bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Welcome to LeetCode</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">Master Coding<br />One Problem<br /><span className="bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">at a Time</span></h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 mb-8 leading-relaxed">Join thousands of developers improving their problem-solving skills. Start your coding journey with us.</p>
          
          <div className="space-y-4 flex flex-col items-center lg:items-start">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-linear-to-r from-blue-400 to-purple-400 shrink-0"></div>
              <span className="text-xs sm:text-sm lg:text-base text-slate-300">1000+ Problems to Solve</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-linear-to-r from-blue-400 to-purple-400 shrink-0"></div>
              <span className="text-xs sm:text-sm lg:text-base text-slate-300">Real-time Leaderboard</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-linear-to-r from-blue-400 to-purple-400 shrink-0"></div>
              <span className="text-xs sm:text-sm lg:text-base text-slate-300">Expert Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 max-w-sm sm:max-w-md lg:max-w-lg px-4 sm:px-6 lg:px-12 py-8 lg:py-0 flex items-center justify-center relative z-10">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center lg:text-left">Create Account</h1>
            <p className="text-sm sm:text-base text-slate-400 text-center lg:text-left">Join our community of developers</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Input */}
            <div className="relative">
              <input
                {...register('firstName')}
                type="text"
                placeholder="Full Name"
                className="w-full px-4 sm:px-5 py-2 sm:py-3 text-sm sm:text-base rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-200 hover:border-slate-600/50"
              />
              {errors.firstName && (
                <p className="mt-2 text-xs sm:text-sm text-red-400 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-400 shrink-0"></span>
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className="relative">
              <input
                {...register('emailId')}
                type="email"
                placeholder="Email Address"
                className="w-full px-4 sm:px-5 py-2 sm:py-3 text-sm sm:text-base rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-200 hover:border-slate-600/50"
              />
              {errors.emailId && (
                <p className="mt-2 text-xs sm:text-sm text-red-400 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-400 shrink-0"></span>
                  {errors.emailId.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                {...register('password')}
                 type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 sm:px-5 py-2 sm:py-3 text-sm sm:text-base rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-200 hover:border-slate-600/50"
              />

               {/* Eye Icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                
              </button>

              {errors.password && (
                <p className="mt-2 text-xs sm:text-sm text-red-400 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-400 shrink-0"></span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 sm:py-3 px-4 sm:px-5 mt-6 sm:mt-8 rounded-lg bg-linear-to-r from-blue-500 to-purple-600 text-white text-sm sm:text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-slate-400 text-xs sm:text-sm">
              Already have an account?{' '}
              
                <NavLink to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Login
              </NavLink>
              
            </p>
          </form>

          {/* Divider */}
          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-3 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button type="button" className="flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600/50 transition-all duration-200 font-medium hover:bg-slate-700/50">
              Google
            </button>
            <button type="button" className="flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600/50 transition-all duration-200 font-medium hover:bg-slate-700/50">
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
