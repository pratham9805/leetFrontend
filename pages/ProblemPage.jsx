import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from "../src/utils/axiosClient";
import SubmissionHistory from '../src/components/SubmissionHistory';
import ChatAI from '../src/components/ChatAI';
import Editorial from '../src/components/Editorial';
import CollaborateModal from '../src/components/CollaborateModal';
import CollabToast from '../src/components/CollabToast';
import { useCollaboration } from '../src/utils/useCollaboration';
import {
  FileText, PenTool, Lightbulb, History, Bot, Code2,
  CheckCircle2, Play, Send, Loader2, ChevronRight, ChevronDown, ChevronUp,
  Copy, Check, Sparkles, FlaskConical, GripVertical, GripHorizontal,
  Trophy, Clock, MemoryStick, XCircle, AlertCircle, Settings2,
  Maximize2, ChevronLeft, RefreshCcw, LayoutPanelLeft, Lock, Zap, Users
} from 'lucide-react';

/* ════════════════════════════════════════════
   HOOK — horizontal panel resize (left ↔ right)
════════════════════════════════════════════ */
const useHorizontalResize = (initial = 40) => {
  const [pct, setPct] = useState(initial);
  const ref = useRef(null);
  const dragging = useRef(false);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const move = (ev) => {
      if (!dragging.current || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setPct(Math.min(Math.max(((ev.clientX - r.left) / r.width) * 100, 20), 70));
    };
    const up = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, []);

  return { pct, ref, onMouseDown };
};

/* ════════════════════════════════════════════
   HOOK — vertical panel resize (editor ↕ console)
════════════════════════════════════════════ */
const useVerticalResize = (initial = 65) => {
  const [pct, setPct] = useState(initial);
  const ref = useRef(null);
  const dragging = useRef(false);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    const move = (ev) => {
      if (!dragging.current || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setPct(Math.min(Math.max(((ev.clientY - r.top) / r.height) * 100, 30), 80));
    };
    const up = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, []);

  return { pct, ref, onMouseDown };
};

/* ── Copy hook ── */
const useCopy = () => {
  const [copied, setCopied] = useState(false);
  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return { copied, copy };
};

