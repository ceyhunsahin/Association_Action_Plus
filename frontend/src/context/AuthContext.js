import React, { createContext, useState, useContext, useEffect } from 'react';

// AuthContext'i oluştur
const AuthContext = createContext();

// AuthProvider bileşeni
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);

    // Sayfa yenilendiğinde localStorage'dan kullanıcı bilgilerini yükle
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedAccessToken = localStorage.getItem('access_token');
        const storedRefreshToken = localStorage.getItem('refresh_token');

        if (storedUser && storedAccessToken) {
            setUser(JSON.parse(storedUser));
            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);
        }
    }, []);

    // Giriş yapma fonksiyonu
    const login = (data) => {
        setUser(data.user);
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
    };

    // Çıkış yapma fonksiyonu
    const logout = () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
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