import React, { useEffect, useRef, useState } from 'react';
import styles from './About.module.css';
import { FaHandshake, FaGlobeEurope, FaUsers, FaHistory, FaLightbulb, FaHeart } from 'react-icons/fa';

const About = () => {
  const parallaxRef = useRef(null);
  const valuesRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({
    values: false,
    mission: false,
    team: false
  });

  // Scroll olayını dinle
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Bölümlerin görünürlüğünü kontrol et
      const checkVisibility = (ref, section) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.75) {
            setIsVisible(prev => ({ ...prev, [section]: true }));
          }
        }
      };
      
      checkVisibility(valuesRef, 'values');
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // İlk yükleme için kontrol et
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Değerlerimiz
  const values = [
    { icon: <FaHandshake />, title: 'Respect', description: 'Nous valorisons le respect mutuel et la dignité de chaque individu, indépendamment de son origine ou de sa culture.' },
    { icon: <FaGlobeEurope />, title: 'Diversité', description: 'Nous célébrons la richesse de la diversité culturelle et encourageons le partage des traditions et des perspectives.' },
    { icon: <FaUsers />, title: 'Inclusion', description: 'Nous nous efforçons de créer des espaces où chacun se sent bienvenu, valorisé et entendu.' },
    { icon: <FaLightbulb />, title: 'Innovation', description: 'Nous recherchons constamment de nouvelles façons de connecter les communautés et de promouvoir la compréhension interculturelle.' },
    { icon: <FaHeart />, title: 'Engagement', description: 'Nous sommes dévoués à notre mission et travaillons avec passion pour créer un impact positif dans la société.' }
  ];

  return (
    <div className={styles.aboutContainer}>
      {/* Hero Section with Parallax */}
      <div 
        className={styles.heroSection}
        ref={parallaxRef}
        style={{ 
          backgroundPositionY: `calc(50% + ${scrollY * 0.5}px)` 
        }}
      >
        <div className={styles.heroOverlay}>
          <h1 className={styles.heroTitle}>
            À Propos de <span>ACTION+</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Construire des ponts entre les cultures depuis 2025
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <div className={styles.missionContent}>
            <h2 className={styles.sectionTitle}>Notre Mission</h2>
            <div className={styles.separator}></div>
            <p className={styles.missionText}>
              Action Plus vise à promouvoir le dialogue interculturel, la diversité et la solidarité à travers des actions éducatives, culturelles et sociales. Nous organisons des activités pour transmettre les savoirs, renforcer les liens entre les générations, encourager la tolérance et la citoyenneté, et soutenir l'inclusion sociale.
            </p>
            <p className={styles.missionText}>
              Nous collaborons avec des acteurs locaux pour construire une société plus solidaire et inclusive. Notre approche est basée sur le respect, l'ouverture d'esprit et l'engagement communautaire.
            </p>
          </div>
        </div>
      </section>

      {/* Histoire Section */}
      <section className={styles.historySection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Notre Histoire</h2>
          <div className={styles.separator}></div>
          
          <div className={styles.timelineContainer}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <FaHistory />
              </div>
              <div className={styles.timelineContent}>
                <h3>04/04/2025</h3>
                <p>Adoption des statuts de l'association Action Plus.</p>
              </div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <FaHistory />
              </div>
              <div className={styles.timelineContent}>
                <h3>27/05/2025</h3>
                <p>Inscription de l'association au Tribunal judiciaire de METZ - Registre des associations.</p>
              </div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <FaHistory />
              </div>
              <div className={styles.timelineContent}>
                <h3>28/05/2025</h3>
                <p>Émission de l'attestation d'inscription avec le numéro de référence R2025MET001009.</p>
              </div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <FaHistory />
              </div>
              <div className={styles.timelineContent}>
                <h3>Aujourd'hui</h3>
                <p>Action Plus commence ses activités avec une équipe dévouée et une vision claire pour promouvoir le dialogue interculturel.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs Section */}
      <section className={styles.valuesSection} ref={valuesRef}>
        <div className={styles.container}>
          <div>
            <h2 className={styles.sectionTitle}>Nos Valeurs</h2>
            <div className={styles.separator}></div>
            
            <div className={styles.valuesGrid}>
              {values.map((value, index) => (
                <div 
                  key={index} 
                  className={`${styles.valueCard} ${isVisible.values ? styles.valueCardVisible : ''}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={styles.valueIcon}>
                    {value.icon}
                  </div>
                  <h3 className={styles.valueTitle}>{value.title}</h3>
                  <p className={styles.valueDescription}>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Rejoignez Notre Mouvement</h2>
          <p className={styles.ctaText}>
            Ensemble, nous pouvons construire un monde plus inclusif et culturellement riche. Participez à nos événements, devenez bénévole ou soutenez notre mission.
          </p>
          <div className={styles.ctaButtons}>
            <a href="/events" className={styles.ctaButton}>Voir Nos Événements</a>
            <a href="/contact" className={styles.ctaButtonOutline}>Nous Contacter</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
