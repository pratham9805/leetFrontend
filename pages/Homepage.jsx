import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Check, Code2, LogOut, Shield, User } from "lucide-react";
import axiosClient from "../src/utils/axiosClient";
import { logoutUser } from "../src/authSlice";

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    difficulty: "all",
    tag: "all",
    status: "all",
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get(
          "/problem/getAllProblem"
        );
        setProblems(data);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get(
          "/problem/problemSolvedByUser"
        );
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

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
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

    return difficultyMatch && tagMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div data-theme="leetdark" className="min-h-screen bg-base-100">
      {/* NAVBAR */}
      <nav className="navbar bg-base-200 shadow-lg border-b border-base-300 sticky top-0 z-50 px-6">
        <div className="flex-1">
          <NavLink
            to="/"
            className="btn btn-ghost text-xl gap-2 text-primary font-bold"
          >
            <Code2 className="w-6 h-6" />
            LeetCode
          </NavLink>
        </div>

        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-ghost gap-2">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content w-8 rounded-full">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <span className="hidden sm:inline">
                {user?.firstName || "User"}
              </span>
            </div>

            <ul className="dropdown-content menu bg-base-200 rounded-lg w-52 shadow-xl border border-base-300 mt-2">
              <li>
                <button onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </li>
              {user?.role === "admin" && (
                <li>
                  <NavLink to="/admin" className="gap-2">
                    <Shield className="w-4 h-4" />
                    Admin
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
    <div className="w-full px-8 lg:px-16 py-8">
        {/* STATS SECTION */}
        <div className="stats bg-base-200 shadow-lg w-full mb-6 border border-base-300">
          <div className="stat">
            <div className="stat-title">Total Problems</div>
            <div className="stat-value text-primary">
              {problems.length}
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">Solved</div>
            <div className="stat-value text-success">
              {solvedProblems.length}
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">Completion</div>
            <div className="stat-value text-accent">
              {problems.length > 0
                ? Math.round(
                    (solvedProblems.length / problems.length) * 100
                  )
                : 0}
              %
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-row gap-4 mb-6 overflow-x-auto">
          <select
            className="select select-bordered select-sm"
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
          >
            <option value="all">All Problems</option>
            <option value="solved">Solved</option>
          </select>

          <select
            className="select select-bordered select-sm"
            value={filters.difficulty}
            onChange={(e) =>
              setFilters({
                ...filters,
                difficulty: e.target.value,
              })
            }
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            className="select select-bordered select-sm"
            value={filters.tag}
            onChange={(e) =>
              setFilters({ ...filters, tag: e.target.value })
            }
          >
            <option value="all">All Tags</option>
            <option value="array">Array</option>
            <option value="linkedList">Linked List</option>
            <option value="graph">Graph</option>
            <option value="dp">DP</option>
          </select>
        </div>

        {/* PROBLEMS LIST */}
        <div className="flex flex-col gap-3">
          {filteredProblems.map((problem, index) => {
            const isSolved = solvedProblems.some(
              (sp) => sp._id === problem._id
            );

            return (
              <motion.div
                key={problem._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <div className="card bg-base-200 border border-base-300 hover:border-primary/50 transition-all duration-200 shadow-md hover:shadow-lg">
                  <div className="card-body p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="card-title hover:text-primary transition">
                        <NavLink
                          to={`/problem/${problem._id}`}
                        >
                          {problem.title}
                        </NavLink>
                      </h2>

                      {isSolved && (
                        <div className="badge badge-success gap-1">
                          <Check className="w-3 h-3" />
                          Solved
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-1">
                      <div
                        className={`badge ${getDifficultyBadgeColor(
                          problem.difficulty
                        )}`}
                      >
                        {problem.difficulty}
                      </div>

                      <div className="badge badge-info badge-outline">
                        {problem.tags}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredProblems.length === 0 && (
            <div className="text-center py-16 opacity-60">
              No problems found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "badge-success";
    case "medium":
      return "badge-warning";
    case "hard":
      return "badge-error";
    default:
      return "badge-neutral";
  }
};

export default Homepage;
