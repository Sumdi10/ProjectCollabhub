import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardTemplate from "../components/Dashboard/DashboardTemplate";
import ErrorPage from "../pages/ErrorPage";
import DashboardRoutes from "./DashboardRoutes";
import { isAuthenticated } from "../utils/Auth";

// HOC to wrap protected components
const withAuth = (Component) => {
  return (props) => {
    if (isAuthenticated()) {
      return <Component {...props} />;
    } else {
      return <Navigate to="/" replace />;
    }
  };
};

const MainRoutes = () => {
  const ProtectedDashboardTemplate = withAuth(DashboardTemplate);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated() ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/" element={<LoginPage />} />
          )
        }
      />

      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard/*" element={<ProtectedDashboardTemplate />}>
        <Route path="*" element={<DashboardRoutes />} />
      </Route>

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default MainRoutes;
