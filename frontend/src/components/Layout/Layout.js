// src/components/Layout/Layout.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';
import Navbar from '../pages/Navbar';
import Footer from '../pages/Footer';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className={styles.layoutContainer}>
      <Navbar />
      <main className={styles.mainContent}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;