import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔒 List of public paths that should never trigger logout or redirects
  const PUBLIC_PATHS = ["/", "/password-reset", "/password-reset-confirm"];

  // Utility: check if current path is public
  const isPublicPath = () => {
    const current = window.location.pathname;
    return PUBLIC_PATHS.some((path) => current.startsWith(path));
  };

  // ✅ Safe logout function
  const logout = async (redirect = true) => {
    try {
      await axios.post(`${API_BASE_URL}/api/logout/`, {}, { withCredentials: true });
    } catch {
      console.warn("Logout failed (probably already logged out)");
    }

    setUser(null);
    setPermissions([]);

    // Only redirect if not already on a public page
    if (redirect && !isPublicPath()) {
      navigate("/");
    }
  };

  // ✅ Fetch current user with optional retry and public route awareness
  const fetchCurrentUser = async (retry = true) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/current_user/`, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      if (err.response?.status === 401 && retry) {
        // Attempt to refresh token
        try {
          const refreshRes = await axios.post(
            `${API_BASE_URL}/api/refresh/`,
            {},
            { withCredentials: true }
          );
          if (refreshRes.data?.access) {
            return fetchCurrentUser(false);
          }
        } catch {
          // ❗Do NOT redirect if the user is on a public page
          if (!isPublicPath()) {
            await logout();
          } else {
            setUser(null);
            setPermissions([]);
          }
        }
      }
      throw err;
    }
  };

  // ✅ Login function
  const login = async (username, password) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/login/`,
        { username, password },
        { withCredentials: true }
      );

      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setPermissions(currentUser.permissions || []);

      // Redirect based on role
      navigate(currentUser.is_admin ? "/admin" : "/user");
    } catch (err) {
      throw err;
    }
  };

  // ✅ Auto-check current user on app load
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

  // ✅ Convenience flags
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
