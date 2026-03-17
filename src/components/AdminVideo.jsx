import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { useDispatch, useSelector } from 'react-redux';
import { setProblems } from '../problemSlice';
import { NavLink } from 'react-router';

const AdminVideo = () => {
  const { problems } = useSelector(state => state.problem);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();

  // ✅ Fetch only if Redux is empty
  useEffect(() => {
    if (!problems || problems.length === 0) {
      fetchProblems();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      dispatch(setProblems(data));
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete VIDEO only (not problem)
  const handleDelete = async (problemId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      await axiosClient.delete(`/video/delete/${problemId}`);

      // ✅ Best: refresh data from backend
      await fetchProblems();

    } catch (err) {
      setError(err);
      console.error(err);
    }
  };

  // ✅ Loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // ✅ Error UI
  if (error) {
    return (
      <div className="alert alert-error shadow-lg my-4">
        <span>
          {typeof error === 'string'
            ? error
            : error?.response?.data?.error || 'Something went wrong'}
        </span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Video Upload and Delete</h1>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Tags</th>
              <th>Upload</th>
              <th>Delete Video</th>
            </tr>
          </thead>

          <tbody>
            {problems?.map((problem, index) => (
              <tr key={problem._id}>
                <th>{index + 1}</th>

                <td>{problem.title}</td>

                <td>
                  <span className={`badge ${
                    problem.difficulty === 'Easy'
                      ? 'badge-success'
                      : problem.difficulty === 'Medium'
                        ? 'badge-warning'
                        : 'badge-error'
                  }`}>
                    {problem.difficulty}
                  </span>
                </td>

                <td>
                  <span className="badge badge-outline">
                    {problem.tags}
                  </span>
                </td>

                {/* ✅ Upload Button */}
                <td>
                  <NavLink
                    to={`/admin/upload/${problem._id}`}
                    className="btn bg-blue-600"
                  >
                    Upload
                  </NavLink>
                </td>

                {/* ✅ Delete Video Button */}
                <td>
                  <button
                    onClick={() => handleDelete(problem._id)}
                    className="btn btn-sm btn-error"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVideo;