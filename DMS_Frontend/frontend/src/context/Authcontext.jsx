import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch current user with optional retry
  const fetchCurrentUser = async (retry = true) => {
    try {
      const res = await axios.get("http://localhost:8000/api/current_user/", {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      if (err.response?.status === 401 && retry) {
        // Attempt refresh token
        try {
          const refreshRes = await axios.post(
            "http://localhost:8000/api/refresh/",
            {},
            { withCredentials: true }
          );
          if (refreshRes.data?.access) {
            return fetchCurrentUser(false);
          }
        } catch {
          logout();
        }
      }
      throw err;
    }
  };

  // Login function
  const login = async (username, password) => {
    try {
      await axios.post(
        "http://localhost:8000/api/login/",
        { username, password },
        { withCredentials: true }
      );

      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setPermissions(currentUser.permissions || []);

      // Redirect based on role
      navigate(currentUser.is_admin ? "/admin" : "/dashboard");
    } catch (err) {
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post("http://localhost:8000/api/logout/", {}, { withCredentials: true });
    } catch {
      console.warn("Logout failed");
    }
    setUser(null);
    setPermissions([]);
    window.location.href = "http://localhost:5173/";
  };

  // Auto-check current user on app load
  useEffect(() => {
    (async () => {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
        setPermissions(currentUser.permissions || []);
      } catch {
        setUser(null);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Convenience flags
  const isAdmin = user?.is_admin || false;
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        login,
        logout,
        loading,
        isAdmin,
        isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
