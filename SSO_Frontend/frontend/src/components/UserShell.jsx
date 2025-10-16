import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const UserShell = ({ title, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const isDashboard = location.pathname === "/user";
  const isChangePassword = location.pathname === "/change-password";

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden sm:flex sm:flex-col">
        <div className="px-6 py-5 border-b border-gray-200">
          <span className="text-xl font-semibold">Menu</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <button
            className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-md font-medium ${
              isDashboard
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => navigate("/user")}
          >
            <svg
              className="h-5 w-5 text-gray-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
              />
            </svg>
            Dashboard
          </button>
          <button
            className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-md font-medium ${
              isChangePassword
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => navigate("/change-password")}
          >
            <svg
              className="h-5 w-5 text-gray-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 7a4 4 0 10-8 0v4H5a2 2 0 00-2 2v4h10v-4a2 2 0 00-2-2h-2V7a2 2 0 114 0"
              />
            </svg>
            Change Password
          </button>
          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
              onClick={logout}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 8v8a2 2 0 002 2h3"
                />
              </svg>
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 text-right">
              <p className="font-medium text-gray-800">
                Welcome back,{" "}
                <span className="text-blue-600">
                  {user?.first_name || user?.name || "User"}
                </span>{" "}
                👋
              </p>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 p-6 bg-gray-50">{children}</section>
      </main>
    </div>
  );
};

export default UserShell;
