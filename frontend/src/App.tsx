import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LandingPage from "./pages/landingpage/LandingPage";
import Login from "./pages/login/Login";
import AdminDashboard from "./pages/dashboard/AdminDashboard";


function App() {
  return (
    <Routes>
      {/* Ruta pública - Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Ruta de login */}
      <Route path="/login" element={<Login />} />

      {/* Ruta protegida - Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Ruta 404 - Redirigir al home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
