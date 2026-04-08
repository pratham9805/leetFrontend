import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Link as LinkIcon, Calendar, Edit3, Flame, Trophy } from 'lucide-react';

const ProfileHeader = ({ user, onEditClick }) => {
  // Safe fallbacks
  const avatar = user?.profilePic || null;
  const username = user?.username || user?.firstName || 'Coder';
  const bio = user?.bio || 'Building logic one line at a time.';
  const streak = user?.streakCount || 0;
  const joinedDate = new Date(user?.createdAt).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric'
  });

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#121826]/60 backdrop-blur-xl p-6 md:p-8">
      {/* Glow effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        
        {/* Avatar Section */}
        <div className="relative group flex-shrink-0">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 opacity-30 group-hover:opacity-60 blur-md transition-opacity duration-500" />
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-white/10 bg-[#0d1117] overflow-hidden flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-white/50">{username[0]?.toUpperCase()}</span>
            )}
          </div>
          {/* Edit Badge overlay (optional quick edit icon here) */}
        </div>

        {/* Info Section */}
        <div className="flex-1 text-center md:text-left space-y-4 w-full">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
                {username}
                {user?.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Admin
                  </span>
                )}
              </h1>
              <p className="text-white/40 text-sm mt-1">{user?.emailId}</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEditClick}
              className="px-4 py-2 rounded-xl flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm font-semibold transition-all"
            >
              <Edit3 size={16} /> Edit Profile
            </motion.button>
          </div>

          <p className="text-white/70 max-w-2xl leading-relaxed text-sm md:text-base">
            {bio}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            
            {/* Badges */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Flame size={15} />
              <span className="text-xs font-bold">{streak} Day Streak</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Calendar size={15} />
              <span className="text-xs font-bold">Joined {joinedDate}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
