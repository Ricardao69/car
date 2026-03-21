import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:3000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pilot_token') || null);
  const [loading, setLoading] = useState(true);

  // When app loads, if we have a token, we should ideally fetch the user profile from the API.
  // For MVP, if we stored the user object in localStorage along with token, we load it.
  useEffect(() => {
    const storedUser = localStorage.getItem('pilot_user_data');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('pilot_token', data.token);
        localStorage.setItem('pilot_user_data', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('pilot_token', data.token);
        localStorage.setItem('pilot_user_data', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pilot_token');
    localStorage.removeItem('pilot_user_data');
  };

  const updateProfile = async (updates) => {
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (res.ok) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('pilot_user_data', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
