// src/components/Layout/Layout.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';
import Navbar from '../pages/Navbar';
import Footer from '../pages/Footer';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Footer'ı sadece HomePage'de göster
  const showFooter = location.pathname === '/';

  return (
    <div className={styles.layoutContainer}>
      <Navbar />
      <main className={styles.mainContent}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;