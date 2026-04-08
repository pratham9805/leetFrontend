import React from 'react';
import { motion } from 'framer-motion';
import { Clock, LayoutList } from 'lucide-react';
import { NavLink } from 'react-router';

const SubmissionTable = ({ submissions }) => {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-white/10 bg-[#121826]/60 backdrop-blur-md flex flex-col items-center justify-center min-h-[200px]">
        <div className="p-4 rounded-full border border-white/10 bg-white/5 mb-3">
           <LayoutList size={24} className="text-white/30" />
        </div>
        <p className="text-white/40 text-sm font-semibold tracking-wide">No submissions found yet!</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'accepted':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'wrong':
      case 'error':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  };

  const getDiffColor = (diff) => {
    if (!diff) return 'text-white/50';
    switch(diff.toLowerCase()) {
      case 'easy': return 'text-emerald-400';
      case 'medium': return 'text-amber-400';
      case 'hard': return 'text-rose-400';
      default: return 'text-white/50';
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121826]/60 backdrop-blur-md overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-500" />
          Recent Submissions
        </h2>
        <span className="text-[10px] text-white/30 font-bold tracking-widest uppercase">Last {submissions.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40 font-bold">
              <th className="py-4 px-6 font-semibold">Problem</th>
              <th className="py-4 px-6 font-semibold hidden md:table-cell">Difficulty</th>
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 font-semibold hidden sm:table-cell">Language</th>
              <th className="py-4 px-6 font-semibold text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {submissions.map((sub, idx) => (
              <motion.tr 
                key={sub._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="hover:bg-white/5 transition-colors group"
              >
                {/* Problem Name */}
                <td className="py-4 px-6">
                  <NavLink 
                    to={`/problem/${sub.problemId?._id}`} 
                    className="font-medium text-white/80 hover:text-cyan-400 transition-colors line-clamp-1"
                  >
                    {sub.problemId?.title || 'Unknown Problem'}
                  </NavLink>
                </td>

                {/* Difficulty */}
                <td className="py-4 px-6 hidden md:table-cell">
                  <span className={`text-[11px] font-bold tracking-wider ${getDiffColor(sub.problemId?.difficulty)}`}>
                    {sub.problemId?.difficulty || '--'}
                  </span>
                </td>

                {/* Status */}
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(sub.status)}`}>
                    {sub.status}
                  </span>
                </td>

                {/* Language */}
                <td className="py-4 px-6 hidden sm:table-cell font-mono text-[11px] text-white/50 group-hover:text-white/70 transition-colors">
                  {sub.language}
                </td>

                {/* Time */}
                <td className="py-4 px-6 text-right whitespace-nowrap text-white/30 text-xs flex items-center justify-end gap-1.5 hidden sm:flex">
                  <Clock size={12} className="opacity-50" />
                  {new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionTable;
