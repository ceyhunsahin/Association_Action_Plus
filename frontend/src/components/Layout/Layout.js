// Layout Bileşeni
import React from "react";
import styles from "./Layout.module.css";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";

const Layout = ({ children }) => {
  return (
    <div className={styles.layoutContainer}>
      <Navbar />
      <main className={styles.mainContent}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
