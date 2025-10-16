import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  // This route is for pages that should be accessible to everyone
  // (both authenticated and non-authenticated users)
  // For example, login, password reset, etc.
  
  // No restrictions - just render the children
  return children;
};

export default PublicRoute;