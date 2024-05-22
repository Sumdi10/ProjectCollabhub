import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainRoutes from "./routes/Routes";
import LoginPage from "./pages/LoginPage";
import "./assets/css/main.css";
import RegisterPage from "./pages/RegisterPage";

const App = () => {
  const isAuthenticated = localStorage.getItem("authToken") !== null;

  return (
    <Routes>
      {isAuthenticated ? (
        <Route path="/*" element={<MainRoutes />} />
      ) : (
        <>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
};

export default App;
