import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../src/utils/axiosClient';
import {
  Trophy, Clock, Users, CheckCircle2, Lock, Loader2,
  BarChart2, ArrowLeft, Zap
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getStatus = (startTime, endTime) => {
  const now = new Date();
  if (now < new Date(startTime)) return 'upcoming';
  if (now <= new Date(endTime)) return 'live';
  return 'ended';
};

const difficultyStyle = {
  easy: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border border-amber-500/20',
  hard: 'text-rose-400 bg-rose-500/10 border border-rose-500/20',
};

// ── Countdown Timer ───────────────────────────────────────────────────────────

const Countdown = ({ targetTime, label }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetTime) - new Date();
      if (diff <= 0) { setTimeLeft('00:00:00'); return; }
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-zinc-900/80 border border-white/5 w-fit">
      <span className="text-xs text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1">
        <Clock size={11} /> {label}
      </span>
      <span className="font-mono text-2xl font-bold text-white tracking-wider">{timeLeft}</span>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const ContestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [contest, setContest] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [participantData, setParticipantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('problems');

  const fetchContest = useCallback(async () => {
    try {
      const res = await axiosClient.get(`/contest/${id}`);
      setContest(res.data.contest);
      setHasJoined(res.data.hasJoined);
      setParticipantData(res.data.participantData);
    } catch (e) {
      setError('Failed to load contest.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchContest(); }, [fetchContest]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await axiosClient.post(`/contest/${id}/join`);
      setHasJoined(true);
      setParticipantData(res.data.participant);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to join contest.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-400 w-10 h-10" />
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400">
        {error || 'Contest not found.'}
      </div>
    );
  }

  const status = getStatus(contest.startTime, contest.endTime);
  const statusStyle = {
    live: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_14px_rgba(16,185,129,0.2)]',
    upcoming: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    ended: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  };
  const statusLabel = { live: '🔴 Live', upcoming: '⏳ Upcoming', ended: '✓ Ended' };

  // Set of solved problemIds by this user
  const solvedIds = new Set(
    (participantData?.problemsSolved || []).map((p) => p.problemId?.toString())
  );

  const canJoin = !hasJoined && status !== 'ended';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-violet-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-sky-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* Back */}
        <button
          onClick={() => navigate('/contests')}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> All Contests
        </button>

        {/* Contest Header Card */}
        <div className="p-7 rounded-2xl border border-white/5 bg-zinc-900/70 backdrop-blur-md shadow-2xl mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-5 justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle[status]}`}>
                  {statusLabel[status]}
                </span>
                {status === 'live' && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Zap size={11} className="fill-current" /> Active Now
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{contest.title}</h1>
              {contest.description && (
                <p className="text-zinc-400 mt-2 text-sm leading-relaxed">{contest.description}</p>
              )}

              <div className="flex flex-wrap gap-5 mt-5 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Users size={12} /> {contest.problems?.length} Problems
                </span>
              </div>
            </div>

            {/* Timer + Join */}
            <div className="flex flex-col items-center gap-3">
              {status === 'live' && (
                <Countdown targetTime={contest.endTime} label="Ends In" />
              )}
              {status === 'upcoming' && (
                <Countdown targetTime={contest.startTime} label="Starts In" />
              )}

              {canJoin && (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {joining ? <Loader2 size={16} className="animate-spin" /> : <Trophy size={16} />}
                  {joining ? 'Joining...' : 'Join Contest'}
                </button>
              )}

              {hasJoined && (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 size={15} /> Joined
                </div>
              )}

              {status === 'ended' && !hasJoined && (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800/60 border border-white/5 rounded-xl text-zinc-500 text-sm">
                  <Lock size={14} /> Contest Ended
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900/60 border border-white/5 rounded-xl p-1 w-fit backdrop-blur-sm">
          {['problems', 'leaderboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'leaderboard') navigate(`/contest/${id}/leaderboard`);
                else setActiveTab(tab);
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {tab === 'problems' ? <Users size={14} /> : <BarChart2 size={14} />}
              {tab}
            </button>
          ))}
        </div>

        {/* Problems Tab */}
        {activeTab === 'problems' && (
          <div className="space-y-3">
            {contest.problems?.length === 0 && (
              <div className="text-center py-16 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                No problems added yet.
              </div>
            )}

            {contest.problems?.map((problem, idx) => {
              const solved = solvedIds.has(problem._id?.toString());
              const canAccess = hasJoined && status !== 'upcoming';

              return (
                <div
                  key={problem._id}
                  className="flex items-center gap-4 p-5 rounded-xl border border-white/5 bg-zinc-900/60 backdrop-blur-sm hover:border-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.05)] transition-all duration-300 group"
                >
                  <span className="font-mono text-zinc-600 text-sm w-6 shrink-0">{idx + 1}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-white font-medium group-hover:text-violet-300 transition-colors truncate">
                        {problem.title}
                      </span>
                      {problem.difficulty && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${difficultyStyle[problem.difficulty]}`}>
                          {problem.difficulty}
                        </span>
                      )}
                      {solved && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle2 size={12} /> Solved
                        </span>
                      )}
                    </div>
                    {problem.tags && (
                      <span className="text-xs text-zinc-600 mt-0.5 block">#{problem.tags}</span>
                    )}
                  </div>

                  {canAccess ? (
                    <Link
                      to={`/problem/${problem._id}?contestId=${id}`}
                      className="shrink-0 px-4 py-2 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 text-violet-300 text-xs font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                    >
                      Solve →
                    </Link>
                  ) : (
                    <span className="shrink-0 flex items-center gap-1 text-xs text-zinc-600 border border-zinc-800 px-3 py-2 rounded-lg">
                      <Lock size={11} /> {hasJoined ? 'Not started' : 'Join to access'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestDetailPage;
