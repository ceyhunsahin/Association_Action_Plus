import React from 'react';
import { Link } from 'react-router-dom';
import NosActivites from './NosActivites';
import Counter from './Counter'; // Sayac bileşenini ekle
import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={styles.homepage}>
      {/* Hero Section */}
      <div
        className={styles.heroSection}
        style={{ backgroundImage: "url('https://picsum.photos/1280/720')" }}
      >
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Bienvenue chez ACTION PLUS</h1>
          <p className={styles.heroSubtitle}>
            Promouvoir le dialogue interculturel, renforcer les liens sociaux et favoriser une société inclusive.
          </p>
          <Link
            to="/activites"
            className={styles.heroButton}
          >
            Découvrir nos activités
          </Link>
        </div>
      </div>

      {/* Nos Activités Section */}
      <NosActivites />

      {/* Sayac */}
      <Counter />

      {/* À propos de nous */}
      <div className={styles.aboutSection}>
        <h2 className={styles.aboutTitle}>Qui sommes-nous ?</h2>
        <p className={styles.aboutText}>
          ACTION PLUS est une association à but non lucratif qui œuvre pour favoriser le dialogue interculturel, promouvoir la diversité culturelle et renforcer la cohésion sociale.
        </p>
        <Link
          to="/about"
          className={styles.aboutButton}
        >
          En savoir plus
        </Link>
      </div>
    </div>
  );
};

export default HomePage;