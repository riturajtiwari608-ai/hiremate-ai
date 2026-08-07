import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import CandidateDashboard from "./pages/CandidateDashboard";
import CreateAnalysis from "./pages/CreateAnalysis";
import MyAnalyses from "./pages/MyAnalyses";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import UserManagement from "./pages/UserManagement";
import MyInterviews from "./pages/MyInterviews";
import InterviewRoom from "./pages/InterviewRoom";
import InterviewResult from "./pages/InterviewResult";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/candidate/dashboard"
        element={
          <ProtectedRoute allowedRole="candidate">
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/create-analysis"
        element={
          <ProtectedRoute allowedRole="candidate">
            <CreateAnalysis />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/my-analyses"
        element={
          <ProtectedRoute allowedRole="candidate">
            <MyAnalyses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/interviews"
        element={
          <ProtectedRoute allowedRole="candidate">
            <MyInterviews />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/interviews/:sessionId"
        element={
          <ProtectedRoute allowedRole="candidate">
            <InterviewRoom />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/interviews/:sessionId/result"
        element={
          <ProtectedRoute allowedRole="candidate">
            <InterviewResult />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRole="admin">
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>

  );
}

export default App;