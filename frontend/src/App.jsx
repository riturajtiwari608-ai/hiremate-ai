import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import CandidateDashboard from "./pages/CandidateDashboard";
import CreateAnalysis from "./pages/CreateAnalysis";
import MyAnalyses from "./pages/MyAnalyses";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
      <Route path="/candidate/create-analysis" element={<CreateAnalysis />} />
      <Route path="/candidate/my-analyses" element={<MyAnalyses />} />

      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;