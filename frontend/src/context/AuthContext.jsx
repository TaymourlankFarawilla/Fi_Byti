import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fibyti_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [sellerProfile, setSellerProfile] = useState(() => {
    const saved = localStorage.getItem('fibyti_seller_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('fibyti_token') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSellerProfile(data.sellerProfile);
        localStorage.setItem('fibyti_user', JSON.stringify(data.user));
        if (data.sellerProfile) {
          localStorage.setItem('fibyti_seller_profile', JSON.stringify(data.sellerProfile));
        } else {
          localStorage.removeItem('fibyti_seller_profile');
        }
      } else {
        logout();
      }
    } catch (e) {
      console.error('Auth refresh error:', e);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setToken(data.token);
      setUser(data.user);
      setSellerProfile(data.sellerProfile);
      localStorage.setItem('fibyti_token', data.token);
      localStorage.setItem('fibyti_user', JSON.stringify(data.user));
      if (data.sellerProfile) localStorage.setItem('fibyti_seller_profile', JSON.stringify(data.sellerProfile));

      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setToken(data.token);
      setUser(data.user);
      setSellerProfile(data.sellerProfile);
      localStorage.setItem('fibyti_token', data.token);
      localStorage.setItem('fibyti_user', JSON.stringify(data.user));
      if (data.sellerProfile) localStorage.setItem('fibyti_seller_profile', JSON.stringify(data.sellerProfile));

      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setSellerProfile(null);
    localStorage.removeItem('fibyti_token');
    localStorage.removeItem('fibyti_user');
    localStorage.removeItem('fibyti_seller_profile');

    // Redirect immediately to Sign In page
    window.location.hash = '#/login';
  };

  return (
    <AuthContext.Provider value={{ user, sellerProfile, token, loading, login, register, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
