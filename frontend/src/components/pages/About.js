import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import styles from "./About.module.css";
import {
  FaHandshake,
  FaGlobeEurope,
  FaUsers,
  FaHistory,
  FaLightbulb,
  FaHeart,
} from "react-icons/fa";

const About = () => {
  const parallaxRef = useRef(null);
  const valuesRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({ values: false });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      if (valuesRef.current) {
        const rect = valuesRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.78) {
          setIsVisible((prev) => ({ ...prev, values: true }));
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const values = [
    {
      icon: <FaHandshake />,
      title: "Respect",
      description:
        "Nous valorisons la dignité de chaque individu, indépendamment de son origine ou de sa culture.",
    },
    {
      icon: <FaGlobeEurope />,
      title: "Diversité",
      description:
        "Nous célébrons la richesse culturelle et encourageons le partage des traditions et perspectives.",
    },
    {
      icon: <FaUsers />,
      title: "Inclusion",
      description:
        "Nous créons des espaces où chacun se sent bienvenu, valorisé et entendu.",
    },
    {
      icon: <FaLightbulb />,
      title: "Innovation",
      description:
        "Nous cherchons de nouvelles façons de connecter les communautés et promouvoir la compréhension.",
    },
    {
      icon: <FaHeart />,
      title: "Engagement",
      description:
        "Nous travaillons avec passion pour créer un impact positif et durable dans la société.",
    },
  ];

  return (
    <div className={styles.aboutContainer}>
      <Helmet>
        <title>À Propos | Action Plus</title>
        <meta
          name="description"
          content="Découvrez l'histoire, la mission et les valeurs d'Action Plus. Construire des ponts entre les cultures depuis 2025."
        />
        <meta
          name="keywords"
          content="histoire, mission, valeurs, association Action Plus, Metz"
        />
        <link rel="canonical" href="https://actionplusmetz.org/about" />
      </Helmet>

      {/* Hero */}
      <div
        className={styles.heroSection}
        ref={parallaxRef}
        style={{ backgroundPositionY: `calc(50% + ${scrollY * 0.45}px)` }}
      >
        <div className={styles.heroOverlay}>
          <h1 className={styles.heroTitle}>
            À Propos de <span>ACTION+</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Construire des ponts entre les cultures depuis 2025
          </p>
        </div>
        <div className={styles.heroScrollHint}>Découvrir</div>
      </div>

      {/* Misyon */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <div className={styles.missionContent}>
            <h2 className={styles.sectionTitle}>Notre Mission</h2>
            <div className={styles.separator} />
            <p className={styles.missionText}>
              Action Plus promeut le dialogue interculturel, la diversité et la
              solidarité à travers des actions éducatives, culturelles et
              sociales — soirées iftar, festivals gastronomiques, conférences et
              rencontres intergénérationnelles.
            </p>
            <p className={styles.missionText}>
              Nous collaborons avec des acteurs locaux pour bâtir une société
              plus solidaire. Notre approche repose sur le respect, l'ouverture
              et l'engagement communautaire.
            </p>
          </div>
        </div>
      </section>

      {/* Tarihçe */}
      <section className={styles.historySection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Notre Histoire</h2>
          <div className={styles.separator} />
          <div className={styles.timelineContainer}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <FaHistory />
              </div>
              <div className={styles.timelineContent}>
                <h3>04 / 04 / 2025</h3>
                <p>Adoption des statuts de l'association Action Plus.</p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <FaHistory />
              </div>
              <div className={styles.timelineContent}>
                <h3>27 / 05 / 2025</h3>
                <p>
                  Inscription au Tribunal judiciaire de Metz — Registre des
                  associations.
                </p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <FaHistory />
              </div>
              <div className={styles.timelineContent}>
                <h3>28 / 05 / 2025</h3>
                <p>
                  Émission de l'attestation d'inscription — Réf. R2025MET001009.
                </p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <FaHistory />
              </div>
              <div className={styles.timelineContent}>
                <h3>Aujourd'hui</h3>
                <p>
                  Action Plus débute ses activités avec une équipe dévouée et
                  une vision claire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Değerler */}
      <section className={styles.valuesSection} ref={valuesRef}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Nos Valeurs</h2>
          <div className={styles.separator} />
          <div className={styles.valuesGrid}>
            {values.map((v, i) => (
              <div
                key={i}
                className={`${styles.valueCard} ${isVisible.values ? styles.valueCardVisible : ""}`}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className={styles.valueIcon}>{v.icon}</div>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDescription}>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>
            Rejoignez <em>Notre Mouvement</em>
          </h2>
          <p className={styles.ctaText}>
            Ensemble, construisons un espace où chaque culture trouve sa place.
            Participez à nos événements, devenez bénévole ou soutenez notre
            mission.
          </p>
          <div className={styles.ctaButtons}>
            <a href="/events" className={styles.ctaButton}>
              Voir Nos Événements
            </a>
            <a href="/contact" className={styles.ctaButtonOutline}>
              Nous Contacter
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
