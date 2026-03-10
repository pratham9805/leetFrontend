    import { useEffect, useState } from "react";
    import { useParams, useNavigate } from "react-router";
    import axiosClient from "../utils/axiosClient";

    function ProblemUpdate() {

    const { id } = useParams();
    
    const navigate = useNavigate();

    const [problem, setProblem] = useState({
        title: "",
        description: "",
        difficulty: "easy",
        tags: "",
        visibletestcases: [],
        hiddentestcases: [],
        startcode: [],
        referencesolution: [],
        problemcreator: ""
    });

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const fetchProblem = async () => {

        try {

            const { data } = await axiosClient.get(
            `/problem/problemById/${id}`
            );
            console.log(data)
            setProblem(data);

            setLoading(false);

        } catch (error) {

            console.error("Error fetching problem", error);

        }

        };

        fetchProblem();

    }, [id]);


    const handleChange = (e) => {

        const { name, value } = e.target;

        setProblem((prev) => ({
        ...prev,
        [name]: value
        }));

    };


    const handleTestCaseChange = (index, field, value, type) => {

        const updated = [...problem[type]];
        updated[index][field] = value;

        setProblem((prev) => ({
        ...prev,
        [type]: updated
        }));

    };


    const handleAddTestCase = (type) => {

        setProblem((prev) => ({
        ...prev,
        [type]: [...prev[type], { input: "", output: "", explanation: "" }]
        }));

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

        await axiosClient.put(
            `/problem/update/${id}`,
            problem
        );

        alert("Problem updated successfully");

        navigate("/admin");

        } catch (error) {

        console.error("Update failed", error);

        }

    };


    if (loading) return <div className="p-6">Loading...</div>;


   return (
  <div className="min-h-screen bg-slate-950 pb-12 text-slate-300">

    {/* TOP BAR */}
    <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        <div className="flex items-center gap-4">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            ←
          </button>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Update Problem
            </h1>
            <p className="text-sm text-slate-400">
              ID: {id}
            </p>
          </div>

        </div>

      </div>
    </div>


    <div className="max-w-5xl mx-auto mt-8 px-6">

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* BASIC INFO */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-lg font-bold text-white mb-5">
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-semibold">
                Title
              </label>

              <input
                type="text"
                name="title"
                value={problem.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-semibold">
                Difficulty
              </label>

              <select
                name="difficulty"
                value={problem.difficulty}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-semibold">
                Tags
              </label>

              <input
                name="tags"
                value={problem.tags}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-semibold">
                Description
              </label>

              <textarea
                name="description"
                value={problem.description}
                onChange={handleChange}
                className="w-full min-h-[200px] rounded-xl border border-slate-700 bg-slate-950 px-4 py-2"
              />
            </div>

          </div>

        </section>


        {/* VISIBLE TESTCASES */}
        <section className="rounded-2xl border border-emerald-900/50 bg-slate-900 p-6">

          <h2 className="text-lg font-bold text-white mb-5">
            Visible Testcases
          </h2>

          {problem.visibletestcases.map((tc, index) => (

            <div key={index} className="mb-4 border border-slate-700 p-4 rounded-xl">

              <label className="text-sm font-semibold">Input</label>
              <input
                className="w-full mb-2 border border-slate-700 bg-slate-950 rounded-lg px-3 py-2"
                value={tc.input}
                onChange={(e) =>
                  handleTestCaseChange(index, "input", e.target.value, "visibletestcases")
                }
              />

              <label className="text-sm font-semibold">Output</label>
              <input
                className="w-full mb-2 border border-slate-700 bg-slate-950 rounded-lg px-3 py-2"
                value={tc.output}
                onChange={(e) =>
                  handleTestCaseChange(index, "output", e.target.value, "visibletestcases")
                }
              />

              <label className="text-sm font-semibold">Explanation</label>
              <input
                className="w-full border border-slate-700 bg-slate-950 rounded-lg px-3 py-2"
                value={tc.explanation}
                onChange={(e) =>
                  handleTestCaseChange(index, "explanation", e.target.value, "visibletestcases")
                }
              />

            </div>

          ))}

          <button
            type="button"
            onClick={() => handleAddTestCase("visibletestcases")}
            className="mt-3 px-4 py-2 border border-emerald-500 text-emerald-400 rounded-lg"
          >
            Add Visible Testcase
          </button>

        </section>


        {/* HIDDEN TESTCASES */}
        <section className="rounded-2xl border border-rose-900/50 bg-slate-900 p-6">

          <h2 className="text-lg font-bold text-white mb-5">
            Hidden Testcases
          </h2>

          {problem?.hiddentestcases?.map((tc, index) => (

            <div key={index} className="mb-4 border border-slate-700 p-4 rounded-xl">

              <label className="text-sm font-semibold">Input</label>
              <input
                className="w-full mb-2 border border-slate-700 bg-slate-950 rounded-lg px-3 py-2"
                value={tc.input}
                onChange={(e) =>
                  handleTestCaseChange(index, "input", e.target.value, "hiddentestcases")
                }
              />

              <label className="text-sm font-semibold">Output</label>
              <input
                className="w-full border border-slate-700 bg-slate-950 rounded-lg px-3 py-2"
                value={tc.output}
                onChange={(e) =>
                  handleTestCaseChange(index, "output", e.target.value, "hiddentestcases")
                }
              />

            </div>

          ))}

          <button
            type="button"
            onClick={() => handleAddTestCase("hiddentestcases")}
            className="mt-3 px-4 py-2 border border-rose-500 text-rose-400 rounded-lg"
          >
            Add Hidden Testcase
          </button>

        </section>


        {/* START CODE */}
        <section className="rounded-2xl border border-amber-900/50 bg-slate-900 p-6">

          <h2 className="text-lg font-bold text-white mb-5">
            Starter Code
          </h2>

          {problem.startcode.map((code, index) => (

            <div key={index} className="mb-6">

              <label className="font-semibold text-amber-400">
                {code.language}
              </label>

              <textarea
                className="w-full mt-2 min-h-[150px] bg-[#0d1117] font-mono border border-slate-700 rounded-xl p-3"
                value={code.initialcode}
                onChange={(e) => {

                  const updated = [...problem.startcode];
                  updated[index].initialcode = e.target.value;

                  setProblem((prev) => ({
                    ...prev,
                    startcode: updated
                  }));

                }}
              />

            </div>

          ))}

        </section>


        {/* REFERENCE SOLUTION */}
        <section className="rounded-2xl border border-cyan-900/50 bg-slate-900 p-6">

          <h2 className="text-lg font-bold text-white mb-5">
            Reference Solution
          </h2>

          {problem.referencesolution.map((sol, index) => (

            <div key={index} className="mb-6">

              <label className="font-semibold text-cyan-400">
                {sol.language}
              </label>

              <textarea
                className="w-full mt-2 min-h-[200px] bg-[#0d1117] font-mono border border-slate-700 rounded-xl p-3"
                value={sol.completecode}
                onChange={(e) => {

                  const updated = [...problem.referencesolution];
                  updated[index].completecode = e.target.value;

                  setProblem((prev) => ({
                    ...prev,
                    referencesolution: updated
                  }));

                }}
              />

            </div>

          ))}

        </section>


        {/* UPDATE BUTTON */}
        <div className="flex justify-end">

          <button
            type="submit"
            className="px-10 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl"
          >
            Update Problem
          </button>

        </div>

      </form>

    </div>

  </div>
);
    }

    export default ProblemUpdate;