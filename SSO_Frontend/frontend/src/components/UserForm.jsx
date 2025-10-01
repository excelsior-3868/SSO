import React, { useState } from 'react';
import axios from 'axios';

const UserForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [perms, setPerms] = useState({ dms: false, pms: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const permissions = [];
    if (perms.dms) permissions.push('dms');
    if (perms.pms) permissions.push('pms');
    try {
      await axios.post('http://localhost:8000/api/users/', 
        { username, password, is_admin: isAdmin, permissions }, 
        { withCredentials: true }
      );
      setSuccess('User created successfully');
      setUsername('');
      setPassword('');
      setIsAdmin(false);
      setPerms({ dms: false, pms: false });
    } catch (err) {
      setError('Failed to create user');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-100 rounded">
      <h3 className="text-xl mb-4 font-bold">Create New User</h3>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}
      <div className="mb-2">
        <label className="block text-sm font-medium">Username</label>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          className="block w-full p-2 border rounded" 
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Password</label>
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          className="block w-full p-2 border rounded" 
        />
      </div>
      <label className="block mb-2">
        <input 
          type="checkbox" 
          checked={isAdmin} 
          onChange={e => setIsAdmin(e.target.checked)} 
          className="mr-2" 
        />
        Admin
      </label>
      <label className="block mb-2">
        <input 
          type="checkbox" 
          checked={perms.dms} 
          onChange={e => setPerms({...perms, dms: e.target.checked})} 
          className="mr-2" 
        />
        DMS Access
      </label>
      <label className="block mb-2">
        <input 
          type="checkbox" 
          checked={perms.pms} 
          onChange={e => setPerms({...perms, pms: e.target.checked})} 
          className="mr-2" 
        />
        PMS Access
      </label>
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Create User</button>
    </form>
  );
};

export default UserForm;