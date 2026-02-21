import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../src/utils/axiosClient";
import SubmissionHistory from '../src/components/SubmissionHistory';
import ChatAI from '../src/components/ChatAI';
import { 
  FileText, 
  PenTool, 
  Lightbulb, 
  History, 
  Bot, 
  Code2, 
  Terminal, 
  CheckCircle2, 
  Play, 
  Send,
  Loader2,
  Cpu
} from 'lucide-react';

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        
        const initialCode = response.data?.startcode.find((sc) => {
          if (sc.language === "c++" && selectedLanguage === 'cpp') return true;
          else if (sc.language === "java" && selectedLanguage === 'java') return true;
          else if (sc.language === "javascript" && selectedLanguage === 'javascript') return true;
          return false;
        })?.initialcode || 'Hello';
        console.log("Initial: "+ initialCode)

        setProblem(response.data);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const initialCode = problem?.startcode?.find(sc => 
        (sc.language === selectedLanguage) || (sc.language === "c++" && selectedLanguage === 'cpp')
      )?.initialcode || '';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
        const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code:code,
        language: selectedLanguage
      });

       setSubmitResult(response.data);
       setLoading(false);
       setActiveRightTab('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'hard': return 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  if (loading && !problem) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950">
        <div className="relative flex flex-col items-center gap-4">
           {/* Colorful loader background */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 blur-3xl rounded-full animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin relative z-10" />
          <p className="text-zinc-400 text-sm font-medium tracking-widest uppercase animate-pulse">Initializing Environment...</p>
        </div>
      </div>
    );
  }

  // Icons mapping for tabs
  const tabIcons = {
    description: <FileText size={16} />,
    editorial: <PenTool size={16} />,
    solutions: <Lightbulb size={16} />,
    submissions: <History size={16} />,
    ChatAI: <Bot size={16} />
  };

  const rightTabIcons = {
    code: <Code2 size={16} />,
    testcase: <Terminal size={16} />,
    result: <CheckCircle2 size={16} />
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Vibrant Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-sky-500/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-50 px-6 py-3 border-b border-white/5 backdrop-blur-xl bg-black/40">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {problem && (
              <>
                <h2 className="text-xl font-bold bg-linear-to-r from-blue-200 via-indigo-200 to-fuchsia-200 bg-clip-text text-transparent">
                  {problem.title}
                </h2>
                <div className={`px-3 py-0.5 rounded-full border text-xs font-medium uppercase tracking-wider ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </div>
              </>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              className={`group flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all duration-300 shadow-lg ${
                loading 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5' 
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5'
              }`}
              onClick={handleRun}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} className="fill-current" />}
              <span>Run</span>
            </button>
            
            <button
              className={`group flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all duration-300 shadow-lg ${
                loading
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-fuchsia-500/20 hover:shadow-fuchsia-500/40 hover:-translate-y-0.5'
              }`}
              onClick={handleSubmitCode}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              <span>Submit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden relative z-10">
        
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 flex flex-col rounded-xl border border-white/5 bg-zinc-900/60 backdrop-blur-md shadow-2xl overflow-hidden group/left relative">
          {/* Subtle colored border on top */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50"></div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-2 py-2 border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar">
            {['description', 'editorial', 'solutions', 'submissions', 'ChatAI'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveLeftTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeLeftTab === tab
                    ? 'bg-indigo-500/10 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.1)] border border-indigo-500/20'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                {tabIcons[tab]}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            {problem && (
              <>
                {activeLeftTab === 'description' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3">
                      {problem.tags && (
                        <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-300 font-mono shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                          #{problem.tags}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <FileText className="text-indigo-400" size={20}/> Description
                      </h3>
                      <div className="text-zinc-300 text-sm leading-7 whitespace-pre-wrap font-light tracking-wide">
                        {problem.description}
                      </div>
                    </div>

                    {problem?.visibletestcases && problem.visibletestcases.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Examples</h3>
                        {problem.visibletestcases.map((example, index) => (
                          <div key={index} className="group relative p-5 rounded-xl bg-black/30 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]">
                            <div className="absolute top-4 right-4 text-xs font-mono text-zinc-600">Case {index + 1}</div>
                            <div className="font-mono text-sm space-y-4">
                              <div className="space-y-1">
                                <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Input</span>
                                <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5 text-zinc-300 group-hover:border-white/10 transition-colors">
                                  {example.input}
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Output</span>
                                <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5 text-white group-hover:border-white/10 transition-colors">
                                  {example.output}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Explanation</span>
                                <p className="text-zinc-400 text-xs italic">{example.explanation}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeLeftTab === 'editorial' && (
                   <div className="space-y-4 animate-in fade-in duration-500">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2"><PenTool className="text-fuchsia-400" size={18}/> Editorial</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed p-4 bg-white/5 rounded-xl border border-white/5">Editorial is here for the problem</p>
                  </div>
                )}

                {activeLeftTab === 'solutions' && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Lightbulb className="text-amber-400" size={18}/> Solutions</h3>
                    {problem?.referencesolution && problem?.referencesolution.length > 0 ? (
                      <div className="space-y-6">
                        {problem.referencesolution?.map((solution, index) => (
                          <div key={index} className="rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-lg">
                            <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                              <span className="font-mono text-xs text-white bg-indigo-600/30 border border-indigo-500/30 px-2 py-1 rounded">{solution?.language}</span>
                              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Reference</span>
                            </div>
                            <pre className="p-4 text-xs text-zinc-300 font-mono overflow-x-auto custom-scrollbar">
                              <code>{solution?.completecode}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-zinc-500 gap-2 border border-dashed border-zinc-800 rounded-xl">
                        <Lightbulb size={32} className="opacity-20" />
                        <p className="text-sm">Solutions locked until solved.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeLeftTab === 'submissions' && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2"><History className="text-sky-400" size={18}/> My Submissions</h3>
                    <SubmissionHistory problemId={problemId}/>
                  </div>
                )}

                {activeLeftTab === 'ChatAI' && (
                  <div className="h-full flex flex-col animate-in fade-in duration-500">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><Bot className="text-indigo-400" size={18}/> AI Assistant</h3>
                      <div className="flex-1 bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                        <ChatAI problem={problem}></ChatAI>
                      </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col rounded-xl border border-white/5 bg-zinc-900/60 backdrop-blur-md shadow-2xl overflow-hidden relative">
          {/* Subtle colored border on top */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50"></div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-2 py-2 border-b border-white/5 bg-black/20">
            {['code', 'testcase', 'result'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveRightTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeRightTab === tab
                    ? 'bg-blue-500/10 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.1)] border border-blue-500/20'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                {rightTabIcons[tab]}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {activeRightTab === 'code' && (
              <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                {/* Language Selector */}
                <div className="px-4 py-3 border-b border-white/5 bg-black/20 flex justify-end items-center gap-3">
                  <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Language:</span>
                  <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                    {['javascript', 'java', 'cpp'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                          selectedLanguage === lang
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 overflow-hidden pt-2">
                  <Editor
                    height="100%"
                    language={getLanguageForMonaco(selectedLanguage)}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      padding: { top: 16, bottom: 16 },
                      renderLineHighlight: 'all', // enhanced highlight
                      smoothScrolling: true,
                      cursorBlinking: 'smooth',
                      cursorSmoothCaretAnimation: 'on',
                      formatOnPaste: true,
                    }}
                  />
                </div>
              </div>
            )}

            {activeRightTab === 'testcase' && (
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 custom-scrollbar">
                <h3 className="font-semibold text-white flex items-center gap-2"><Terminal className="text-sky-400" size={18}/> Execution Results</h3>
                {runResult ? (
                  <div className={`space-y-4 p-5 rounded-xl border-l-4 backdrop-blur-sm transition-all duration-300 ${
                    runResult.success
                      ? 'bg-emerald-500/5 border-l-emerald-500 border-y border-r border-white/5 shadow-[0_0_30px_rgba(16,185,129,0.05)]'
                      : 'bg-red-500/5 border-l-red-500 border-y border-r border-white/5 shadow-[0_0_30px_rgba(239,68,68,0.05)]'
                  }`}>
                    <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                      {runResult.success ? <CheckCircle2 className="text-emerald-400" /> : <div className="text-red-400 text-xl">✕</div>}
                      <span className={`font-semibold text-lg ${runResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                        {runResult.success ? 'All Test Cases Passed' : 'Execution Error'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {runResult.success && (
                        <>
                          <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col hover:bg-white/10 transition-colors">
                            <span className="text-zinc-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><Loader2 size={10}/> Runtime</span>
                            <span className="text-emerald-300 font-mono">{runResult.runtime}s</span>
                          </div>
                          <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col hover:bg-white/10 transition-colors">
                            <span className="text-zinc-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><Cpu size={10}/> Memory</span>
                            <span className="text-emerald-300 font-mono">{runResult.memory}KB</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-3 mt-4">
                      {(runResult.testcases || []).map((tc, i) => (
                        <div key={i} className="group p-4 bg-black/40 border border-white/5 rounded-lg text-xs font-mono space-y-3 hover:border-white/20 transition-colors">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-zinc-500">Case {i + 1}</span>
                                <span className={tc.status_id === 3 || runResult.success ? 'text-emerald-400' : 'text-red-400'}>
                                {tc.status_id === 3 || runResult.success ? '✓ Passed' : '✗ Failed'}
                                </span>
                            </div>
                          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                             <span className="text-zinc-500 text-right">Input:</span>
                             <span className="text-zinc-300">{tc.stdin}</span>
                             
                             <span className="text-zinc-500 text-right">Expected:</span>
                             <span className="text-emerald-400/80">{tc.expected_output}</span>
                             
                             <span className="text-zinc-500 text-right">Actual:</span>
                             <span className={tc.status_id === 3 || runResult.success ? 'text-zinc-300' : 'text-red-300'}>{tc.stdout}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-zinc-600 border border-dashed border-zinc-800 rounded-xl bg-black/20">
                    <Play size={40} className="mb-4 opacity-50" />
                    <p className="text-sm">Run your code to see output here.</p>
                  </div>
                )}
              </div>
            )}

            {activeRightTab === 'result' && (
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 custom-scrollbar">
                 <h3 className="font-semibold text-white flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={18}/> Submission Status</h3>
                {submitResult ? (
                   <div className={`space-y-6 p-6 rounded-xl border-l-4 backdrop-blur-sm transition-all duration-500 ${
                    submitResult.accepted
                      ? 'bg-emerald-500/5 border-l-emerald-500 border-y border-r border-white/5 shadow-[0_0_40px_rgba(16,185,129,0.1)]'
                      : 'bg-red-500/5 border-l-red-500 border-y border-r border-white/5 shadow-[0_0_40px_rgba(239,68,68,0.1)]'
                  }`}>
                    <div className="text-center space-y-2">
                        <div className={`inline-flex p-3 rounded-full mb-2 ${submitResult.accepted ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'}`}>
                             {submitResult.accepted ? <CheckCircle2 size={32} /> : <div className="text-3xl">✕</div>}
                        </div>
                        <h2 className={`text-2xl font-bold ${submitResult.accepted ? 'text-white' : 'text-red-400'}`}>
                        {submitResult.accepted ? 'Accepted' : submitResult.error}
                        </h2>
                        {submitResult.accepted && <p className="text-emerald-400/80 text-sm">Nicely done! You solved the problem.</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-center hover:bg-white/5 transition-colors">
                            <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Passed</span>
                            <span className="block text-xl font-mono text-white">{submitResult?.passedtestcases}/{submitResult?.totaltestcases}</span>
                        </div>
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-center hover:bg-white/5 transition-colors">
                             <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Runtime</span>
                            <span className="block text-xl font-mono text-white">{submitResult.runtime}s</span>
                        </div>
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-center hover:bg-white/5 transition-colors">
                             <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Memory</span>
                            <span className="block text-xl font-mono text-white">{submitResult.memory}KB</span>
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-zinc-600 border border-dashed border-zinc-800 rounded-xl bg-black/20">
                    <Send size={40} className="mb-4 opacity-50" />
                    <p className="text-sm">Submit your code to get the verdict.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;