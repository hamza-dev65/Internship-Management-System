import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // If authenticated but role doesn't match, redirect to correct dashboard
    if (userRole === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (userRole === "intern") {
      return <Navigate to="/intern" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
