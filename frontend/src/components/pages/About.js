import React from 'react';
import { Link } from 'react-router-dom';
import styles from './About.module.css';

const About = () => {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.aboutContent}>
        <h1 className={styles.title}>À propos de nous</h1>
        <p className={styles.intro}>
          Bienvenue à <strong>ACTION PLUS</strong>, une association dédiée à la promotion de la diversité culturelle, à la solidarité et au vivre-ensemble. Notre mission est de créer des ponts entre les cultures, de renforcer les liens sociaux et de favoriser un environnement inclusif pour tous.
        </p>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Notre Vision</h2>
          <p className={styles.sectionText}>
            Nous croyons en un monde où la diversité est célébrée, où chaque individu se sent valorisé et où les communautés s'épanouissent grâce à la compréhension mutuelle et à la coopération. Notre vision est de bâtir une société plus inclusive et solidaire, où les différences culturelles sont une source de richesse et non de division.
          </p>
        </div>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Nos Actions</h2>
          <p className={styles.sectionText}>
            À travers des événements culturels, des ateliers éducatifs et des projets communautaires, nous encourageons le dialogue interculturel et la transmission des savoirs. Que ce soit par des dîners partagés, des conférences inspirantes ou des activités intergénérationnelles, nous créons des espaces où chacun peut apprendre, partager et grandir ensemble.
          </p>
        </div>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Nos Valeurs</h2>
          <p className={styles.sectionText}>
            <strong>Respect</strong>, <strong>ouverture d'esprit</strong>, et <strong>solidarité</strong> sont au cœur de tout ce que nous faisons. Nous nous engageons à promouvoir la tolérance, à lutter contre l'isolement et à soutenir l'égalité des chances pour tous, indépendamment de leur origine ou de leur parcours.
          </p>
        </div>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Rejoignez-nous</h2>
          <p className={styles.sectionText}>
            Que vous soyez un passionné de culture, un bénévole engagé ou simplement curieux de découvrir de nouvelles perspectives, nous vous accueillons à bras ouverts. Ensemble, nous pouvons faire la différence et construire un avenir plus harmonieux.
          </p>
          <Link to="/register" className={styles.joinLink}>
            S'inscrire
          </Link>
        </div>
        <p className={styles.closing}>
          <strong>ACTION PLUS</strong> s'engage à exercer une gestion désintéressée, sans but lucratif, et à rester ouverte à tous sans distinction, conformément aux principes d'intérêt général.
        </p>
      </div>
    </div>
  );
};

export default About;