/* ════════════════════════════════════════════
   DIFFICULTY BADGE
════════════════════════════════════════════ */
const DifficultyBadge = ({ difficulty }) => {
  const map = {
    easy:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
    medium: 'text-amber-400  bg-amber-400/10  border-amber-400/25',
    hard:   'text-rose-400   bg-rose-400/10   border-rose-400/25',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold tracking-wider ${map[difficulty?.toLowerCase()] || map.easy}`}>
      {difficulty}
    </span>
  );
};

/* ════════════════════════════════════════════
   EXAMPLE CARD
════════════════════════════════════════════ */
const ExampleCard = ({ example, index }) => {
  const { copied, copy } = useCopy();
  return (
    <div className="rounded-xl overflow-hidden border border-white/8 bg-white/[0.025] group hover:border-white/14 transition-colors duration-300">
      {/* shimmer */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/6">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
          </div>
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Example {index + 1}</span>
        </div>
        <button onClick={() => copy(example.input)}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-white/25 hover:text-cyan-400 hover:bg-cyan-500/8 transition-all">
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="p-4 space-y-3 font-mono text-[13px]">
        <div>
          <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><ChevronRight size={9} />Input</p>
          <div className="px-3 py-2 rounded-lg bg-black/40 border border-violet-500/12 text-white/75 break-all leading-relaxed">{example.input}</div>
        </div>
        <div>
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><ChevronRight size={9} />Output</p>
          <div className="px-3 py-2 rounded-lg bg-black/40 border border-emerald-500/12 text-emerald-400 font-bold">{example.output}</div>
        </div>
        {example.explanation && (
          <div>
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><ChevronRight size={9} />Explanation</p>
            <p className="text-white/45 text-xs leading-relaxed border-l-2 border-amber-500/30 pl-3">{example.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   TESTCASE ROW
════════════════════════════════════════════ */
const TestCaseRow = ({ tc, index, passed }) => {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border overflow-hidden ${
        passed ? 'border-emerald-500/20 bg-emerald-500/[0.03]' : 'border-rose-500/20 bg-rose-500/[0.03]'
      }`}
    >
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-2.5 text-sm">
        <div className="flex items-center gap-2.5">
          {passed
            ? <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
            : <XCircle      size={14} className="text-rose-400   flex-shrink-0" />}
          <span className="font-semibold text-white/75 text-xs">Case {index + 1}</span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${passed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
            {passed ? 'Passed' : 'Failed'}
          </span>
        </div>
        {open ? <ChevronUp size={13} className="text-white/20" /> : <ChevronDown size={13} className="text-white/20" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-3 space-y-2 font-mono text-xs border-t border-white/5">
              {[
                { label: 'Input',   val: tc.stdin,           color: 'border-violet-500/15 text-white/65' },
                { label: 'Expected',val: tc.expected_output,  color: 'border-emerald-500/15 text-emerald-400' },
                { label: 'Actual',  val: tc.stdout || '—',   color: passed ? 'border-white/8 text-white/60' : 'border-rose-500/20 text-rose-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex gap-3 items-start pt-2">
                  <span className="text-white/25 font-semibold w-16 flex-shrink-0 text-[10px] uppercase tracking-wider pt-0.5">{label}</span>
                  <div className={`flex-1 px-2.5 py-1.5 rounded-lg bg-black/40 border break-all ${color}`}>{val}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ════════════════════════════════════════════
   STAT CHIP
════════════════════════════════════════════ */
const StatChip = ({ icon: Icon, label, value, accent = 'slate' }) => {
  const colors = {
    emerald: { border: 'border-emerald-500/25', icon: 'text-emerald-400', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.12)]' },
    cyan:    { border: 'border-cyan-500/25',    icon: 'text-cyan-400',    glow: 'shadow-[0_0_10px_rgba(6,182,212,0.12)]'  },
    violet:  { border: 'border-violet-500/25',  icon: 'text-violet-400',  glow: 'shadow-[0_0_10px_rgba(139,92,246,0.12)]' },
    amber:   { border: 'border-amber-400/25',   icon: 'text-amber-400',   glow: 'shadow-[0_0_10px_rgba(251,191,36,0.12)]' },
  }[accent] || { border: 'border-white/10', icon: 'text-white/50', glow: '' };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-white/[0.03] ${colors.border} ${colors.glow}`}>
      <Icon size={15} className={colors.icon} />
      <div>
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-black leading-none">{label}</p>
        <p className="text-sm font-black text-white font-mono mt-0.5">{value}</p>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   PANEL TAB BAR  — supports locked tabs
════════════════════════════════════════════ */
const TabBar = ({ tabs, active, setActive, layoutId, className = '' }) => (
  <div className={`flex items-center gap-0.5 ${className}`}>
    {tabs.map(({ id, label, icon: Icon, color, dotGrad, locked, lockReason }) => {
      const isActive = active === id;
      if (locked) {
        return (
          <div key={id} className="relative group">
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap
                         text-white/18 cursor-not-allowed select-none"
            >
              <Icon size={12} />
              {label}
              <Lock size={9} className="text-amber-500/60 ml-0.5" />
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg
                            bg-[#1a1f2e] border border-amber-500/25 text-[10px] text-amber-400 font-semibold
                            whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none
                            transition-opacity duration-200 z-50 shadow-xl shadow-black/40">
              <div className="flex items-center gap-1.5">
                <Lock size={9} />
                {lockReason || 'Locked during contest'}
              </div>
              {/* arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-500/25" />
            </div>
          </div>
        );
      }
      return (
        <button key={id}
          onClick={() => setActive(id)}
          className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 whitespace-nowrap ${
            isActive
              ? `${color} border border-white/10 bg-white/6`
              : 'text-white/35 hover:text-white/60 hover:bg-white/5'
          }`}
        >
          <Icon size={12} />
          {label}
          {isActive && (
            <motion.div
              layoutId={layoutId}
              className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3.5 h-[2px] rounded-full ${dotGrad}`}
              transition={{ duration: 0.22 }}
            />
          )}
        </button>
      );
    })}
  </div>
);

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
const ProblemPage = () => {
  const [problem, setProblem]             = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [codeByLanguage, setCodeByLanguage]     = useState({ javascript: '', java: '', cpp: '' });
  const [loading, setLoading]             = useState(false);
  const [runResult, setRunResult]         = useState(null);
  const [submitResult, setSubmitResult]   = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeBottomTab, setActiveBottomTab] = useState('testcase');
  const [consoleOpen, setConsoleOpen]     = useState(false);
  const editorRef = useRef(null);
  let { problemId } = useParams();
  const { handleSubmit } = useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Contest mode: if contestId is in query params, restrict certain tabs
  const contestId = searchParams.get('contestId');
  const isContestMode = Boolean(contestId);

  const { pct: hPct, ref: hRef, onMouseDown: hDown } = useHorizontalResize(40);
  const { pct: vPct, ref: vRef, onMouseDown: vDown }  = useVerticalResize(65);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/problem/problemById/${problemId}`);
        const codes = { javascript: '', java: '', cpp: '' };
        res.data.startcode.forEach(sc => {
          if (sc.language === 'javascript') codes.javascript = sc.initialcode;
          if (sc.language === 'java')       codes.java       = sc.initialcode;
          if (sc.language === 'c++')        codes.cpp        = sc.initialcode;
        });
        setCodeByLanguage(codes);
        setProblem(res.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [problemId]);

  /* ── Collaboration hook ── */
  const collab = useCollaboration({
    onRemoteCodeChange: useCallback((code, lang) => {
      setCodeByLanguage(prev => ({ ...prev, [lang || selectedLanguage]: code }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLanguage]),
    onRemoteLanguageChange: useCallback((lang) => {
      setSelectedLanguage(lang);
    }, []),
  });

  const handleEditorChange = (v) => {
    const newCode = v || '';
    setCodeByLanguage(p => ({ ...p, [selectedLanguage]: newCode }));
    collab.emitCodeChange(newCode, selectedLanguage);
  };
  const handleEditorDidMount = (e) => { editorRef.current = e; };

  const handleRun = async () => {
    setLoading(true); setRunResult(null); setConsoleOpen(true); setActiveBottomTab('testcase');
    try {
      const r = await axiosClient.post(`/submission/run/${problemId}`, { code: codeByLanguage[selectedLanguage], language: selectedLanguage });
      setRunResult(r.data);
    } catch { setRunResult({ success: false, error: 'Internal server error' }); }
    setLoading(false);
  };

  const handleSubmitCode = async () => {
    setLoading(true); setSubmitResult(null); setConsoleOpen(true); setActiveBottomTab('result');
    try {
      const r = await axiosClient.post(`/submission/submit/${problemId}`, { code: codeByLanguage[selectedLanguage], language: selectedLanguage });
      setSubmitResult(r.data);
    } catch { setSubmitResult(null); }
    setLoading(false);
  };

  const monacoLang = { javascript: 'javascript', java: 'java', cpp: 'cpp' };

  /* ─── Loading screen ─── */
  if (loading && !problem) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0d1117]">
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-violet-600/12 to-indigo-600/8 rounded-full blur-[140px] animate-float" />
        <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-500/8 to-teal-600/5 rounded-full blur-[140px] animate-float" style={{animationDelay:'2s'}} />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-600/20 blur-xl animate-glow" />
            <div className="relative w-16 h-16 rounded-2xl bg-[#161b27] border border-white/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
          </div>
          <p className="font-black text-lg bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Loading Problem</p>
          <div className="flex gap-1.5">
            {['bg-violet-500','bg-pink-500','bg-cyan-500'].map((c,i)=>(
              <motion.div key={i} className={`w-1.5 h-1.5 rounded-full ${c}`}
                animate={{opacity:[0.3,1,0.3],scale:[0.8,1,0.8]}}
                transition={{duration:1.2,repeat:Infinity,delay:i*0.2}} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Tab configs ─── */
  const CONTEST_LOCK_REASON = 'Not available during contest';

  const leftTabs = [
    { id:'description', label:'Description', icon:FileText,    color:'text-violet-400', dotGrad:'bg-gradient-to-r from-violet-400 to-indigo-400', locked: false },
    { id:'editorial',   label:'Editorial',   icon:PenTool,     color:'text-indigo-400', dotGrad:'bg-gradient-to-r from-indigo-400 to-blue-400',   locked: isContestMode, lockReason: CONTEST_LOCK_REASON },
    { id:'solutions',   label:'Solutions',   icon:Lightbulb,   color:'text-amber-400',  dotGrad:'bg-gradient-to-r from-amber-400 to-orange-400',  locked: isContestMode, lockReason: CONTEST_LOCK_REASON },
    { id:'submissions', label:'Submissions', icon:History,     color:'text-cyan-400',   dotGrad:'bg-gradient-to-r from-cyan-400 to-teal-400',     locked: isContestMode, lockReason: CONTEST_LOCK_REASON },
    { id:'ChatAI',      label:'AI Chat',     icon:Bot,         color:'text-pink-400',   dotGrad:'bg-gradient-to-r from-pink-400 to-rose-400',     locked: isContestMode, lockReason: CONTEST_LOCK_REASON },
  ];

  const bottomTabs = [
    { id:'testcase', label:'Test Cases', icon:FlaskConical,  color:'text-violet-400', dotGrad:'bg-gradient-to-r from-violet-400 to-indigo-400' },
    { id:'result',   label:'Result',     icon:CheckCircle2,  color:'text-emerald-400',dotGrad:'bg-gradient-to-r from-emerald-400 to-teal-400'  },
  ];

  const languages = [
    { id:'javascript', label:'JavaScript', color:'from-yellow-500 to-amber-500' },
    { id:'java',       label:'Java',       color:'from-orange-500 to-red-500'   },
    { id:'cpp',        label:'C++',        color:'from-blue-500 to-indigo-500'  },
  ];

  return (
    <>
    <div className="h-screen flex flex-col bg-[#0d1117] text-white overflow-hidden select-none" style={{fontFamily:"'Inter',sans-serif"}}>

      {/* ── AMBIENT ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(to right,rgba(255,255,255,0.018) 1px,transparent 1px)',backgroundSize:'60px 60px'}} />
        <div className="absolute -top-32 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-violet-600/10 to-indigo-600/6 rounded-full blur-[140px] animate-float" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/6 to-teal-600/4 rounded-full blur-[140px] animate-float" style={{animationDelay:'2s'}} />
      </div>

      {/* ══════════════════════════════════════════
          TOP NAV  — leetcode style
      ══════════════════════════════════════════ */}
      <motion.header
        initial={{y:-16,opacity:0}} animate={{y:0,opacity:1}}
        transition={{duration:0.45,ease:[0.22,1,0.36,1]}}
        className="relative z-50 flex-shrink-0 h-12 flex items-center justify-between px-4 border-b border-white/8 bg-[#0d1117]/90 backdrop-blur-xl"
      >
        {/* Left — logo + problem nav */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
              <Code2 size={13} className="text-white" />
            </div>
            <span className="text-sm font-black bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent hidden md:block">
              CodeShastra
            </span>
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Problem title + badge */}
          {problem && (
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-white/85 max-w-[200px] truncate hidden sm:block">{problem.title}</span>
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
          )}

          {/* Contest mode badge */}
          {isContestMode && (
            <>
              <div className="w-px h-5 bg-white/10" />
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                           bg-amber-500/12 border border-amber-500/30
                           shadow-[0_0_14px_rgba(245,158,11,0.2)]"
              >
                <div className="relative flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping opacity-60" />
                </div>
                <Zap size={10} className="text-amber-400 fill-current" />
                <span className="text-[11px] font-black text-amber-400 tracking-wide">CONTEST</span>
                <span className="text-[10px] text-amber-400/50 font-mono hidden sm:block">·  LIVE</span>
              </motion.div>
            </>
          )}
        </div>

        {/* Center — action buttons */}
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          {/* Run */}
          <motion.button
            whileHover={{y:-1,scale:1.03}} whileTap={{scale:0.96}}
            onClick={handleRun} disabled={loading}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-250 ${
              loading ? 'bg-white/6 text-white/25 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/45'
            }`}
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} className="fill-current" />}
            Run
          </motion.button>

          {/* Submit */}
          <motion.button
            whileHover={{y:-1,scale:1.03}} whileTap={{scale:0.96}}
            onClick={handleSubmitCode} disabled={loading}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-250 ${
              loading ? 'bg-white/6 text-white/25 cursor-not-allowed'
                      : 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md shadow-violet-500/25 hover:shadow-pink-500/40'
            }`}
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Submit
          </motion.button>
        </div>

        {/* Right — lang selector */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-0.5 p-0.5 rounded-lg bg-white/5 border border-white/8">
            {languages.map(lang => (
              <button key={lang.id} onClick={() => {
                setSelectedLanguage(lang.id);
                collab.emitLanguageChange(lang.id);
              }}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all duration-200 ${
                  selectedLanguage === lang.id
                    ? `bg-gradient-to-r ${lang.color} text-white shadow`
                    : 'text-white/35 hover:text-white/60'
                }`}
              >{lang.label}</button>
            ))}
          </div>

          {/* ── Collaborate button ── */}
          <motion.div
            whileHover={{ y: -1, scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="relative group"
          >
            <button
              onClick={collab.openModal}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[12px] font-black transition-all duration-300 overflow-hidden border ${
                collab.isInRoom
                  ? 'bg-violet-500/10 border-violet-500/30 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:bg-violet-500/20'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {/* Shimmer sweep effect */}
              {collab.isInRoom && (
                <motion.div
                  className="absolute inset-0 opacity-100 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(139,92,246,0.15) 50%, transparent 60%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              )}
              
              <Users size={14} className={`${collab.isInRoom ? 'text-violet-400' : 'text-white/50 group-hover:text-cyan-400 transition-colors duration-300'}`} />
              
              {collab.isInRoom ? (
                <span className="flex items-center gap-2 z-10">
                  <span className="flex relative">
                    <span className="absolute inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                    {collab.connectedUsers.length} Online
                  </span>
                </span>
              ) : (
                <span className="z-10 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-violet-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  Collaborate
                </span>
              )}
            </button>
            {/* Animated Glow Border behind the button when idle */}
            {!collab.isInRoom && (
              <div className="absolute inset-[-1px] rounded-xl bg-gradient-to-r from-transparent via-violet-500/0 to-transparent group-hover:via-violet-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm pointer-events-none" />
            )}
          </motion.div>
        </div>
      </motion.header>

      {/* ══════════════════════════════════════════
          MAIN WORKSPACE
      ══════════════════════════════════════════ */}
      <div ref={hRef} className="flex flex-1 overflow-hidden relative z-10" style={{gap:0}}>

        {/* ════════════════════════
            LEFT PANEL — description
        ════════════════════════ */}
        <motion.div
          initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}}
          transition={{duration:0.5,delay:0.1,ease:[0.22,1,0.36,1]}}
          style={{width:`${hPct}%`}}
          className="flex-shrink-0 flex flex-col border-r border-white/8 bg-[#0d1117] overflow-hidden"
        >
          {/* Tab bar */}
          <div className="flex-shrink-0 border-b border-white/8 bg-[#0d1117] px-3 overflow-x-auto no-scrollbar">
            <TabBar
              tabs={leftTabs}
              active={activeLeftTab}
              setActive={setActiveLeftTab}
              layoutId="leftTab"
              className="py-1"
            />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">

              {/* DESCRIPTION */}
              {activeLeftTab === 'description' && problem && (
                <motion.div key="desc"
                  initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                  exit={{opacity:0,y:-6}} transition={{duration:0.25}}
                  className="px-5 py-6 space-y-6 select-text"
                >
                  {/* Title row */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-xl font-black text-white/95 leading-tight">{problem.title}</h1>
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </div>
                    {problem.tags && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] font-semibold">
                        <Sparkles size={9} />#{problem.tags}
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-white/8 via-white/12 to-white/8" />

                  {/* Description */}
                  <div className="text-white/75 text-[13.5px] leading-7 whitespace-pre-wrap">{problem.description}</div>

                  {/* Examples */}
                  {problem?.visibletestcases?.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FlaskConical size={13} className="text-cyan-400" />
                        <p className="text-[11px] font-black text-white/35 uppercase tracking-widest">Examples</p>
                        <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent" />
                      </div>
                      {problem.visibletestcases.map((ex, i) => <ExampleCard key={i} example={ex} index={i} />)}
                    </div>
                  )}

                  {/* Constraints placeholder */}
                  <div className="p-4 rounded-xl border border-amber-500/15 bg-amber-500/[0.04]">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Constraints</p>
                    <p className="text-white/45 text-[12px] font-mono leading-relaxed">
                      Check problem statement for full constraints.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* EDITORIAL */}
              {activeLeftTab === 'editorial' && problem && (
                <motion.div key="editorial"
                  initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                  exit={{opacity:0,y:-6}} transition={{duration:0.25}}
                  className="px-5 py-6 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <PenTool size={13} className="text-indigo-400" />
                    <h2 className="text-[11px] font-black text-white/35 uppercase tracking-widest">Editorial</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/20 to-transparent" />
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-white/8 bg-black/20">
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration} />
                  </div>
                </motion.div>
              )}

              {/* SOLUTIONS */}
              {activeLeftTab === 'solutions' && problem && (
                <motion.div key="solutions"
                  initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                  exit={{opacity:0,y:-6}} transition={{duration:0.25}}
                  className="px-5 py-6 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb size={13} className="text-amber-400" />
                    <h2 className="text-[11px] font-black text-white/35 uppercase tracking-widest">Solutions</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-amber-500/20 to-transparent" />
                  </div>
                  {problem?.referencesolution?.length > 0 ? (
                    <div className="space-y-4">
                      {problem.referencesolution.map((sol, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border border-white/8 bg-black/20">
                          <div className="px-4 py-2.5 border-b border-white/6 bg-white/3 flex justify-between items-center">
                            <span className="font-mono text-[11px] font-black text-amber-400 px-2 py-0.5 rounded bg-amber-500/12 border border-amber-500/20">{sol?.language}</span>
                            <span className="text-[10px] text-white/20 uppercase tracking-widest">Reference</span>
                          </div>
                          <pre className="p-4 text-xs text-white/65 font-mono overflow-x-auto custom-scrollbar leading-6"><code>{sol?.completecode}</code></pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-white/8 text-center">
                      <div className="p-4 rounded-full bg-amber-500/8 border border-amber-500/15 mb-3">
                        <Lightbulb size={28} className="text-amber-500/40" />
                      </div>
                      <p className="text-sm font-semibold text-white/35">Solutions locked until solved.</p>
                      <p className="text-xs mt-1 text-white/18">Keep going! 🚀</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* SUBMISSIONS */}
              {activeLeftTab === 'submissions' && (
                <motion.div key="submissions"
                  initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                  exit={{opacity:0,y:-6}} transition={{duration:0.25}}
                  className="px-5 py-6 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <History size={13} className="text-cyan-400" />
                    <h2 className="text-[11px] font-black text-white/35 uppercase tracking-widest">My Submissions</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent" />
                  </div>
                  <SubmissionHistory problemId={problemId} />
                </motion.div>
              )}

              {/* AI CHAT */}
              {activeLeftTab === 'ChatAI' && (
                <motion.div key="chat"
                  initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                  exit={{opacity:0,y:-6}} transition={{duration:0.25}}
                  className="h-full flex flex-col px-5 py-6 gap-3" style={{minHeight:'calc(100vh - 9rem)'}}
                >
                  <div className="flex items-center gap-2">
                    <Bot size={13} className="text-pink-400" />
                    <h2 className="text-[11px] font-black text-white/35 uppercase tracking-widest">AI Assistant</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-pink-500/20 to-transparent" />
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-emerald-400 font-semibold">Online</span>
                    </div>
                  </div>
                  <div className="flex-1 rounded-xl border border-white/8 bg-black/20 overflow-hidden min-h-[400px]">
                    <ChatAI problem={problem} />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>

        {/* ════════════════════════
            HORIZONTAL DRAG HANDLE
        ════════════════════════ */}
        <div
          className="w-[5px] flex-shrink-0 flex items-center justify-center cursor-col-resize group z-20 bg-transparent hover:bg-white/3 transition-colors duration-200"
          onMouseDown={hDown}
        >
          <div className="w-[1px] h-full bg-white/8 group-hover:bg-gradient-to-b group-hover:from-violet-500/50 group-hover:via-cyan-500/50 group-hover:to-pink-500/50 transition-all duration-300 group-active:opacity-100" />
        </div>

        {/* ════════════════════════
            RIGHT PANEL
        ════════════════════════ */}
        <motion.div
          initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}
          transition={{duration:0.5,delay:0.15,ease:[0.22,1,0.36,1]}}
          className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]"
          ref={vRef}
        >
          {/* ── CODE EDITOR SECTION ── */}
          <div
            style={{height: consoleOpen ? `${vPct}%` : '100%'}}
            className="flex flex-col overflow-hidden border-b border-white/8 transition-all duration-300"
          >
            {/* Editor top bar */}
            <div className="flex-shrink-0 h-10 flex items-center justify-between px-3 border-b border-white/8 bg-[#0d1117]">
              <div className="flex items-center gap-2">
                {/* Lang indicator dots */}
                <div className="flex gap-1 ml-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-[11px] font-mono text-white/30">
                  {selectedLanguage === 'javascript' ? 'solution.js' : selectedLanguage === 'java' ? 'Solution.java' : 'solution.cpp'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Mobile lang selector */}
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/5 border border-white/8 sm:hidden">
                  {languages.map(l=>(
                    <button key={l.id} onClick={()=>setSelectedLanguage(l.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedLanguage===l.id?`bg-gradient-to-r ${l.color} text-white`:'text-white/30'}`}>
                      {l.label}
                    </button>
                  ))}
                </div>

                {/* Console toggle */}
                <button onClick={() => setConsoleOpen(v => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                    consoleOpen
                      ? 'bg-violet-500/15 text-violet-400 border border-violet-500/25'
                      : 'text-white/30 hover:text-white/60 hover:bg-white/6 border border-transparent'
                  }`}
                >
                  <LayoutPanelLeft size={12} className="rotate-90" />
                  Console
                </button>
              </div>
            </div>

            {/* Monaco editor */}
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={monacoLang[selectedLanguage] || 'javascript'}
                value={codeByLanguage[selectedLanguage]}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: '"JetBrains Mono","Fira Code",monospace',
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  padding: { top: 16, bottom: 16 },
                  renderLineHighlight: 'line',
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  formatOnPaste: true,
                  bracketPairColorization: { enabled: true },
                  guides: { bracketPairs: true },
                  suggest: { preview: true },
                  scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
                }}
              />
            </div>
          </div>

          {/* ── VERTICAL DRAG HANDLE ── */}
          {consoleOpen && (
            <div
              className="h-[5px] flex-shrink-0 flex items-center justify-center cursor-row-resize group bg-transparent hover:bg-white/3 transition-colors duration-200"
              onMouseDown={vDown}
            >
              <div className="h-[1px] w-full bg-white/8 group-hover:bg-gradient-to-r group-hover:from-violet-500/50 group-hover:via-cyan-500/50 group-hover:to-pink-500/50 transition-all duration-300" />
            </div>
          )}

          {/* ── BOTTOM CONSOLE SECTION ── */}
          <AnimatePresence>
            {consoleOpen && (
              <motion.div
                initial={{height:0, opacity:0}}
                animate={{height:`${100 - vPct}%`, opacity:1}}
                exit={{height:0, opacity:0}}
                transition={{duration:0.25, ease:[0.22,1,0.36,1]}}
                className="flex-shrink-0 flex flex-col overflow-hidden bg-[#0d1117] border-t border-white/8"
              >
                {/* Console tab bar */}
                <div className="flex-shrink-0 h-9 flex items-center justify-between px-3 border-b border-white/8">
                  <TabBar
                    tabs={bottomTabs}
                    active={activeBottomTab}
                    setActive={setActiveBottomTab}
                    layoutId="bottomTab"
                  />
                  <button onClick={() => setConsoleOpen(false)}
                    className="text-[10px] text-white/25 hover:text-white/50 transition-colors px-2 py-1 rounded hover:bg-white/5">
                    ✕ Close
                  </button>
                </div>

                {/* Console content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3">
                  <AnimatePresence mode="wait">

                    {/* TEST CASES */}
                    {activeBottomTab === 'testcase' && (
                      <motion.div key="tc"
                        initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                        exit={{opacity:0,y:-4}} transition={{duration:0.2}}
                        className="space-y-3 h-full"
                      >
                        {runResult ? (
                          <>
                            {/* Status */}
                            <motion.div
                              initial={{scale:0.97,opacity:0}} animate={{scale:1,opacity:1}}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                                runResult.success
                                  ? 'bg-emerald-500/8 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
                                  : 'bg-rose-500/8   border-rose-500/20   shadow-[0_0_20px_rgba(244,63,94,0.08)]'
                              }`}
                            >
                              {runResult.success
                                ? <CheckCircle2 size={17} className="text-emerald-400 flex-shrink-0" />
                                : <XCircle      size={17} className="text-rose-400   flex-shrink-0" />}
                              <div>
                                <p className={`font-bold text-sm ${runResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {runResult.success ? 'All Test Cases Passed!' : (runResult.errormessage || 'Some tests failed')}
                                </p>
                                <p className="text-[11px] text-white/30 mt-0.5">{runResult.testcases?.length||0} cases evaluated</p>
                              </div>

                              {runResult.success && (
                                <div className="ml-auto flex gap-3">
                                  <StatChip icon={Clock}       label="Time"   value={`${runResult.runtime}s`}    accent="emerald" />
                                  <StatChip icon={MemoryStick} label="Memory" value={`${runResult.memory} KB`} accent="cyan"    />
                                </div>
                              )}
                            </motion.div>

                            {/* Individual rows */}
                            {runResult.testcases?.length > 0 && (
                              <div className="space-y-2">
                                {runResult.testcases.map((tc, i) => (
                                  <TestCaseRow key={i} tc={tc} index={i} passed={tc.status_id === 3 || runResult.success} />
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                            <motion.div
                              animate={{scale:[1,1.06,1],opacity:[0.4,0.7,0.4]}}
                              transition={{duration:3,repeat:Infinity}}
                              className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/8 to-violet-600/5 border border-white/6 mb-3"
                            >
                              <Play size={28} className="text-white/15" />
                            </motion.div>
                            <p className="text-sm font-semibold text-white/35">Run your code to see results</p>
                            <p className="text-xs mt-1 text-white/18">Ctrl + Enter to run</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* RESULT */}
                    {activeBottomTab === 'result' && (
                      <motion.div key="result"
                        initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                        exit={{opacity:0,y:-4}} transition={{duration:0.2}}
                        className="h-full"
                      >
                        {submitResult ? (
                          <div className={`p-5 rounded-2xl border space-y-5 ${
                            submitResult.accepted
                              ? 'bg-emerald-500/6 border-emerald-500/18 shadow-[0_0_40px_rgba(16,185,129,0.07)]'
                              : 'bg-rose-500/6   border-rose-500/18   shadow-[0_0_40px_rgba(244,63,94,0.07)]'
                          }`}>
                            {/* Header */}
                            <div className="flex items-center gap-4">
                              <motion.div
                                initial={{scale:0,rotate:-15}} animate={{scale:1,rotate:0}}
                                transition={{type:'spring',stiffness:260,damping:18}}
                                className={`p-3.5 rounded-xl shadow-xl ${
                                  submitResult.accepted
                                    ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/15 shadow-emerald-500/20'
                                    : 'bg-gradient-to-br from-rose-500/20 to-pink-500/15 shadow-rose-500/20'
                                }`}
                              >
                                {submitResult.accepted
                                  ? <Trophy size={28} className="text-emerald-400" />
                                  : <AlertCircle size={28} className="text-rose-400" />}
                              </motion.div>
                              <div>
                                <h2 className={`text-2xl font-black ${
                                  submitResult.accepted
                                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent'
                                    : 'text-rose-400'
                                }`}>
                                  {submitResult.accepted ? 'Accepted' : (submitResult.error || 'Wrong Answer')}
                                </h2>
                                <p className={`text-xs mt-0.5 ${submitResult.accepted ? 'text-emerald-400/50' : 'text-white/25'}`}>
                                  {submitResult.accepted
                                    ? '🎉 Great job! Problem solved.'
                                    : "Don't give up — you're almost there!"}
                                </p>
                              </div>

                              {/* Confetti */}
                              {submitResult.accepted && (
                                <div className="ml-auto flex gap-1.5">
                                  {['bg-emerald-400','bg-violet-400','bg-cyan-400','bg-pink-400','bg-amber-400'].map((c,i)=>(
                                    <motion.div key={i} className={`w-2 h-2 rounded-full ${c}`}
                                      animate={{y:[0,-10,0],opacity:[0.6,1,0.6]}}
                                      transition={{duration:1.5,repeat:Infinity,delay:i*0.15}} />
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-3">
                              <StatChip icon={CheckCircle2} label="Passed"  value={`${submitResult.passedtestcases}/${submitResult.totaltestcases}`} accent="emerald" />
                              <StatChip icon={Clock}        label="Runtime" value={`${submitResult.runtime}s`}                                        accent="cyan"    />
                              <StatChip icon={MemoryStick}  label="Memory"  value={`${submitResult.memory} KB`}                                       accent="amber"   />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                            <motion.div
                              animate={{scale:[1,1.06,1],opacity:[0.4,0.7,0.4]}}
                              transition={{duration:3,repeat:Infinity,delay:0.5}}
                              className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/8 to-pink-600/5 border border-white/6 mb-3"
                            >
                              <Send size={28} className="text-white/15" />
                            </motion.div>
                            <p className="text-sm font-semibold text-white/35">Submit your solution to see verdict</p>
                            <p className="text-xs mt-1 text-white/18">Click Submit when you're ready</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Bottom bar (Run/Submit shortcut + console toggle) when console closed ── */}
          {!consoleOpen && (
            <div className="flex-shrink-0 h-9 flex items-center justify-between px-4 border-t border-white/8 bg-[#0d1117]">
              <button onClick={() => setConsoleOpen(true)}
                className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/55 transition-colors">
                <LayoutPanelLeft size={12} className="rotate-90" />
                Open Console
              </button>
              <div className="flex items-center gap-3 text-[10px] text-white/20 font-mono">
                <span>Ctrl+Enter → Run</span>
                <span>Ctrl+Shift+Enter → Submit</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>

    {/* ── COLLABORATION MODAL ── */}
    <CollaborateModal
      isOpen={collab.isModalOpen}
      onClose={collab.closeModal}
      onCreateRoom={collab.handleCreateRoom}
      onJoinRoom={collab.handleJoinRoom}
      onLeaveRoom={collab.leaveRoom}
      roomId={collab.roomId}
      connectedUsers={collab.connectedUsers}
      mySocketId={collab.mySocketId}
      myUsername={collab.myUsername}
      isInRoom={collab.isInRoom}
      isConnecting={collab.isConnecting}
    />

    {/* ── JOIN / LEAVE TOASTS ── */}
    <CollabToast toasts={collab.toasts} />
    </>
  );
};

export default ProblemPage;