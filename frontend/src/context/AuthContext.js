import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

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

  // Google ile giriş - Firebase popup yöntemi
  const loginWithGoogle = async () => {
    try {
      setError(null);
      
      // Google provider oluştur
      const provider = new GoogleAuthProvider();
      
      // Email istediğimizi belirtelim
      provider.addScope('email');
      provider.addScope('profile');
      
      // Basit yapılandırma
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Popup ile giriş yap
      console.log("Opening Google sign-in popup...");
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign-in successful, getting ID token...");
      
      // Kullanıcı bilgilerini al
      const { displayName, email, photoURL, uid } = result.user;
      
      // Email kontrolü
      if (!email) {
        console.error("No email found in Google user data");
        throw new Error("Email not found in Google user data");
      }
      
      // Token al
      const idToken = await result.user.getIdToken();
      console.log(`Got ID token, first 10 chars: ${idToken.substring(0, 10)}...`);
      
      try {
        // Backend'e gönder
        console.log("Sending token to backend...");
        const response = await axios.post('http://localhost:8000/api/auth/google-login', { 
          idToken,
          userData: {
            displayName,
            email,
            photoURL,
            uid
          }
        });
        
        console.log("Backend response:", response.data);
        
        // Kullanıcı bilgilerini kaydet
        const { access_token, user } = response.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // State'i güncelle
        setAccessToken(access_token);
        setUser(user);
        setIsAdmin(user.role === 'admin');
        setIsAuthenticated(true);
        
        // API istekleri için default header'ı ayarla
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        return response.data;
      } catch (backendError) {
        console.error("Backend error:", backendError);
        if (backendError.response) {
          console.error("Response data:", backendError.response.data);
          console.error("Response status:", backendError.response.status);
          throw new Error(backendError.response.data.detail || "Backend error");
        }
        throw backendError;
      }
    } catch (error) {
      console.error('Google login error:', error);
      
      // Hata detaylarını yazdır
      if (error.code) console.error('Error code:', error.code);
      if (error.message) console.error('Error message:', error.message);
      
      // Kullanıcıya gösterilecek hata mesajı
      let errorMessage = "Google ile giriş yapılırken bir hata oluştu.";
      
      // Firebase hata kodlarına göre özel mesajlar
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Giriş penceresi kapatıldı. Lütfen tekrar deneyin.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Tarayıcınız popup'ları engelliyor. Lütfen izin verin ve tekrar deneyin.";
      }
      
      setError(errorMessage);
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

  // Token yenileme fonksiyonu
  const refreshToken = async () => {
    try {
      // Eğer zaten token yenileme işlemi yapılıyorsa, tekrar yapma
      if (isRefreshing) return null;
      
      setIsRefreshing(true);
      
      const response = await axios.post(
        'http://localhost:8000/api/auth/refresh-token',
        {},
        { withCredentials: true }
      );
      
      if (response.data && response.data.access_token) {
        setAccessToken(response.data.access_token);
        
        // Kullanıcı bilgilerini güncelle
        const userResponse = await axios.get(
          'http://localhost:8000/api/users/me',
          {
            headers: {
              Authorization: `Bearer ${response.data.access_token}`
            }
          }
        );
        
        if (userResponse.data) {
          setUser(userResponse.data);
          setIsAdmin(userResponse.data.role === 'admin');
        }
        
        setIsRefreshing(false);
        return response.data.access_token;
      }
      
      setIsRefreshing(false);
    } catch (error) {
      console.error('Token yenileme hatası:', error);
      // Token yenilenemezse kullanıcıyı çıkış yaptır
      setUser(null);
      setAccessToken(null);
      setIsAdmin(false);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setIsRefreshing(false);
    }
    return null;
  };

  // Axios interceptor'ları
  useEffect(() => {
    // İstek sayacı
    let failedRequestCount = 0;
    const MAX_FAILED_REQUESTS = 3;
    
    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        // Eğer token varsa ve auth isteği değilse token ekle
        if (accessToken && !config.url.includes('/auth/')) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Token süresi dolmuşsa ve bu istek daha önce yenilenmemişse
        // ve başarısız istek sayısı limiti aşmamışsa
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            failedRequestCount < MAX_FAILED_REQUESTS) {
          
          originalRequest._retry = true;
          failedRequestCount++;
          
          const newToken = await refreshToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            failedRequestCount = 0; // Başarılı olursa sayacı sıfırla
            return axios(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );

    // Cleanup
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]);

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