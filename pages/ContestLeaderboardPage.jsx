import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../src/utils/axiosClient';
import { Trophy, ArrowLeft, Loader2, Medal, BarChart2, CheckCircle2 } from 'lucide-react';

const ContestLeaderboardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [leaderboard, setLeaderboard] = useState([]);
  const [contestTitle, setContestTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lbRes, ctRes] = await Promise.all([
          axiosClient.get(`/contest/${id}/leaderboard`),
          axiosClient.get(`/contest/${id}`),
        ]);
        setLeaderboard(lbRes.data);
        setContestTitle(ctRes.data.contest?.title || 'Contest');
      } catch (e) {
        setError('Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const rankIcon = (rank) => {
    if (rank === 1) return <span className="text-lg">🥇</span>;
    if (rank === 2) return <span className="text-lg">🥈</span>;
    if (rank === 3) return <span className="text-lg">🥉</span>;
    return <span className="text-zinc-500 font-mono text-sm">#{rank}</span>;
  };

  const rankRowStyle = (rank, isMe) => {
    const base = 'transition-all duration-200 ';
    if (isMe) return base + 'bg-violet-500/10 border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.1)]';
    if (rank === 1) return base + 'bg-yellow-500/5 border-yellow-500/20';
    if (rank === 2) return base + 'bg-zinc-400/5 border-zinc-400/20';
    if (rank === 3) return base + 'bg-amber-600/5 border-amber-600/20';
    return base + 'bg-zinc-900/40 border-white/5 hover:border-white/10';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-400 w-10 h-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400">{error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-violet-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-amber-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Back */}
        <button
          onClick={() => navigate(`/contest/${id}`)}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Contest
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.12)]">
            <Trophy className="text-amber-400 w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{contestTitle}</p>
          </div>
          <Link
            to={`/contest/${id}`}
            className="ml-auto flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 px-4 py-2 border border-violet-500/20 rounded-lg hover:bg-violet-500/10 transition-all"
          >
            <BarChart2 size={13} /> Problems
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/60 text-center">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Participants</p>
            <p className="text-2xl font-bold text-white">{leaderboard.length}</p>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/60 text-center">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Top Score</p>
            <p className="text-2xl font-bold text-amber-400">{leaderboard[0]?.score ?? '—'}</p>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/60 text-center col-span-2 sm:col-span-1">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Your Rank</p>
            <p className="text-2xl font-bold text-violet-400">
              {(() => {
                const idx = leaderboard.findIndex(
                  (p) => p.user?._id?.toString() === user?._id?.toString()
                );
                return idx >= 0 ? `#${idx + 1}` : '—';
              })()}
            </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        {leaderboard.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
            <Medal className="mx-auto mb-4 opacity-20 w-12 h-12" />
            <p>No participants yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header Row */}
            <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem] gap-4 px-5 py-2 text-xs text-zinc-600 uppercase tracking-wider font-medium">
              <span>Rank</span>
              <span>User</span>
              <span className="text-right">Score</span>
              <span className="text-right">Solved</span>
            </div>

            {leaderboard.map((participant, idx) => {
              const rank = idx + 1;
              const isMe = participant.user?._id?.toString() === user?._id?.toString();
              const name = participant.user
                ? `${participant.user.firstName}${participant.user.lastName ? ' ' + participant.user.lastName : ''}`
                : 'Unknown';

              return (
                <div
                  key={participant._id}
                  className={`grid grid-cols-[2.5rem_1fr_5rem_5rem] gap-4 items-center px-5 py-4 rounded-xl border ${rankRowStyle(rank, isMe)}`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-start">
                    {rankIcon(rank)}
                  </div>

                  {/* User */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                      rank === 2 ? 'bg-zinc-400/20 text-zinc-300' :
                      rank === 3 ? 'bg-amber-700/20 text-amber-500' :
                      isMe ? 'bg-violet-500/20 text-violet-300' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className={`font-medium truncate block ${isMe ? 'text-violet-300' : 'text-zinc-100'}`}>
                        {name}
                        {isMe && <span className="ml-2 text-xs text-violet-500 font-normal">(you)</span>}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className={`font-bold font-mono text-base ${
                      rank <= 3 ? 'text-amber-300' : isMe ? 'text-violet-300' : 'text-zinc-200'
                    }`}>
                      {participant.score}
                    </span>
                  </div>

                  {/* Problems Solved */}
                  <div className="text-right flex items-center justify-end gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-500/60" />
                    <span className="text-zinc-300 font-mono font-medium">
                      {participant.problemsSolved?.length ?? 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestLeaderboardPage;
