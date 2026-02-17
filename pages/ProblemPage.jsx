import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../src/utils/axiosClient"
import SubmissionHistory from '../src/components/SubmissionHistory';
import ChatAI from '../src/components/ChatAI';


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
  let {problemId}  = useParams();

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        
        const initialCode = response.data?.startcode.find((sc) => {
        
          console.log(response.data.startcode)

        if (sc.language == "c++" && selectedLanguage == 'cpp')
        return true;
        else if (sc.language == "java" && selectedLanguage == 'java')
        return true;
        else if (sc.language == "javascript" && selectedLanguage == 'javascript')
        return true;

        return false;
        })?.initialCode || 'Hello';

        console.log("initial"+initialCode);
        setProblem(response.data);
        
        console.log(response.data);
        

        console.log(initialCode);
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
      const initialCode = problem?.startcode?.find(sc => sc.language === selectedLanguage||sc.language == "c++" && selectedLanguage == 'cpp')?.initialcode || '';
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
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading && !problem) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-linear-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-r from-indigo-500/20 to-violet-500/20 blur-3xl rounded-full"></div>
          <div className="relative flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm font-medium">Loading problem...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-linear-to-br from-slate-900 via-gray-900 to-slate-800 overflow-hidden">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-50 px-6 py-3 border-b border-white/5 backdrop-blur-md bg-slate-900/50">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {problem && (
              <>
                <h2 className="text-lg font-semibold text-white">{problem.title}</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  problem.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-300' :
                  problem.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className={`px-5 py-2 rounded-xl font-medium transition-all duration-300 ${
                loading 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-gray-200 hover:text-white hover:scale-105'
              }`}
              onClick={handleRun}
              disabled={loading}
            >
              {loading ? 'Running...' : 'Run'}
            </button>
            <button
              className={`px-5 py-2 rounded-xl font-medium transition-all duration-300 ${
                loading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105'
              }`}
              onClick={handleSubmitCode}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-1 px-6 py-4 border-b border-white/5 bg-white/3">
            {['description', 'editorial', 'solutions', 'submissions','ChatAI'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveLeftTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeLeftTab === tab
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {problem && (
              <>
                {activeLeftTab === 'description' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      {problem.tags && (
                        <div className="px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full text-xs text-violet-300 font-semibold">
                          {problem.tags}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-300">Description</h3>
                      <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                        {problem.description}
                      </p>
                    </div>

                    {problem?.visibletestcases && problem.visibletestcases.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-300">Examples</h3>
                        {problem.visibletestcases.map((example, index) => (
                          <div key={index} className="p-4 rounded-xl bg-linear-to-br from-white/5 to-white/3 border border-white/10 hover:border-white/20 transition-all duration-200">
                            <h4 className="font-semibold text-gray-300 mb-3">Example {index + 1}</h4>
                            <div className=" font-mono text-xs text-gray-400 space-y-2">
                              <div className="flex gap-3">
                                <span className="text-indigo-400 font-semibold w-20">Input:</span>
                                <span className="text-gray-300">{example.input}</span>
                              </div>
                             
                              <div className="flex gap-3">
                                <span className="text-emerald-400 font-semibold w-20">Output:</span>
                                <span className="text-gray-300">{example.output}</span>
                              </div>
                              <div className="flex gap-3">
                                <span className="text-violet-400 font-semibold w-20">Explain:</span>
                                <span className="text-gray-300">{example.explanation}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeLeftTab === 'editorial' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-300">Editorial</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">Editorial is here for the problem</p>
                  </div>
                )}

                {activeLeftTab === 'solutions' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-300">Solutions</h3>
                    {problem?.referencesolution && problem?.referencesolution.length > 0 ? (
                      <div className="space-y-4">
                        {problem.referencesolution?.map((solution, index) => (
                          <div key={index} className="rounded-xl overflow-hidden border border-white/10 bg-white/3">
                            <div className="px-4 py-3 bg-indigo-600/20 border-b border-white/10">
                              <h4 className="font-semibold text-indigo-300 text-sm">{solution?.language}</h4>
                            </div>
                            <pre className="p-4 text-xs text-gray-300 font-mono overflow-x-auto">
                              <code>{solution?.completecode}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Solutions will be available after you solve the problem.</p>
                    )}
                  </div>
                )}

                {activeLeftTab === 'submissions' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-300">My Submissions</h3>
                    <SubmissionHistory problemId={problemId}/>
                  </div>
                )}

                {activeLeftTab === 'ChatAI' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-300">Chat with AI</h3>
                    <p>Chat with AI Here</p>
                      <ChatAI problem={problem}></ChatAI>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-1 px-6 py-4 border-b border-white/5 bg-white/3">
            {['code', 'testcase', 'result'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveRightTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeRightTab === tab
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeRightTab === 'code' && (
              <div className="flex-1 flex flex-col">
                {/* Language Selector */}
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                  <div className="flex gap-2">
                    {['javascript', 'java', 'cpp'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                          selectedLanguage === lang
                            ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JS' : 'Java'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 overflow-hidden">
                  <Editor
                    height="100%"
                    language={getLanguageForMonaco(selectedLanguage)}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      glyphMargin: false,
                      folding: true,
                      lineDecorationsWidth: 10,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: 'line',
                      selectOnLineNumbers: true,
                      roundedSelection: false,
                      readOnly: false,
                      cursorStyle: 'line',
                      mouseWheelZoom: true,
                    }}
                  />
                </div>
              </div>
            )}

            {activeRightTab === 'testcase' && (
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                <h3 className="font-semibold text-gray-300">Test Results</h3>
                {runResult ? (
                  <div className={`space-y-4 p-4 rounded-xl border transition-all duration-300 ${
                    runResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className={`font-semibold ${runResult.success ? 'text-emerald-300' : 'text-red-300'}`}>
                      {runResult.success ? '✅ All test cases passed!' : '❌ Error'}
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      {runResult.success && (
                        <>
                          <div className="flex gap-4">
                            <span className="text-gray-400">Runtime:</span>
                            <span>{runResult.runtime} sec</span>
                          </div>
                          <div className="flex gap-4">
                            <span className="text-gray-400">Memory:</span>
                            <span>{runResult.memory} KB</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="space-y-3 mt-4">
                      {(runResult.testcases || []).map((tc, i) => (
                        <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs font-mono space-y-1">
                          <div className="text-indigo-300">
                            <strong>Input:</strong> {tc.stdin}
                          </div>
                          <div className="text-gray-400">
                            <strong>Expected:</strong> {tc.expected_output}
                          </div>
                          <div className="text-gray-400">
                            <strong>Output:</strong> {tc.stdout}
                          </div>
                          <div className={tc.status_id === 3 || runResult.success ? 'text-emerald-300 font-semibold' : 'text-red-300 font-semibold'}>
                            {tc.status_id === 3 || runResult.success ? '✓ Passed' : '✗ Failed'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Click "Run" to test your code with the example test cases.</p>
                )}
              </div>
            )}

            {activeRightTab === 'result' && (
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                <h3 className="font-semibold text-gray-300">Submission Result</h3>
                {submitResult ? (
                  <div className={`space-y-4 p-4 rounded-xl border transition-all duration-300 ${
                    submitResult.accepted
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className={`font-bold text-lg ${submitResult.accepted ? 'text-emerald-300' : 'text-red-300'}`}>
                      {submitResult.accepted ? '🎉 Accepted' : `❌ ${submitResult.error}`}
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex gap-4">
                        <span className="text-gray-400">Test Cases Passed:</span>
                        <span>{submitResult?.passedtestcases}/{submitResult?.totaltestcases}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-gray-400">Runtime:</span>
                        <span>{submitResult.runtime} sec</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-gray-400">Memory:</span>
                        <span>{submitResult.memory} KB</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Click "Submit" to submit your solution for evaluation.</p>
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
