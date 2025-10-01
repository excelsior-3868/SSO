import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [valid, setValid] = useState(null); // null = not checked yet
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/token/validate/', { withCredentials: true })
      .then(res => {
        if (res.data.valid) {
          setValid(true);
        } else {
          // Token invalid → redirect to auth server
          window.location.href = 'http://localhost:5173/';
        }
      })
      .catch(() => {
        // Request failed → redirect to auth server
        window.location.href = 'http://localhost:5173/';
      });
  }, []);

  // // While validation is in progress
  // if (valid === null) return <div className="p-4">Checking authentication...</div>;

  // If somehow valid is false (should never happen here)
  if (!valid) return null;

  // Authenticated view
  return <div className="p-4">Welcome to PMS Dashboard.</div>;
}

export default App;

