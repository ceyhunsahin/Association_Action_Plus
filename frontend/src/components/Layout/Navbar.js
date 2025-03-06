import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';
import { FaUser, FaSignOutAlt, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleAvatarClick = () => {
        navigate('/profile');
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    useEffect(() => {
        if (user) {
            console.log('Current user in Navbar:', user);
        }
    }, [user]);

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                <Link to="/" className={styles.navLogo}>
                    Association Culturelle
                </Link>

                <div className={styles.mobileMenuIcon} onClick={toggleMobileMenu}>
                    {showMobileMenu ? <FaTimes /> : <FaBars />}
                </div>

                <ul className={`${styles.navMenu} ${showMobileMenu ? styles.active : ''}`}>
                    <li className={styles.navItem}>
                        <Link to="/" className={styles.navLink} onClick={() => setShowMobileMenu(false)}>
                            Accueil
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <Link to="/events" className={styles.navLink} onClick={() => setShowMobileMenu(false)}>
                            Événements
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <Link to="/about" className={styles.navLink} onClick={() => setShowMobileMenu(false)}>
                            À propos
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <Link to="/contact" className={styles.navLink} onClick={() => setShowMobileMenu(false)}>
                            Contact
                        </Link>
                    </li>
                </ul>

                <div className={styles.navAuth}>
                    {user ? (
                        <div className={styles.userProfile}>
                            <div className={styles.userAvatar} onClick={handleAvatarClick}>
                                {user && user.profileImage ? (
                                    <img 
                                        src={user.profileImage} 
                                        alt={`${user.firstName} ${user.lastName}`} 
                                        className={styles.userImage}
                                    />
                                ) : (
                                    <FaUserCircle className={styles.userIcon} />
                                )}
                                <span className={styles.userName}>{user ? user.username : ''}</span>
                                <div className={styles.dropdownToggle} onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown();
                                }}>
                                    ▼
                                </div>
                            </div>
                            {showDropdown && (
                                <div className={styles.dropdown}>
                                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                        <FaUser className={styles.dropdownIcon} />
                                        <span>Mon profil</span>
                                    </Link>
                                    <button onClick={handleLogout} className={styles.dropdownItem}>
                                        <FaSignOutAlt className={styles.dropdownIcon} />
                                        <span>Déconnexion</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.authButtons}>
                            <Link to="/login" className={styles.loginButton}>
                                Connexion
                            </Link>
                            <Link to="/register" className={styles.registerButton}>
                                Inscription
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 