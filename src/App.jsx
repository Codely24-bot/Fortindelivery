import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const StorefrontPage = lazy(() => import("./pages/StorefrontPage"));
const TrackingPage = lazy(() => import("./pages/TrackingPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminSignupPage = lazy(() => import("./pages/AdminSignupPage"));
const AdminAccountPage = lazy(() => import("./pages/AdminAccountPage"));

function App() {
  return (
    <Suspense fallback={<div className="page-loading">Carregando...</div>}>
      <Routes>
        <Route path="/" element={<StorefrontPage />} />
        <Route path="/pedido/:orderId" element={<TrackingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/cadastro" element={<AdminSignupPage />} />
        <Route path="/admin/conta" element={<AdminAccountPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
