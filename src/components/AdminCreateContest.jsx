import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { Trophy, Plus, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

const AdminCreateContest = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    problems: [],
  });
  const [problemInput, setProblemInput] = useState('');
  const [allProblems, setAllProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosClient.get('/problem/getAllProblems');
        setAllProblems(res.data || []);
      } catch (e) {
        // silently fail — users can enter IDs manually
      } finally {
        setLoadingProblems(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addProblem = (id) => {
    if (!id || form.problems.includes(id)) return;
    setForm((prev) => ({ ...prev, problems: [...prev.problems, id] }));
    setProblemInput('');
  };

  const removeProblem = (id) => {
    setForm((prev) => ({ ...prev, problems: prev.problems.filter((p) => p !== id) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.title || !form.startTime || !form.endTime) {
      setError('Title, start time and end time are required.');
      return;
    }
    if (new Date(form.startTime) >= new Date(form.endTime)) {
      setError('End time must be after start time.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosClient.post('/contest/create', form);
      setSuccess(`Contest "${res.data.contest.title}" created successfully!`);
      setForm({ title: '', description: '', startTime: '', endTime: '', problems: [] });
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create contest.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 text-sm';
  const labelClass = 'block text-xs text-zinc-400 font-medium mb-1.5 uppercase tracking-wider';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-violet-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <Trophy className="text-violet-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Contest</h1>
            <p className="text-zinc-500 text-sm">Admin Panel</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-7 rounded-2xl border border-white/5 bg-zinc-900/60 backdrop-blur-md shadow-2xl space-y-6"
        >
          {/* Title */}
          <div>
            <label className={labelClass}>Contest Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Weekly Challenge #12"
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of the contest..."
              className={inputClass + ' resize-none'}
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Time *</label>
              <input
                type="datetime-local"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className={inputClass + ' [color-scheme:dark]'}
              />
            </div>
            <div>
              <label className={labelClass}>End Time *</label>
              <input
                type="datetime-local"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className={inputClass + ' [color-scheme:dark]'}
              />
            </div>
          </div>

          {/* Problems */}
          <div>
            <label className={labelClass}>Add Problems</label>

            {/* Dropdown from existing problems */}
            {!loadingProblems && allProblems.length > 0 && (
              <select
                value=""
                onChange={(e) => addProblem(e.target.value)}
                className={inputClass + ' mb-2 cursor-pointer'}
              >
                <option value="">— Select a problem to add —</option>
                {allProblems
                  .filter((p) => !form.problems.includes(p._id))
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.difficulty})
                    </option>
                  ))}
              </select>
            )}

            {/* Manual ID input */}
            <div className="flex gap-2">
              <input
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                placeholder="Or paste Problem ID manually..."
                className={inputClass}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addProblem(problemInput.trim()); } }}
              />
              <button
                type="button"
                onClick={() => addProblem(problemInput.trim())}
                className="px-4 py-3 bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/30 rounded-xl text-violet-300 transition-all shrink-0"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Selected problems */}
            {form.problems.length > 0 && (
              <div className="mt-3 space-y-2">
                {form.problems.map((pid) => {
                  const prob = allProblems.find((p) => p._id === pid);
                  return (
                    <div
                      key={pid}
                      className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-zinc-800/60 border border-white/5"
                    >
                      <span className="text-sm text-zinc-200 truncate font-mono">
                        {prob ? `${prob.title}` : pid}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProblem(pid)}
                        className="ml-3 text-zinc-500 hover:text-red-400 transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={16} shrink-0="true" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Trophy size={18} />}
            {submitting ? 'Creating...' : 'Create Contest'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateContest;
