import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
// Kullanılmayan Firebase importlarını kaldıralım
// import { auth } from '../firebase/config';
// import { 
//   signInWithEmailAndPassword, 
//   createUserWithEmailAndPassword, 
//   signOut, 
//   GoogleAuthProvider, 
//   signInWithPopup,
//   onAuthStateChanged
// } from 'firebase/auth';

// AuthContext'i oluştur
const AuthContext = createContext();

// useAuth hook'u - Burada tanımlayalım
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider bileşeni
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Kullanılmayan error state'ini kaldıralım veya kullanılır hale getirelim
  // const [error, setError] = useState(null);

  // Kullanıcı oturum durumunu izle
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          // Token ve kullanıcı bilgilerini state'e yükle
          setAccessToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAdmin(parsedUser.role === 'admin');
          setIsAuthenticated(true);
          
          // API istekleri için default header'ı ayarla
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Normal kayıt
  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Normal giriş
  const login = async (email, password) => {
    try {
      console.log('Login attempt with:', { email, password });
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      const { access_token, user } = response.data;
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Context state'ini güncelle
      setUser(user);
      setAccessToken(access_token);
      setIsAuthenticated(true);
      setIsAdmin(user.role === 'admin');
      
      // API istekleri için default header'ı ayarla
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return response.data;
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  // Google ile giriş
  const loginWithGoogle = async () => {
    try {
      // Google OAuth işlemi
      // Bu kısım backend entegrasyonuna göre değişebilir
      window.location.href = 'http://localhost:8000/api/auth/google';
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  // Çıkış
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setAccessToken(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    accessToken,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    isAdmin,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};