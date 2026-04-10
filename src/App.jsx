import React, { Suspense, lazy, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./authSlice";

// Fast, initial load routes
import Homepage from "../pages/Homepage";
import LandingPage from "../pages/LandingPage";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import VerifyOtp from "../pages/VerifyOtp";
import ForgotPassword from "../pages/ForgotPassword";
import VerifyResetOtp from "../pages/VerifyResetOtp";
import ResetPassword from "../pages/ResetPassword";

// Heavy/Nested routes lazy-loaded
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const ProblemPage = lazy(() => import("../pages/ProblemPage"));
const Admin = lazy(() => import("../pages/Admin"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const UpdateProblemPage = lazy(() => import("./components/UpdateProblem"));
const ProblemUpdate = lazy(() => import("./components/ProblemUpdate"));
const AdminDelete = lazy(() => import("./components/AdminDelete"));
const AdminVideo = lazy(() => import("./components/AdminVideo"));
const AdminUpload = lazy(() => import("./components/AdminUpload"));
const AdminCreateContest = lazy(() => import("./components/AdminCreateContest"));
const ContestListPage = lazy(() => import("../pages/ContestListPage"));
const ContestDetailPage = lazy(() => import("../pages/ContestDetailPage"));
const ContestLeaderboardPage = lazy(() => import("../pages/ContestLeaderboardPage"));

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
    <div className="bg-[#0d1117] min-h-screen">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#0d1117]">
            <span className="loading loading-spinner text-violet-500 loading-lg"></span>
          </div>
        }
      >
        <Routes>
          {/* "/" shows Landing for guests, Homepage for logged-in users */}
          <Route path="/" element={isAuthenticated ? <Homepage /> : <LandingPage />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />
          <Route path="/verify-otp" element={isAuthenticated ? <Navigate to="/" /> : <VerifyOtp />} />
          <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />} />
          <Route path="/verify-reset-otp" element={isAuthenticated ? <Navigate to="/" /> : <VerifyResetOtp />} />
          <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/" /> : <ResetPassword />} />
          <Route path="/admin" element={isAuthenticated && user?.role === "admin" ? <Admin /> : <Navigate to="/" />} />
          <Route path="/admin/create" element={isAuthenticated && user?.role === "admin" ? <AdminPanel /> : <Navigate to="/" />} />
          <Route path="/admin/update" element={isAuthenticated && user?.role === "admin" ? <UpdateProblemPage /> : <Navigate to="/" />} />
          <Route path="/admin/update/:id" element={isAuthenticated&& user?.role === "admin" ? <ProblemUpdate/>:<Navigate to="/"></Navigate>}/>
          <Route path="/admin/delete" element={isAuthenticated && user?.role === "admin" ? <AdminDelete /> : <Navigate to="/" />} />
          <Route path="/problem/:problemId" element={isAuthenticated?<ProblemPage />:<Navigate to="/"></Navigate>} />
          <Route path="/admin/video" element={isAuthenticated && user?.role === "admin" ? <AdminVideo/> : <Navigate to="/" />} />
          <Route path="/admin/upload/:problemId" element={isAuthenticated&&user?.role ==='admin'?<AdminUpload/> :<Navigate to="/" />} />

          {/* Contest Routes */}
          <Route path="/contests" element={isAuthenticated ? <ContestListPage /> : <Navigate to="/login" />} />
          <Route path="/contest/:id" element={isAuthenticated ? <ContestDetailPage /> : <Navigate to="/login" />} />
          <Route path="/contest/:id/leaderboard" element={isAuthenticated ? <ContestLeaderboardPage /> : <Navigate to="/login" />} />
          <Route path="/admin/contest/create" element={isAuthenticated && user?.role === "admin" ? <AdminCreateContest /> : <Navigate to="/" />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;