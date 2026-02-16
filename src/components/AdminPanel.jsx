import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router"; // Changed to react-router-dom and added BrowserRouter
import { Plus, Trash2, Code2, Layers, FlaskConical, Save } from "lucide-react";
import axiosClient from "../utils/axiosClient";

// --- Zod Schema (UNTOUCHED) ---
const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.enum(["array", "linkedList", "graph", "dp"]),
  visibletestcases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
        explanation: z.string().min(1, "Explanation is required"),
      }),
    )
    .min(1, "At least one visible test case required"),
  hiddentestcases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
      }),
    )
    .min(1, "At least one hidden test case required"),
  startcode: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "JavaScript"]),
        initialcode: z.string().min(1, "Initial code is required"),
      }),
    )
    .length(3, "All three languages required"),
  referencesolution: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "JavaScript"]),
        completecode: z.string().min(1, "Complete code is required"),
      }),
    )
    .length(3, "All three languages required"),
});

// Moved the main logic to a child component to be wrapped by Router
function ProblemCreateForm() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startcode: [
        { language: "C++", initialcode: "" },
        { language: "Java", initialcode: "" },
        { language: "JavaScript", initialcode: "" },
      ],
      referencesolution: [
        { language: "C++", completecode: "" },
        { language: "Java", completecode: "" },
        { language: "JavaScript", completecode: "" },
      ],
    },
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
  } = useFieldArray({
    control,
    name: "visibletestcases",
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({
    control,
    name: "hiddentestcases",
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post("/problem/create", data);
      console.log(data);
      alert("Problem created successfully!");
      navigate("/");
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // --- UI HELPER COMPONENTS ---

  const GlassCard = ({
    children,
    className = "",
    title,
    icon: Icon,
    gradient,
  }) => (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gray-900/40 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-purple-500/10 ${className}`}
    >
      {/* Top Gradient Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}
      />

      <div className="p-6 md:p-8">
        {title && (
          <div className="flex items-center gap-3 mb-8">
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10 shadow-lg`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {title}
            </h2>
          </div>
        )}
        {children}
      </div>
    </div>
  );

  const InputLabel = ({ label, error }) => (
    <div className="flex justify-between mb-2 ml-1">
      <label className="text-sm font-medium text-gray-300 tracking-wide">
        {label}
      </label>
      {error && (
        <span className="text-xs font-bold text-rose-400 animate-pulse">
          {error}
        </span>
      )}
    </div>
  );

  const GlassInput = ({ registerProps, placeholder, type = "text", error }) => (
    <input
      type={type}
      {...registerProps}
      placeholder={placeholder}
      className={`w-full bg-black/20 border ${error ? "border-rose-500/50 focus:border-rose-500" : "border-white/10 focus:border-purple-500"} 
      rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300`}
    />
  );

  const GlassSelect = ({ registerProps, options, error }) => (
    <div className="relative">
      <select
        {...registerProps}
        className={`w-full appearance-none bg-black/20 border ${error ? "border-rose-500/50" : "border-white/10"} 
        rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-gray-900">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0c29] bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-4 md:p-8 font-sans selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Header */}
        <div className="text-center py-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
          <h1 className="relative text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 tracking-tight mb-2">
            Problem Architect
          </h1>
          <p className="text-gray-400 text-lg">
            Design the next great challenge.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.tagName === "INPUT") {
              e.preventDefault();
            }
          }}
          className="space-y-8"
        >
          {/* Section 1: Basic Information */}
          <GlassCard
            title="Problem Metadata"
            icon={Layers}
            gradient="from-cyan-500 to-blue-500"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <InputLabel
                    label="Problem Title"
                    error={errors.title?.message}
                  />
                  <GlassInput
                    registerProps={register("title")}
                    placeholder="e.g., Two Sum"
                    error={errors.title}
                  />
                </div>

                <div>
                  <InputLabel
                    label="Problem Description"
                    error={errors.description?.message}
                  />
                  <textarea
                    {...register("description")}
                    placeholder="Describe the problem, constraints, and requirements..."
                    className={`w-full h-40 bg-black/20 border ${errors.description ? "border-rose-500/50" : "border-white/10"} 
                    rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 resize-none`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <InputLabel
                    label="Difficulty Level"
                    error={errors.difficulty?.message}
                  />
                  <GlassSelect
                    registerProps={register("difficulty")}
                    options={[
                      { value: "easy", label: "🟢 Easy" },
                      { value: "medium", label: "🟡 Medium" },
                      { value: "hard", label: "🔴 Hard" },
                    ]}
                    error={errors.difficulty}
                  />
                </div>
                <div>
                  <InputLabel
                    label="Algorithm Tag"
                    error={errors.tags?.message}
                  />
                  <GlassSelect
                    registerProps={register("tags")}
                    options={[
                      { value: "array", label: "Array" },
                      { value: "linkedList", label: "Linked List" },
                      { value: "graph", label: "Graph" },
                      { value: "dp", label: "Dynamic Programming" },
                    ]}
                    error={errors.tags}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Section 2: Test Cases */}
          <GlassCard
            title="Test Suite"
            icon={FlaskConical}
            gradient="from-pink-500 to-rose-500"
          >
            {/* Visible Cases */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-pink-200">
                  Public Test Cases
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    appendVisible({ input: "", output: "", explanation: "" })
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 border border-pink-500/30 rounded-lg transition-all active:scale-95"
                >
                  <Plus size={16} /> Add Case
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {visibleFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="group relative bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => removeVisible(index)}
                      className="absolute top-4 right-4 p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>

                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-10"> */}
                 <div>
  <InputLabel label={`Input #${index + 1}`} />
  <textarea
    {...register(`visibletestcases.${index}.input`)}
    rows={4}
    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 
    text-gray-100 focus:outline-none focus:border-pink-500 
    focus:ring-2 focus:ring-pink-500/20 resize-none transition-all"
  />
</div>

<div>
  <InputLabel label="Expected Output" />
  <textarea
    {...register(`visibletestcases.${index}.output`)}
    rows={4}
    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 
    text-gray-100 focus:outline-none focus:border-pink-500 
    focus:ring-2 focus:ring-pink-500/20 resize-none transition-all"
  />
</div>

                    <div>
                      <InputLabel label="Explanation" />
                      <textarea
                        {...register(`visibletestcases.${index}.explanation`)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-pink-500/50 h-20 resize-none"
                        placeholder="Why is this the output?"
                      />
                    </div>
                  </div>
                ))}
                {errors.visibletestcases && errors.visibletestcases.message && (
                  <p className="text-rose-400 text-sm mt-2">
                    {errors.visibletestcases.message}
                  </p>
                )}
              </div>
            </div>

            {/* Hidden Cases */}
            <div>
              <div className="flex justify-between items-center mb-6 border-t border-white/10 pt-8">
                <h3 className="text-lg font-semibold text-purple-200">
                  Hidden Evaluation Cases
                </h3>
                <button
                  type="button"
                  onClick={() => appendHidden({ input: "", output: "" })}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/30 rounded-lg transition-all active:scale-95"
                >
                  <Plus size={16} /> Add Hidden Case
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                {hiddenFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative bg-black/20 border border-white/5 rounded-2xl p-4 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-mono text-gray-500">
                        CASE_ID_{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeHidden(index)}
                        className="text-gray-600 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <textarea
  {...register(`hiddentestcases.${index}.input`)}
  placeholder="Input"
  rows={4}
  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 
  text-sm text-gray-300 focus:outline-none focus:border-purple-500 
  focus:ring-2 focus:ring-purple-500/20 resize-none font-mono transition-all"
/>

<textarea
  {...register(`hiddentestcases.${index}.output`)}
  placeholder="Output"
  rows={4}
  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 
  text-sm text-gray-300 focus:outline-none focus:border-purple-500 
  focus:ring-2 focus:ring-purple-500/20 resize-none font-mono transition-all"
/>

                  </div>
                ))}
              </div>
              {errors.hiddentestcases && errors.hiddentestcases.message && (
                <p className="text-rose-400 text-sm mt-2">
                  {errors.hiddentestcases.message}
                </p>
              )}
            </div>
          </GlassCard>

          {/* Section 3: Code Templates */}
          <GlassCard
            title="Code Implementations"
            icon={Code2}
            gradient="from-emerald-500 to-teal-500"
          >
            <div className="space-y-8">
              {[0, 1, 2].map((index) => {
                const lang =
                  index === 0 ? "C++" : index === 1 ? "Java" : "JavaScript";
                const langColor =
                  index === 0
                    ? "text-blue-400"
                    : index === 1
                      ? "text-orange-400"
                      : "text-yellow-400";

                return (
                  <div
                    key={index}
                    className="bg-black/30 rounded-2xl border border-white/5 overflow-hidden"
                  >
                    <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                      <span
                        className={`ml-4 font-mono text-sm font-bold ${langColor}`}
                      >
                        {lang} Config
                      </span>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider font-bold text-gray-500">
                          Boilerplate Code
                        </label>
                        <textarea
                          {...register(`startcode.${index}.initialcode`)}
                          className="w-full bg-[#0d1117] text-gray-300 font-mono text-sm p-4 rounded-xl border border-white/5 focus:border-emerald-500/50 focus:outline-none h-64 resize-none"
                          spellCheck="false"
                        />
                        {errors.startcode?.[index]?.initialcode && (
                          <span className="text-rose-500 text-xs">
                            {errors.startcode[index].initialcode.message}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider font-bold text-gray-500">
                          Reference Solution
                        </label>
                        <textarea
                          {...register(
                            `referencesolution.${index}.completecode`,
                          )}
                          className="w-full bg-[#0d1117] text-gray-300 font-mono text-sm p-4 rounded-xl border border-white/5 focus:border-teal-500/50 focus:outline-none h-64 resize-none"
                          spellCheck="false"
                        />
                        {errors.referencesolution?.[index]?.completecode && (
                          <span className="text-rose-500 text-xs">
                            {
                              errors.referencesolution[index].completecode
                                .message
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.startcode &&
              typeof errors.startcode.message === "string" && (
                <p className="text-rose-400 text-sm mt-4">
                  {errors.startcode.message}
                </p>
              )}
          </GlassCard>

          {/* Submit Action */}
          <div className="pt-8">
            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-1 shadow-2xl transition-all hover:scale-[1.01] hover:shadow-purple-500/50 active:scale-[0.99]"
            >
              <div className="relative flex items-center justify-center gap-3 rounded-xl bg-gray-900/10 px-8 py-5 transition-all group-hover:bg-transparent">
                <span className="text-xl font-bold text-white tracking-wide">
                  Deploy Problem
                </span>
                <Save className="w-5 h-5 text-white" />
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- APP ENTRY POINT ---
// This wrapper is essential to provide the Router context for useNavigate()
function App() {
  return <ProblemCreateForm />;
}

export default App;
