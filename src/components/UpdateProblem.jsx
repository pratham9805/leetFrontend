import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";

const UpdateProblemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "",
    tags: "",
    visibletestcases: [],
    hiddentestcases: [],
    startcode: [],
    referencesolution: [],
    problemcreator: "",
  });

  // ✅ Fetch existing problem
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axiosClient.get(`/problem/${id}`);
        setFormData(response.data);
      } catch (err) {
        setError("Failed to load problem");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    try {
      const response = await axiosClient.put(
        `/problem/update/${id}`,
        formData
      );

      alert("Problem Updated Successfully 🚀");
      navigate(`/problem/${id}`);
    } catch (err) {
      setError(err.response?.data || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="max-w-4xl mx-auto bg-gray-900 p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Update Problem
        </h2>

        {error && (
          <div className="bg-red-500 p-3 rounded mb-4 text-white">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 rounded"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full p-2 bg-gray-800 rounded"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block mb-1">Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 rounded"
            >
              <option value="">Select</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block mb-1">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 rounded"
            />
          </div>

          {/* Update Button */}
          <button
            type="submit"
            disabled={updating}
            className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded font-semibold"
          >
            {updating ? "Updating..." : "Update Problem"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProblemPage;
