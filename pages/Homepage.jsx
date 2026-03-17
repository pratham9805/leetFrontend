import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Code2, LogOut, Shield, User, Sun, Moon, Search, Sparkles, Trophy, Target, TrendingUp, ChevronRight, Zap, BookOpen, BarChart3 } from "lucide-react";
import axiosClient from "../src/utils/axiosClient";
import { logoutUser } from "../src/authSlice";
import { toggleTheme } from "../src/themeSlice";
import {setProblems} from "../src/problemSlice"

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
const { problems } = useSelector((state) => state.problem);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    difficulty: "all",
    tag: "all",
    status: "all",
  });

  useEffect(() => {
    const fetchProblems = async () => {
  try {

    const { data } = await axiosClient.get("/problem/getAllProblem");

    dispatch(setProblems(data));

  } catch (error) {

    console.error("Error fetching problems:", error);

  }
};


    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/problemSolvedByUser");
        setSolvedProblems(data);
      } catch (error) {
        console.error("Error fetching solved problems:", error);
      }
    };

    const loadData = async () => {
      await fetchProblems();
      if (user) await fetchSolvedProblems();
      setLoading(false);
    };

    loadData();
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode === "dark" ? "leetdark" : "leetlight");
  }, [mode]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch =
      filters.difficulty === "all" ||
      problem.difficulty === filters.difficulty;

    const tagMatch =
      filters.tag === "all" || problem.tags === filters.tag;

    const statusMatch =
      filters.status === "all" ||
      solvedProblems.some((sp) => sp._id === problem._id);

    const searchMatch =
      !searchQuery ||
      problem.title.toLowerCase().includes(searchQuery.toLowerCase());

    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  const completionPercent = problems.length > 0
    ? Math.round((solvedProblems.length / problems.length) * 100)
    : 0;

  const easyTotal   = problems.filter((p) => p.difficulty === "easy").length;
  const mediumTotal = problems.filter((p) => p.difficulty === "medium").length;
  const hardTotal   = problems.filter((p) => p.difficulty === "hard").length;

  const easySolved = solvedProblems.filter((sp) =>
    problems.find((p) => p._id === sp._id && p.difficulty === "easy")
  ).length;
  const mediumSolved = solvedProblems.filter((sp) =>
    problems.find((p) => p._id === sp._id && p.difficulty === "medium")
  ).length;
  const hardSolved = solvedProblems.filter((sp) =>
    problems.find((p) => p._id === sp._id && p.difficulty === "hard")
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="relative flex flex-col items-center gap-4">
          <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-full blur-3xl animate-glow mx-auto"></div>
          <span className="loading loading-spinner loading-lg text-primary relative z-10"></span>
          <p className="text-base-content/60 text-sm font-medium tracking-widest uppercase animate-pulse">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 relative overflow-x-hidden">
      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/8 to-secondary/8 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-accent/8 to-primary/8 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-secondary/5 to-accent/5 rounded-full blur-[100px] animate-glow"></div>
      </div>

      {/* ══════ NAVBAR ══════ */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="navbar glass-card-strong sticky top-0 z-50 px-6 border-b border-base-content/5"
      >
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-2xl gap-2 font-black group">
            <div className="relative">
              <Code2 className="w-7 h-7 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="gradient-text">LeetCode</span>
          </NavLink>
        </div>

        <div className="flex-none flex items-center gap-3">
          {/* Theme Toggle */}
          <motion.button
            whileTap={{ scale: 0.9, rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={handleThemeToggle}
            className="btn btn-ghost btn-circle relative overflow-hidden group"
            aria-label="Toggle theme"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
            <AnimatePresence mode="wait">
              {mode === "dark" ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="w-5 h-5 text-warning" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="w-5 h-5 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* User Dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-ghost gap-2 group">
              <div className="avatar placeholder">
                <div className="bg-gradient-to-br from-primary to-secondary text-primary-content w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-300">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <span className="hidden sm:inline font-semibold text-base-content/80">
                {user?.firstName || "User"}
              </span>
            </div>

            <ul className="dropdown-content menu glass-card-strong rounded-2xl w-56 shadow-2xl border border-base-content/5 mt-3 p-2 z-50">
              <li>
                <button onClick={handleLogout} className="gap-3 rounded-xl hover:bg-error/10 hover:text-error transition-colors duration-200">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </li>
              {user?.role === "admin" && (
                <li>
                  <NavLink to="/admin" className="gap-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors duration-200">
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </motion.nav>

      {/* ══════ BODY ══════ */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-8 relative z-10">
        <div className="max-w-screen-xl mx-auto flex gap-7">

          {/* ── LEFT SIDEBAR ── */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex flex-col gap-5 w-72 flex-shrink-0"
          >
            {/* Profile Card */}
            <div className="card glass-card card-glow rounded-2xl overflow-hidden">
              <div className="px-5 pt-5 pb-5">
                <div className="flex items-center gap-4 mb-4">
                  {/* Solid filled avatar — clearly visible */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                    <span className="text-xl font-black text-white select-none">
                      {user?.firstName?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-black text-base-content leading-tight">{user?.firstName || "Coder"}</h2>
                    <p className="text-xs text-base-content/45 mt-0.5 truncate">{user?.email || "developer@leetcode.com"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-warning/15 to-amber-400/15 border border-warning/25 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-warning" />
                    <span className="text-xs font-bold text-warning">Rank #{Math.max(1, 9999 - solvedProblems.length * 47)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="card glass-card card-glow rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-base-content">Progress</span>
              </div>

              {/* SVG Ring */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-[68px] h-[68px] flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 68 68">
                    <circle cx="34" cy="34" r="27" fill="none" strokeWidth="5" className="text-base-300" stroke="currentColor" />
                    <motion.circle
                      cx="34" cy="34" r="27"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      className="text-primary"
                      strokeDasharray={`${2 * Math.PI * 27}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 27 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 27 * (1 - completionPercent / 100) }}
                      transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm font-black text-base-content">{completionPercent}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black text-base-content tabular-nums">
                    {solvedProblems.length}
                    <span className="text-sm font-normal text-base-content/40">/{problems.length}</span>
                  </p>
                  <p className="text-xs text-base-content/50 mt-0.5">problems solved</p>
                </div>
              </div>

              {/* Per-difficulty */}
              <div className="flex flex-col gap-2.5">
                {[
                  { label: "Easy", solved: easySolved, total: easyTotal, color: "from-success to-emerald-400", textColor: "text-success" },
                  { label: "Medium", solved: mediumSolved, total: mediumTotal, color: "from-warning to-amber-400", textColor: "text-warning" },
                  { label: "Hard", solved: hardSolved, total: hardTotal, color: "from-error to-rose-400", textColor: "text-error" },
                ].map(({ label, solved, total, color, textColor }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${textColor}`}>{label}</span>
                      <span className="text-xs text-base-content/40 tabular-nums">{solved}/{total}</span>
                    </div>
                    <div className="h-1.5 bg-base-300/60 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${color}`}
                        initial={{ width: 0 }}
                        animate={{ width: total > 0 ? `${(solved / total) * 100}%` : "0%" }}
                        transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Goal Card */}
            <div className="card glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-warning" />
                <span className="text-sm font-bold text-base-content">Daily Goal</span>
              </div>
              <div className="space-y-2">
                {["Solve 1 Easy problem", "Review previous solutions", "Try a new algorithm"].map((tip, i) => (
                  <div key={i} className="flex items-center gap-2.5 group cursor-default">
                    <div className="w-4 h-4 rounded-full border-2 border-base-content/15 group-hover:border-primary/40 transition-colors duration-200 flex-shrink-0"></div>
                    <span className="text-sm text-base-content/50 group-hover:text-base-content/70 transition-colors duration-200">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* ── MAIN PANEL ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Hero Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-2"
            >
              <h1 className="text-3xl lg:text-4xl font-bold text-base-content">
                Welcome back, <span className="gradient-text">{user?.firstName || "Coder"}</span>
                <motion.span
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                  className="inline-block ml-2"
                >👋</motion.span>
              </h1>
              <p className="text-base-content/50 mt-2 text-lg">Track your progress and keep solving!</p>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: Target,    label: "Total Problems", value: problems.length,        gradient: "from-primary to-blue-500",   shadowColor: "shadow-primary/20",   delay: 0 },
                { icon: Trophy,    label: "Solved",          value: solvedProblems.length,  gradient: "from-success to-emerald-400",shadowColor: "shadow-success/20",    delay: 0.1 },
                { icon: TrendingUp,label: "Completion",      value: `${completionPercent}%`,gradient: "from-secondary to-purple-400",shadowColor: "shadow-secondary/20", delay: 0.2, hasBar: true },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: stat.delay, ease: "easeOut" }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="card glass-card card-glow p-6 cursor-default group transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base-content/50 text-sm font-medium">{stat.label}</p>
                      <p className={`text-3xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                  {stat.hasBar && (
                    <div className="mt-4 w-full bg-base-300/50 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercent}%` }}
                        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Search & Filters */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              {/* Search */}
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30 group-focus-within:text-primary transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-full pl-11 bg-base-200/50 border-base-content/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <select
                  className="select select-bordered select-sm bg-base-200/50 border-base-content/10 rounded-xl min-w-[130px] focus:border-primary/50"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All Problems</option>
                  <option value="solved">Solved</option>
                </select>

                <select
                  className="select select-bordered select-sm bg-base-200/50 border-base-content/10 rounded-xl min-w-[140px] focus:border-primary/50"
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <select
                  className="select select-bordered select-sm bg-base-200/50 border-base-content/10 rounded-xl min-w-[110px] focus:border-primary/50"
                  value={filters.tag}
                  onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                >
                  <option value="all">All Tags</option>
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">DP</option>
                </select>
              </div>
            </motion.div>

            {/* Problem count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 -mt-2"
            >
              <Sparkles className="w-4 h-4 text-primary/60" />
              <span className="text-sm text-base-content/40 font-medium">
                Showing{" "}
                <span className="text-base-content/70 font-semibold">{filteredProblems.length}</span>{" "}
                of {problems.length} problems
              </span>
            </motion.div>

            {/* Problem List */}
            <div className="flex flex-col gap-3 pb-10">
              <AnimatePresence>
                {filteredProblems.map((problem, index) => {
                  const isSolved = solvedProblems.some((sp) => sp._id === problem._id);

                  return (
                    <motion.div
                      key={problem._id}
                      initial={{ opacity: 0, y: 25 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" }}
                      whileHover={{ y: -3, scale: 1.008 }}
                      className="group"
                    >
                      <div className="card glass-card card-glow rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                        <div className="card-body p-5 relative z-10">
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-secondary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                              <div className={`w-1.5 h-10 rounded-full ${
                                problem.difficulty === 'easy'   ? 'bg-gradient-to-b from-success to-emerald-400' :
                                problem.difficulty === 'medium' ? 'bg-gradient-to-b from-warning to-amber-400' :
                                'bg-gradient-to-b from-error to-rose-400'
                              }`}></div>
                              <div>
                                <h2 className="text-lg font-bold text-base-content group-hover:text-primary transition-colors duration-300">
                                  <NavLink to={`/problem/${problem._id}`}>
                                    {problem.title}
                                  </NavLink>
                                </h2>
                                <div className="flex gap-2 mt-1.5">
                                  <div className={`badge badge-sm font-semibold ${getDifficultyBadgeColor(problem.difficulty)}`}>
                                    {problem.difficulty}
                                  </div>
                                  <div className="badge badge-sm badge-outline border-base-content/15 text-base-content/50 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {problem.tags}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {isSolved && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-success/10 to-emerald-400/10 border border-success/20"
                              >
                                <Check className="w-3.5 h-3.5 text-success" />
                                <span className="text-xs font-bold text-success">Solved</span>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredProblems.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="inline-block p-6 rounded-3xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-base-content/5 mb-4">
                    <Search className="w-12 h-12 text-base-content/20 mx-auto" />
                  </div>
                  <p className="text-base-content/40 text-lg font-medium">No problems found</p>
                  <p className="text-base-content/25 text-sm mt-1">Try adjusting your filters</p>
                </motion.div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":   return "badge-success";
    case "medium": return "badge-warning";
    case "hard":   return "badge-error";
    default:       return "badge-neutral";
  }
};

export default Homepage;
