import { NavLink } from "react-router";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Code2, Brain, Trophy, BarChart3, Users, Layers, CheckCircle,
  TrendingUp, Zap, ArrowRight, Github, Linkedin, Twitter,
  Terminal, FlaskConical, Star, Play, BookOpen, Target,
  Cpu, Database, Globe, ChevronRight, Sparkles, Medal,
  LineChart, ClipboardList, MessageSquare, Timer
} from "lucide-react";

/* ── Animated section wrapper ── */
function FadeIn({ children, delay = 0, direction = "up", className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const variants = {
    hidden: { opacity: 0, y: direction === "up" ? 40 : direction === "down" ? -40 : 0, x: direction === "left" ? 40 : direction === "right" ? -40 : 0 },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Feature card ── */
function FeatureCard({ icon: Icon, title, desc, tags, color, delay }) {
  return (
    <FadeIn delay={delay} className="h-full">
      <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ duration: 0.25 }}
        className="h-full rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-6 flex flex-col gap-3 group cursor-default hover:border-white/16 transition-colors duration-300">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
        <p className="text-white/55 text-sm leading-relaxed flex-1">{desc}</p>
        {tags && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tags.map((t) => (
              <span key={t} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/8 text-white/60 border border-white/10">{t}</span>
            ))}
          </div>
        )}
      </motion.div>
    </FadeIn>
  );
}

