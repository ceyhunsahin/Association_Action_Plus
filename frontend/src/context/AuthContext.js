import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

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
  const [error, setError] = useState(null);

  // Kullanıcı oturum durumunu izle
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        setLoading(true);
        const storedToken = localStorage.getItem('accessToken');
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
        } else {
  
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Normal kayıt
  const register = async (userData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'https://association-action-plus.onrender.com'}/api/auth/register`, userData);
      
      if (response.data && response.data.access_token) {
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
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Token'ı localStorage'dan al ve axios default header'a ekle
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setAccessToken(storedToken);
      setIsAuthenticated(true);
      
      // API istekleri için default header'ı ayarla
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAdmin(parsedUser.role === 'admin');
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }
  }, []);

  // Login fonksiyonu
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      

      
              const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'https://association-action-plus.onrender.com'}/api/auth/login`, {
        email,
        password
      });
      
      const { access_token, user } = response.data;
      
      
      
      // Token ve kullanıcı bilgilerini sakla
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // API istekleri için default header'ı ayarla
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setAccessToken(access_token);
      setUser(user);
      setIsAdmin(user.role === 'admin');
      setIsAuthenticated(true);
      setLoading(false);
      
      return true;
    } catch (error) {
      console.error('Login error:', error.response || error);
      setError(error.response?.data?.detail || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  // Google ile giriş
  const loginWithGoogle = async () => {
    try {
      // Popup kullan (daha güvenilir)
      const result = await signInWithPopup(auth, googleProvider);
      
      if (!result) {
        console.error('No result from Google login');
        return null;
      }
      
      // Google'dan kullanıcı bilgilerini al
      const userData = {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      };
      
      try {
        // Backend'e gönder
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'https://association-action-plus.onrender.com'}/api/auth/google-login`, {
          userData: userData
        });
        
        if (response.data && response.data.access_token) {
          const { access_token, user } = response.data;
          
          // Token ve kullanıcı bilgilerini sakla
          localStorage.setItem('accessToken', access_token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // State'i güncelle
          setAccessToken(access_token);
          setUser(user);
          setIsAdmin(user.role === 'admin');
          setIsAuthenticated(true);
          
          // API istekleri için default header'ı ayarla
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          
          return response.data;
        }
      } catch (backendError) {
        console.error('Backend error during Google login:', backendError);
        throw backendError;
      }
      
      return null;
    } catch (error) {
      console.error('Google login error:', error);
      
      // Popup kapatma hatasını özel olarak ele al
      if (error.code === 'auth/popup-closed-by-user') {
        // Bu hatayı sessizce geç, kullanıcıya hata gösterme
        return null;
      }
      
      throw error;
    }
  };

  // Axios interceptor'ları
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Eğer token varsa ve auth isteği değilse token ekle
        const token = localStorage.getItem('accessToken');
        if (token) {
  
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // 401 hatası alındığında
        if (error.response?.status === 401) {
  
          
          // Eğer bu /api/users/me endpoint'i ise, sessizce hata döndür
          if (error.config.url.includes('/api/users/me')) {

            return Promise.reject(error);
          }
          
          // Token yenileme devre dışı: kullanıcıyı çıkışa yönlendir
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          setAccessToken(null);
          setIsAdmin(false);
          setIsAuthenticated(false);
          return Promise.reject(error);
        }
        
        return Promise.reject(error);
      }
    );

    // Cleanup
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Çıkış
  const logout = () => {
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('lastDonationId');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setAccessToken(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
    
    // Sayfayı yenileme yerine window.location.href kullan
    window.location.href = '/';
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
    isAuthenticated,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
