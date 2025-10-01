import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AppCard from "../components/AppCard";

const UserDashboard = () => {
  const { permissions, logout } = useContext(AuthContext);

  // Available apps mapped by permission keys
  const availableApps = {
    PMS: { name: "PMS", url: "http://localhost:5175/" },
    DMS: { name: "DMS", url: "http://localhost:5174/" },
  };

  // Filter only the apps the user has permission for
  const userApps = permissions
    .filter((perm) => availableApps[perm])
    .map((perm) => availableApps[perm]);

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">User Dashboard</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {userApps.length === 0 ? (
        <p className="text-gray-700">
          No apps assigned. Please contact your admin.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {userApps.map((app) => (
            <AppCard key={app.name} name={app.name} url={app.url} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
