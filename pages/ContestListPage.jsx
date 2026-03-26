import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import axiosClient from '../src/utils/axiosClient';
import { Trophy, Clock, Users, Calendar, Zap, ChevronRight, Loader2 } from 'lucide-react';

const getContestStatus = (startTime, endTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'ended';
};

const StatusBadge = ({ status }) => {
  const styles = {
    live: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    upcoming: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    ended: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  };
  const label = { live: '🔴 Live', upcoming: '⏳ Upcoming', ended: '✓ Ended' };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${styles[status]}`}>
      {label[status]}
    </span>
  );
};

const formatDate = (d) =>
  new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

const ContestListPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosClient.get('/contest');
        setContests(res.data);
      } catch (e) {
        setError('Failed to load contests.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = contests.filter((c) => {
    const s = getContestStatus(c.startTime, c.endTime);
    return filter === 'all' || s === filter;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-sky-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <Trophy className="text-violet-400 w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-sky-300 bg-clip-text text-transparent">
              Contests
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">Compete, rank, and prove your skills</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 bg-zinc-900/60 border border-white/5 rounded-xl p-1 w-fit backdrop-blur-sm">
          {['all', 'live', 'upcoming', 'ended'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                filter === f
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-violet-400 w-10 h-10" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
            <Trophy className="mx-auto mb-4 opacity-20 w-12 h-12" />
            <p>No contests found for this filter.</p>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((contest) => {
            const status = getContestStatus(contest.startTime, contest.endTime);
            return (
              <Link
                key={contest._id}
                to={`/contest/${contest._id}`}
                className="group block p-6 rounded-2xl border border-white/5 bg-zinc-900/60 backdrop-blur-sm hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <StatusBadge status={status} />
                      {status === 'live' && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <Zap size={12} className="fill-current" /> In Progress
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                      {contest.title}
                    </h2>
                    {contest.description && (
                      <p className="text-zinc-500 text-sm mt-1 line-clamp-1">{contest.description}</p>
                    )}
                  </div>
                  <ChevronRight className="text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0 mt-1" />
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    Starts: {formatDate(contest.startTime)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} />
                    Ends: {formatDate(contest.endTime)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={12} />
                    {contest.problems?.length || 0} Problems
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContestListPage;
