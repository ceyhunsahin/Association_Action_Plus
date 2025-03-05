import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// AuthContext'i oluştur
const AuthContext = createContext();

// AuthProvider bileşeni
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);

    // Sayfa yenilendiğinde localStorage'dan kullanıcı bilgilerini yükle
    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            setAccessToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Giriş yapma fonksiyonu
    const login = async (email, password) => {
        try {
            // FormData kullanarak gönder
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await axios.post('http://localhost:8000/api/token', 
                formData,  // FormData kullan
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            const { access_token, user } = response.data;
            setAccessToken(access_token);
            setUser(user);
            
            // Token'ı ve kullanıcı bilgilerini localStorage'a kaydet
            localStorage.setItem('accessToken', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            
            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Çıkış yapma fonksiyonu
    const logout = () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('refresh_token');
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// useAuth hook'u
export const useAuth = () => {
    return useContext(AuthContext);
};