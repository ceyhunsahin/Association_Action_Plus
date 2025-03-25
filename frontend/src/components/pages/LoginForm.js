import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginForm.module.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // URL'den gelen mesajı kontrol et
        if (location.state && location.state.message) {
            setMessage(location.state.message);
            
            // Kayıt başarılıysa, kullanıcı bilgilerini otomatik doldur
            if (location.state.user) {
                setEmail(location.state.user.email || '');
            }
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log("Form submitted with:", { email, password });

        try {
            console.log("Attempting login with:", email, password);
            await login(email, password);
            console.log("Login successful, navigating to profile");
            navigate('/profile');
        } catch (err) {
            console.error('Login error:', err);
            
            // Hata mesajını daha detaylı gösterelim
            let errorMessage = 'Erreur lors de la connexion';
            
            if (err.response) {
                console.error('Error response:', err.response);
                console.error('Error data:', err.response.data);
                errorMessage = err.response.data?.detail || errorMessage;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            console.error('Error details:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            
            // Google ile giriş yap
            const result = await loginWithGoogle();
            console.log('Google login successful:', result);
            
            // Başarılı giriş sonrası yönlendir
            navigate('/profile');
        } catch (err) {
            console.error('Google login error:', err);
            setError(err.response?.data?.detail || 'Google ile giriş yapılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginForm}>
                <h2 className={styles.title}>Connexion</h2>
                
                {message && <div className={styles.message}>{message}</div>}
                {error && <div className={styles.error}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email veya Kullanıcı Adı</label>
                        <input
                            type="text"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
                
                <div className={styles.divider}>
                    <span>ou</span>
                </div>
                
                <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className={styles.googleButton}
                    disabled={loading}
                >
                    <img 
                        src="https://developers.google.com/identity/images/g-logo.png" 
                        alt="Google logo" 
                        className={styles.googleLogo} 
                    />
                    Se connecter avec Google
                </button>
                
                <div className={styles.links}>
                    <p>
                        Vous n'avez pas de compte? <Link to="/register">S'inscrire</Link>
                    </p>
                    <p>
                        <Link to="/forgot-password">Mot de passe oublié?</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;