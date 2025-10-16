import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AppCard from "../components/AppCard";
import UserShell from "../components/UserShell";

const UserDashboard = () => {
  const { permissions } = useContext(AuthContext);

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
    <UserShell title="User Dashboard">
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
    </UserShell>
  );
};

export default UserDashboard;
