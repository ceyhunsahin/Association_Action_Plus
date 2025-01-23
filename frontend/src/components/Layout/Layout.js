// src/components/Layout/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../pages/Navbar';
import Footer from '../pages/Footer';
import styles from './Layout.module.css';

const Layout = () => {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <Outlet /> {/* Sayfalar burada render edilir */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;