import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const UserRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Wait until AuthContext finishes loading
  if (loading) return null; // do not render anything until we know user state

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/" replace />; // login page
  }

  // Optional: prevent admins from accessing user dashboard
  if (user.is_admin) {
    return <Navigate to="/admin" replace />; // admin dashboard
  }

  // Render normal user dashboard
  return children;
};

export default UserRoute;
