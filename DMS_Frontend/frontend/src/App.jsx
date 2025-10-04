import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './context/Authcontext';

function App() {
  const [valid, setValid] = useState(null); // null = not checked yet
  const [user, setUser] = useState('');
  const { logout } = useContext(AuthContext); // access Logout Feature

  // Detect which app is being accessed
  const app = window.location.hostname.includes("5174") ? "" : "DMS";

  useEffect(() => {
    axios.get(`http://localhost:8000/api/token/validate/?app=${app}`, { withCredentials: true })
      .then(res => {
        if (res.data.valid) {
          setValid(true);
          setUser(res.data.user);
        } else {
          window.location.href = 'http://localhost:5173/';
        }
      })
      .catch(() => {
        window.location.href = 'http://localhost:5173/';
      });
  }, []);

  // While validation is in progress
  if (valid === null) return <div className="p-4">Checking authentication...</div>;

  return (
    <>
     <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Welcome Mr {user} to DMS Dashboard</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      </div>
    </>
  );
}

export default App;
