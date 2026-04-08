import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { fetchUserProfile } from '../src/profileSlice';

// Components
import ProfileHeader from '../src/components/profile/ProfileHeader';
import StatsCards from '../src/components/profile/StatsCards';
import ActivityHeatmap from '../src/components/profile/ActivityHeatmap';
import ProfileCharts from '../src/components/profile/ProfileCharts';
import SubmissionTable from '../src/components/profile/SubmissionTable';
import EditProfileModal from '../src/components/profile/EditProfileModal';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.profile);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  /* ── Loading State ── */
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
          <p className="text-white/40 font-mono text-sm uppercase tracking-widest animate-pulse">Loading Profile</p>
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-rose-400 font-bold text-lg">Oops! Something went wrong.</p>
          <p className="text-white/40 text-sm">{error}</p>
          <button 
            onClick={() => dispatch(fetchUserProfile())}
            className="px-4 py-2 mt-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#0d1117] relative overflow-x-hidden selection:bg-violet-500/30 pb-20">
      {/* ── Ambient Backgrounds ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-violet-600/10 to-transparent rounded-full blur-[130px] opacity-70 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/10 to-transparent rounded-full blur-[130px] opacity-60 mix-blend-screen" />
        {/* subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 relative z-10 flex flex-col gap-6">
        
        {/* 1. Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <ProfileHeader user={data.user} onEditClick={() => setEditModalOpen(true)} />
        </motion.div>

        {/* 2. Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          <StatsCards stats={data.stats} />
        </motion.div>

        {/* 3. Middle Tier: Heatmap & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
             <ActivityHeatmap heatmapData={data.heatmapData} />
          </motion.div>

          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
             <ProfileCharts difficulty={data.stats.difficulty} />
          </motion.div>
        </div>

        {/* 4. Bottom Tier: Recent Submissions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
           <SubmissionTable submissions={data.recentSubmissions} />
        </motion.div>
      </div>

      {/* Edit Modal Overlay */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditProfileModal 
            user={data.user} 
            onClose={() => setEditModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
