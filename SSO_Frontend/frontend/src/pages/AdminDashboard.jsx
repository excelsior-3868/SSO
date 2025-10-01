import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import UserForm from "../components/UserForm";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userPermissions, setUserPermissions] = useState({});
  const { logout, user } = useContext(AuthContext); // access current user

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/users/", {
        withCredentials: true,
      });
      setUsers(res.data);

      // Initialize permissions map
      const perms = {};
      res.data.forEach((u) => {
        perms[u.id] = u.permissions || [];
      });
      setUserPermissions(perms);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) logout();
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserCreated = () => fetchUsers();

  const togglePermission = (userId, perm) => {
    setUserPermissions((prev) => {
      const current = prev[userId] || [];
      return {
        ...prev,
        [userId]: current.includes(perm)
          ? current.filter((p) => p !== perm)
          : [...current, perm],
      };
    });
  };

  const updatePermissions = async (userId) => {
    try {
      await axios.patch(
        "http://localhost:8000/api/permissions/",
        { user_id: userId, permissions: userPermissions[userId] },
        { withCredentials: true }
      );
      fetchUsers();
    } catch (err) {
      console.error("Failed to update permissions:", err);
    }
  };

  // No need to check is_admin here; AdminRoute already protects this page
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Create User */}
      <div className="mb-8 bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Create New User</h2>
        <UserForm onUserCreated={handleUserCreated} />
      </div>

      {/* User List */}
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Existing Users</h2>
        {loadingUsers ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2 text-left">Username</th>
                <th className="border px-4 py-2">Admin</th>
                <th className="border px-4 py-2">Permissions</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{user.username}</td>
                  <td className="border px-4 py-2 text-center">
                    {user.is_admin ? "Yes" : "No"}
                  </td>
                  <td className="border px-4 py-2">
                    {userPermissions[user.id]?.join(", ")}
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex gap-2">
                      <label>
                        <input
                          type="checkbox"
                          checked={userPermissions[user.id]?.includes("PMS")}
                          onChange={() => togglePermission(user.id, "PMS")}
                        />
                        PMS
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={userPermissions[user.id]?.includes("DMS")}
                          onChange={() => togglePermission(user.id, "DMS")}
                        />
                        DMS
                      </label>
                      <button
                        onClick={() => updatePermissions(user.id)}
                        className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
