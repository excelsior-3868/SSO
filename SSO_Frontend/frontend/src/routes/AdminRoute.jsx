import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Wait until AuthContext finishes loading
  if (loading) return null; // render nothing or a spinner

  // Redirect if not logged in or not admin
  if (!user || !user.is_admin) {
    return <Navigate to="/user" replace />; // redirect normal users
  }

  // Render admin page
  return children;
};

export default AdminRoute;
