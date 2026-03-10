import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Pencil } from "lucide-react";

function AdminUpdateProblems() {

  const navigate = useNavigate();
  const problems = useSelector((state) => state.problem.problems);

  const handleUpdate = (id) => {
    navigate(`/admin/update/${id}`);
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">Update Problems</h1>

      <div className="overflow-x-auto">

        <table className="table table-zebra">

          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Tag</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {problems.map((problem, index) => (

              <tr key={problem._id}>

                <td>{index + 1}</td>

                <td className="font-medium">
                  {problem.title}
                </td>

                <td>
                  <span className={`badge ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </td>

                <td>
                  <span className="badge badge-info badge-outline">
                    {problem.tags}
                  </span>
                </td>

                <td>
                  <button
                    className="btn btn-sm btn-primary flex items-center gap-1"
                    onClick={() => handleUpdate(problem._id)}
                  >
                    <Pencil size={14}/>
                    Update
                  </button>
                </td>

              </tr>

            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}

const getDifficultyColor = (difficulty) => {

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

export default AdminUpdateProblems;