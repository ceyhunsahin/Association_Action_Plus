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

  // Ekip üyeleri
  const teamMembers = [
    {
      name: 'Sophie Laurent',
      role: 'Fondatrice & Présidente',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      bio: 'Passionnée par l\'éducation interculturelle depuis plus de 15 ans, Sophie a fondé ACTION+ avec la vision de créer des ponts entre les cultures.'
    },
    {
      name: 'Marc Dubois',
      role: 'Directeur des Programmes',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      bio: 'Avec une expérience de 10 ans dans le développement de programmes éducatifs, Marc supervise toutes nos initiatives culturelles.'
    },
    {
      name: 'Amina Ndiaye',
      role: 'Coordinatrice des Événements',
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      bio: 'Amina apporte son expertise en gestion d\'événements et sa passion pour la diversité culturelle à chaque projet qu\'elle coordonne.'
    }
  ];

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
            Construire des ponts entre les cultures depuis 2010
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
              ACTION+ est une association culturelle dédiée à la promotion de la diversité culturelle et à la création d'espaces de dialogue interculturel. Nous croyons au pouvoir transformateur des échanges culturels et travaillons à construire des ponts entre les différentes communautés.
            </p>
            <p className={styles.missionText}>
              À travers nos événements, ateliers et programmes éducatifs, nous visons à favoriser la compréhension mutuelle, célébrer la richesse de la diversité et encourager l'inclusion sociale. Notre approche est basée sur le respect, l'ouverture d'esprit et l'engagement communautaire.
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
                <h3>2010</h3>
                <p>Fondation d'ACTION+ par Sophie Laurent avec une vision claire : créer des espaces de dialogue interculturel.</p>
              </div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <FaHistory />
              </div>
              <div className={styles.timelineContent}>
                <h3>2013</h3>
                <p>Lancement de notre premier festival interculturel, réunissant plus de 500 participants de diverses origines.</p>
              </div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <FaHistory />
              </div>
              <div className={styles.timelineContent}>
                <h3>2016</h3>
                <p>Expansion de nos programmes éducatifs dans les écoles locales, touchant plus de 1000 jeunes chaque année.</p>
              </div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <FaHistory />
              </div>
              <div className={styles.timelineContent}>
                <h3>2019</h3>
                <p>Reconnaissance nationale pour notre travail avec le Prix de l'Innovation Sociale.</p>
              </div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <FaHistory />
              </div>
              <div className={styles.timelineContent}>
                <h3>Aujourd'hui</h3>
                <p>ACTION+ continue de grandir, avec une équipe dévouée et des partenariats stratégiques pour maximiser notre impact social.</p>
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

      {/* Notre Équipe Section */}
      <section className={styles.teamSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Notre Équipe</h2>
          <div className={styles.separator}></div>
          
          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <div key={index} className={styles.teamCard}>
                <div className={styles.teamImageContainer}>
                  <img src={member.image} alt={member.name} className={styles.teamImage} />
                </div>
                <h3 className={styles.teamName}>{member.name}</h3>
                <p className={styles.teamRole}>{member.role}</p>
                <p className={styles.teamBio}>{member.bio}</p>
              </div>
            ))}
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