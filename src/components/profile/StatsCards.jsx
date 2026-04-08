import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Zap } from 'lucide-react';

const StatBox = ({ title, value, icon: Icon, colorClass, gradient, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className={`relative p-5 rounded-2xl border ${colorClass.border} bg-[#121826]/50 backdrop-blur-md overflow-hidden group`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white/50">
            <Icon size={16} className={colorClass.icon} />
            {title}
          </div>
          <p className="text-3xl font-black text-white tabular-nums tracking-tight">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10 backdrop-blur-sm border ${colorClass.border} shadow-lg shadow-black/20`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
};

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <StatBox 
        title="Total Solved" 
        value={stats.totalSolved} 
        icon={Target}
        colorClass={{ border: 'border-violet-500/20', icon: 'text-violet-400' }}
        gradient="from-violet-500 to-fuchsia-500"
        delay={0}
      />
      <StatBox 
        title="Acceptance Rate" 
        value={`${stats.acceptanceRate}%`} 
        icon={CheckCircle2}
        colorClass={{ border: 'border-emerald-500/20', icon: 'text-emerald-400' }}
        gradient="from-emerald-400 to-teal-500"
        delay={0.1}
      />
      <StatBox 
        title="Total Submissions" 
        value={stats.totalSubmissions} 
        icon={Zap}
        colorClass={{ border: 'border-cyan-500/20', icon: 'text-cyan-400' }}
        gradient="from-cyan-400 to-blue-500"
        delay={0.2}
      />
    </div>
  );
};

export default StatsCards;
