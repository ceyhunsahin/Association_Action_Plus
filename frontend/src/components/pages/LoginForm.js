import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginForm.module.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        try {
            // Backend'e login isteği gönder
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });
    
            // Eğer yanıt başarılı değilse, hatayı fırlat
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Login failed');
            }
    
            // Yanıtı JSON formatında al
            const data = await response.json();
    
            // AuthContext'teki login fonksiyonunu çağırarak kullanıcıyı oturum açık olarak işaretle
            login(data);
    
            // Yanıtı döndür (isteğe bağlı)
            return data;
        } catch (error) {
            // Hata durumunda hatayı logla ve fırlat
            console.error('Login error:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // handleLogin fonksiyonunu çağırarak login işlemini gerçekleştir
            const data = await handleLogin(email, password);

            // AuthContext'teki login fonksiyonunu çağırarak kullanıcıyı oturum açık olarak işaretle
            login(data);

            // Başarılı giriş mesajını göster
            setSuccessMessage('Vous êtes connecté avec succès!');
            setErrorMessage('');

            // 2 saniye sonra profil sayfasına yönlendir
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(error.message || 'Une erreur s\'est produite lors de la connexion.');
            setSuccessMessage('');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Connexion</h2>
                {successMessage && (
                    <div className={styles.successMessage}>{successMessage}</div>
                )}
                {errorMessage && (
                    <div className={styles.errorMessage}>{errorMessage}</div>
                )}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.button}>
                        Se connecter
                    </button>
                </form>
                <p className={styles.registerLink}>
                    Vous n'avez pas de compte? <a href="/register">S'inscrire</a>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;