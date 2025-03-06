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
  // Kullanılmayan error state'ini kaldıralım veya kullanılır hale getirelim
  // const [error, setError] = useState(null);

  // Kullanıcının admin olup olmadığını kontrol et
  const isAdmin = user && user.role === 'admin';

  // Kullanıcı oturum durumunu izle
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          // Token ve kullanıcı bilgilerini state'e yükle
          setAccessToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // API istekleri için default header'ı ayarla
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('accessToken');
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
  const login = async (emailOrUsername, password) => {
    try {
      console.log("Login attempt with:", emailOrUsername, password);
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email: emailOrUsername,  // email alanını hem email hem de username için kullanıyoruz
        password
      });
      
      console.log("Login response:", response.data);
      
      const { access_token, user } = response.data;
      
      // Kullanıcı bilgilerini doğru şekilde saklayalım
      // profileImage alanını ekleyelim
      const userWithDefaults = {
        ...user,
        profileImage: user.profileImage || null
      };
      
      setUser(userWithDefaults);
      setAccessToken(access_token);
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('user', JSON.stringify(userWithDefaults));
      
      // API istekleri için default header'ı ayarla
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setAccessToken(null);
  };

  const value = {
    user,
    accessToken,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};