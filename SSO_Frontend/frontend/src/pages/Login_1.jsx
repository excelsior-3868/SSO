import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);

  const { user, login, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectUri = searchParams.get("redirect_uri");

  const DEFAULT_DMS_DASHBOARD = "http://localhost:5174";
  const DEFAULT_PMS_DASHBOARD = "http://localhost:5175";

  // 👇 Detect where the user came from if no redirect_uri is provided
  const detectAppOrigin = () => {
    const referrer = document.referrer;
    if (referrer.includes("5174")) {
      return DEFAULT_DMS_DASHBOARD;
    } else if (referrer.includes("5175")) {
      return DEFAULT_PMS_DASHBOARD;
    }
    // fallback — if user opened SSO manually
    return DEFAULT_DMS_DASHBOARD;
  };

  // ✅ Handle redirect after login success
  useEffect(() => {
    if (!loading && user) {
      if (redirectUri) {
        // If an app explicitly provided redirect_uri, go there
        window.location.href = redirectUri;
      } else if (user.is_admin) {
        // Admin logs in directly
        navigate("/admin");
      } else {
        // Regular user: figure out which app they came from
        const target = detectAppOrigin();
        window.location.href = target;
      }
    }
  }, [user, loading, navigate, redirectUri]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingForm(true);
    try {
      await login(username, password);
      // useEffect handles redirection
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoadingForm(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md"
      >
        <h2 className="mb-6 text-2xl font-semibold text-center">Login</h2>

        {error && <p className="mb-4 text-red-500 text-center">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <button
          type="submit"
          className={`w-full p-3 text-white rounded ${
            loadingForm ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={loadingForm}
        >
          {loadingForm ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