/* ── Step card ── */
function StepCard({ step, title, desc, delay }) {
  return (
    <FadeIn delay={delay} className="flex flex-col items-center text-center">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/30 text-2xl font-black text-white z-10 relative">
          {step}
        </div>
        <div className="absolute inset-0 bg-violet-500/30 rounded-2xl blur-lg scale-125"></div>
      </div>
      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed max-w-[180px]">{desc}</p>
    </FadeIn>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080b14] text-white overflow-x-hidden">

      {/* ════════════════════════════════
                 FLOATING ORBS
         ════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-violet-600/15 to-indigo-600/10 rounded-full blur-[140px] animate-float"></div>
        <div className="absolute bottom-0 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/10 to-blue-600/8 rounded-full blur-[140px] animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-gradient-to-br from-pink-500/8 to-rose-500/5 rounded-full blur-[100px] animate-glow"></div>
        {/* Grid */}
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(oklch(1 0 0 / 0.03) 1px, transparent 1px), linear-gradient(to right, oklch(1 0 0 / 0.03) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
      </div>

      {/* ════════════════════════════════
                   NAVBAR
         ════════════════════════════════ */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-white/6 bg-[#080b14]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              CodeShastra
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {["Features", "How It Works", "Tech Stack"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/55 hover:text-white hover:bg-white/6 transition-all duration-200">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <NavLink to="/login"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white/70 hover:text-white hover:bg-white/8 border border-white/10 hover:border-white/20 transition-all duration-200">
              Log In
            </NavLink>
            <NavLink to="/signup"
              className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 transition-all duration-200">
              Sign Up Free
            </NavLink>
          </div>
        </div>
      </motion.nav>

      {/* ════════════════════════════════
                  HERO SECTION
         ════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center py-20">
          {/* Left */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Practice. Compete. Grow.</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              Master{" "}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">DSA</span>{" "}
              with Real{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Challenges</span>
                <motion.div animate={{ scaleX: [0, 1] }} transition={{ duration: 0.7, delay: 0.9 }}
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full origin-left" />
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg text-white/55 leading-relaxed mb-10 max-w-lg">
              CodeShastra helps developers master Data Structures & Algorithms through real coding problems, AI-powered hints, live contests, and deep progress tracking.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}
              className="flex flex-wrap gap-3">
              <NavLink to="/signup"
                className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-violet-500/30 transition-all duration-300 hover:shadow-violet-500/50 hover:-translate-y-0.5">
                <Play className="w-4 h-4" />
                Start Solving
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </NavLink>
              <NavLink to="/login"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/12 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white font-semibold text-base transition-all duration-300 hover:-translate-y-0.5">
                <BookOpen className="w-4 h-4" />
                Explore Problems
              </NavLink>
            </motion.div>

            {/* Micro stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="mt-10 flex items-center gap-6 flex-wrap">
              {[
                { label: "Problems", value: "500+" },
                { label: "Languages", value: "3+" },
                { label: "Users", value: "1K+" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xl font-black text-white">{value}</span>
                  <span className="text-sm text-white/40 font-medium">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — animated code window */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-cyan-500/10 rounded-3xl blur-2xl scale-110"></div>
              <div className="relative rounded-3xl border border-white/10 bg-[#0d111e] overflow-hidden shadow-2xl">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6 bg-white/3">
                  <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                  <span className="ml-3 text-xs text-white/30 font-mono">twoSum.js</span>
                </div>

                {/* Code */}
                <div className="p-6 font-mono text-sm leading-7">
                  <CodeLine delay={0.5} tokens={[{ t: "function ", c: "text-violet-400" }, { t: "twoSum", c: "text-yellow-300" }, { t: "(nums, target) {", c: "text-white/70" }]} />
                  <CodeLine delay={0.65} indent={1} tokens={[{ t: "const ", c: "text-violet-400" }, { t: "seen ", c: "text-cyan-300" }, { t: "= new ", c: "text-white/50" }, { t: "Map", c: "text-yellow-300" }, { t: "();", c: "text-white/50" }]} />
                  <CodeLine delay={0.8} indent={1} tokens={[{ t: "for ", c: "text-violet-400" }, { t: "(let i = 0; i < nums.length; i++) {", c: "text-white/70" }]} />
                  <CodeLine delay={0.95} indent={2} tokens={[{ t: "const ", c: "text-violet-400" }, { t: "diff ", c: "text-cyan-300" }, { t: "= target - nums[i];", c: "text-white/60" }]} />
                  <CodeLine delay={1.1} indent={2} tokens={[{ t: "if ", c: "text-violet-400" }, { t: "(seen.has(diff)) ", c: "text-white/60" }, { t: "return ", c: "text-violet-400" }, { t: "[seen.get(diff), i];", c: "text-emerald-400" }]} />
                  <CodeLine delay={1.25} indent={2} tokens={[{ t: "seen", c: "text-cyan-300" }, { t: ".set(nums[i], i);", c: "text-white/60" }]} />
                  <CodeLine delay={1.4} indent={1} tokens={[{ t: "}", c: "text-white/50" }]} />
                  <CodeLine delay={1.55} tokens={[{ t: "}", c: "text-white/50" }]} />
                  <div className="mt-4 pt-4 border-t border-white/6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
                      className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-emerald-400 text-xs font-bold">✓ Accepted — Runtime: 72ms · Memory: 42.3 MB</span>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 text-xs font-black text-white flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Accepted!
              </motion.div>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 text-xs font-black text-white flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Rank #42
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20">
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronRight className="w-4 h-4 rotate-90" />
        </motion.div>
      </section>

      {/* ════════════════════════════════
                FEATURES SECTION
         ════════════════════════════════ */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/8 text-cyan-300 text-xs font-bold mb-4">
              <Zap className="w-3.5 h-3.5" /> Platform Features
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">level up</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              A complete ecosystem for coding practice, competition, and growth.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Target, title: "1000+ Coding Problems", desc: "Practice problems categorized by difficulty (Easy, Medium, Hard) and topics. Ace your next coding interview.", tags: ["Arrays", "Graphs", "DP", "Trees"], color: "from-violet-500 to-indigo-600", delay: 0 },
              { icon: Terminal, title: "Online Code Editor", desc: "Write, run, and test code directly in the browser with syntax highlighting and multi-language support.", tags: ["Java", "JavaScript", "C++"], color: "from-cyan-500 to-blue-600", delay: 0.05 },
              { icon: Brain, title: "AI Coding Assistant", desc: "Stuck on a problem? Get smart hints from our AI assistant without spoiling the full solution.", tags: ["Hints", "Explanations", "Mentor"], color: "from-pink-500 to-rose-600", delay: 0.1 },
              { icon: Timer, title: "Contest Mode", desc: "Compete in timed contests with multiple problems, a live leaderboard, and real competitive pressure.", tags: ["Timer", "Leaderboard", "Live"], color: "from-amber-500 to-orange-600", delay: 0.15 },
              { icon: Medal, title: "Global Leaderboard", desc: "See where you stand globally. Rankings based on problems solved, speed, and contest performance.", tags: ["Rankings", "Scores", "Badges"], color: "from-emerald-500 to-teal-600", delay: 0.2 },
              { icon: Layers, title: "Topic Categories", desc: "Problems organized by topic so you can study systematically and focus on your weak areas.", tags: ["Arrays", "Strings", "DP", "Graphs"], color: "from-blue-500 to-violet-600", delay: 0.25 },
              { icon: ClipboardList, title: "Auto Code Evaluation", desc: "Submit your code and get instant results — Accepted, Wrong Answer, TLE — with runtime and memory stats.", tags: ["Test Cases", "Judge0", "Instant"], color: "from-rose-500 to-pink-600", delay: 0.3 },
              { icon: LineChart, title: "Progress Tracking", desc: "Track solved problems, difficulty breakdown, submission history, and improvement over time.", tags: ["Stats", "History", "Growth"], color: "from-teal-500 to-cyan-600", delay: 0.35 },
              { icon: Users, title: "Collaboration (Coming)", desc: "Code with friends in real time. Shared editor with live cursor tracking — perfect for pair programming.", tags: ["Shared Editor", "Real-time", "Teams"], color: "from-indigo-500 to-purple-600", delay: 0.4 },
            ].map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
              HOW IT WORKS SECTION
         ════════════════════════════════ */}
      <section id="how-it-works" className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/5 to-transparent pointer-events-none"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/8 text-violet-300 text-xs font-bold mb-4">
              <Play className="w-3.5 h-3.5" /> How It Works
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
              From zero to{" "}
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">accepted</span>{" "}
              in 5 steps
            </h2>
          </FadeIn>

          {/* Steps — connected with a line on desktop */}
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-16 right-16 h-0.5 bg-gradient-to-r from-violet-500/40 via-indigo-500/40 to-cyan-500/40"></div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              <StepCard step="1" title="Create Account" desc="Sign up for free in seconds. No credit card needed." delay={0} />
              <StepCard step="2" title="Pick a Problem" desc="Browse problems by difficulty, topic, or search." delay={0.1} />
              <StepCard step="3" title="Write Code" desc="Use our in-browser editor — no setup required." delay={0.2} />
              <StepCard step="4" title="Run & Submit" desc="Test with custom input, then submit for evaluation." delay={0.3} />
              <StepCard step="5" title="Improve" desc="Review results, check hints, and level up." delay={0.4} />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
                  TECH STACK
         ════════════════════════════════ */}
      <section id="tech-stack" className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/8 text-emerald-300 text-xs font-bold mb-4">
              <Cpu className="w-3.5 h-3.5" /> Tech Stack
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
              Built with{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">modern tech</span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { label: "Frontend", items: ["React.js", "Redux Toolkit", "Tailwind CSS", "Framer Motion"], color: "from-blue-500 to-cyan-500", icon: Globe },
              { label: "Backend", items: ["Node.js", "Express.js", "REST API", "JWT Auth"], color: "from-emerald-500 to-teal-500", icon: Terminal },
              { label: "Database", items: ["MongoDB", "Mongoose", "Atlas", "Aggregations"], color: "from-amber-500 to-orange-500", icon: Database },
              { label: "Code Engine", items: ["Judge0 API", "Multi-language", "Auto-grading", "Test Cases"], color: "from-violet-500 to-purple-500", icon: FlaskConical },
            ].map(({ label, items, color, icon: Icon }, i) => (
              <FadeIn key={label} delay={i * 0.08}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.22 }}
                  className="rounded-2xl border border-white/8 bg-white/3 p-5 flex flex-col gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-black text-white/40 uppercase tracking-widest">{label}</p>
                  <div className="flex flex-col gap-1.5">
                    {items.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${color} flex-shrink-0`}></div>
                        <span className="text-sm text-white/70 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
               WHY CODESHASTRA
         ════════════════════════════════ */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/5 to-transparent pointer-events-none"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/8 text-pink-300 text-xs font-bold mb-4">
              <Star className="w-3.5 h-3.5" /> Why CodeShastra
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
              Your{" "}
              <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">unfair advantage</span>{" "}
              in coding
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Target, title: "Interview Ready", desc: "Practice real interview questions from top companies. Ship confidence, not just code.", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
              { icon: Brain, title: "Smarter Learning", desc: "AI hints guide you toward the solution without giving it away. Learn the thinking, not just the answer.", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
              { icon: Trophy, title: "Competitive Edge", desc: "Contest mode puts you under real pressure. Rank globally and sharpen your speed and accuracy.", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
              { icon: Zap, title: "Instant Feedback", desc: "Submit and know in seconds. Detailed results tell you exactly what went wrong and how to fix it.", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            ].map(({ icon: Icon, title, desc, color, bg }, i) => (
              <FadeIn key={title} delay={i * 0.08}>
                <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.22 }}
                  className={`rounded-2xl border ${bg} p-6 flex flex-col gap-3 h-full`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                  <h3 className="font-bold text-white text-base">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
               CALL TO ACTION
         ════════════════════════════════ */}
      <section className="relative py-24 px-6">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden border border-white/10">
              {/* BG */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-cyan-600/15"></div>
              <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(124,58,237,0.15) 0%, transparent 60%)" }}></div>

              <div className="relative z-10 px-8 py-16 text-center">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  className="text-5xl mb-6 inline-block">🚀</motion.div>
                <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
                  Start your coding journey{" "}
                  <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">today</span>
                </h2>
                <p className="text-white/55 text-lg mb-10 max-w-lg mx-auto">
                  Join thousands of developers who use CodeShastra to crack interviews and build real skills.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <NavLink to="/signup"
                    className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base shadow-2xl shadow-violet-500/30 transition-all duration-300 hover:shadow-violet-500/50 hover:-translate-y-0.5">
                    <Play className="w-5 h-5" /> Start Solving Problems
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </NavLink>
                  <NavLink to="/login"
                    className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-base transition-all duration-300 hover:-translate-y-0.5">
                    <Trophy className="w-5 h-5" /> Join a Contest
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ════════════════════════════════
                    FOOTER
         ════════════════════════════════ */}
      <footer className="border-t border-white/6 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Code2 className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-black text-white tracking-tight">CodeShastra</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed max-w-[200px]">
                Master DSA with real-world problems, AI hints, and live contests.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Platform</p>
              <div className="flex flex-col gap-2">
                {["Problems", "Contests", "Leaderboard", "Discuss"].map((l) => (
                  <NavLink key={l} to="/login" className="text-sm text-white/50 hover:text-white transition-colors">{l}</NavLink>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Company</p>
              <div className="flex flex-col gap-2">
                {["About", "Contact", "Privacy Policy", "Terms"].map((l) => (
                  <a key={l} href="#" className="text-sm text-white/50 hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Connect</p>
              <div className="flex gap-3">
                {[
                  { icon: Github, label: "GitHub" },
                  { icon: Linkedin, label: "LinkedIn" },
                  { icon: Twitter, label: "Twitter" },
                ].map(({ icon: Icon, label }) => (
                  <a key={label} href="#" aria-label={label}
                    className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-200">
                    <Icon className="w-4 h-4 text-white/60" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/25">© 2026 CodeShastra. All rights reserved.</p>
            <div className="flex items-center gap-1 text-xs text-white/25">
              <span>Built with</span>
              <span className="text-red-400">♥</span>
              <span>for developers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Helper: animated code tokens ── */
function CodeLine({ tokens, indent = 0, delay }) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay }}
      className="flex" style={{ paddingLeft: `${indent * 1.25}rem` }}>
      {tokens.map((tok, i) => (
        <span key={i} className={tok.c}>{tok.t}</span>
      ))}
    </motion.div>
  );
}
