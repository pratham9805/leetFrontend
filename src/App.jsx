import { Route, Routes, Navigate } from "react-router";
import Homepage from "../pages/Homepage";
import LandingPage from "../pages/LandingPage";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import { checkAuth } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import AdminDelete from "./components/AdminDelete";
import Admin from "../pages/Admin";
import ProblemPage from "../pages/ProblemPage";
import UpdateProblemPage from "./components/UpdateProblem";
import ProblemUpdate from "./components/ProblemUpdate";
import AdminVideo from "./components/AdminVideo";
import AdminUpload from "./components/AdminUpload";

function App() {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* "/" shows Landing for guests, Homepage for logged-in users */}
        <Route path="/" element={isAuthenticated ? <Homepage /> : <LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />
        <Route path="/admin" element={isAuthenticated && user?.role === "admin" ? <Admin /> : <Navigate to="/" />} />
        <Route path="/admin/create" element={isAuthenticated && user?.role === "admin" ? <AdminPanel /> : <Navigate to="/" />} />
        <Route path="/admin/update" element={isAuthenticated && user?.role === "admin" ? <UpdateProblemPage /> : <Navigate to="/" />} />
        <Route path="/admin/update/:id" element={isAuthenticated&& user?.role === "admin" ? <ProblemUpdate/>:<Navigate to="/"></Navigate>}/>
        <Route path="/admin/delete" element={isAuthenticated && user?.role === "admin" ? <AdminDelete /> : <Navigate to="/" />} />
        <Route path="/problem/:problemId" element={<ProblemPage />} />
          <Route path="/admin/video" element={isAuthenticated && user?.role === "admin" ? <AdminVideo/> : <Navigate to="/" />} />
          <Route path="/admin/upload/:problemId" element={isAuthenticated&&user?.role ==='admin'?<AdminUpload/> :<Navigate to="/" />} />
  
      </Routes>
    </>
  );
}

export default App;