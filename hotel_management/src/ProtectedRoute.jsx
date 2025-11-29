// src/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Check for authentication token
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail");
  const user = localStorage.getItem("user");

  // Validate that we have all required authentication data
  const isAuthenticated = token && userEmail && user;

  if (!isAuthenticated) {
    // Store the attempted URL to redirect back after login
    localStorage.setItem("redirectAfterLogin", location.pathname + location.search);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
