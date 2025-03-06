// src/components/Layout/Layout.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';
import Navbar from '../pages/navbar';
import Footer from '../pages/footer';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className={styles.layout}>
      <Navbar user={user} />
      <main className={styles.mainContent}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;