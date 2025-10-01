import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Wait until AuthContext finishes loading
  if (loading) return null; // or show a spinner: <p>Loading...</p>

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Render the dashboard
  return children;
};

export default PrivateRoute;
