import { Navigate, Route, Routes } from "react-router-dom";
import StorefrontPage from "./pages/StorefrontPage";
import TrackingPage from "./pages/TrackingPage";
import AdminPage from "./pages/AdminPage";
import AdminSignupPage from "./pages/AdminSignupPage";
import AdminAccountPage from "./pages/AdminAccountPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<StorefrontPage />} />
      <Route path="/pedido/:orderId" element={<TrackingPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/cadastro" element={<AdminSignupPage />} />
      <Route path="/admin/conta" element={<AdminAccountPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
