import React from 'react';
import { Helmet } from 'react-helmet';
import styles from './About.module.css';
import { FaHandshake, FaGlobeAmericas, FaComments, FaUsers } from 'react-icons/fa';

const About = () => {
  return (
    <>
      <Helmet>
        <title>À propos | Action Plus</title>
        <meta name="description" content="Découvrez l'histoire, la mission et les valeurs d'Action Plus, une association dédiée au dialogue interculturel et à l'inclusion sociale." />
      </Helmet>
      
      <div className={styles.aboutPage}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1>À propos d'Action Plus</h1>
            <p>Une association dédiée au dialogue interculturel et à l'inclusion sociale</p>
          </div>
        </section>
        
        <section className={styles.missionSection}>
          <div className={styles.container}>
            <h2>Notre Mission</h2>
            <p className={styles.missionText}>
              Action Plus est une association à but non lucratif fondée en 2010 avec pour mission de promouvoir le dialogue interculturel, 
              l'inclusion sociale et la compréhension mutuelle entre les différentes communautés culturelles en France.
            </p>
            <p className={styles.missionText}>
              Nous croyons fermement que la diversité culturelle est une richesse pour notre société et que le dialogue 
              est le meilleur moyen de construire des ponts entre les différentes cultures et traditions.
            </p>
          </div>
        </section>
        
        <section className={styles.valuesSection}>
          <div className={styles.container}>
            <h2>Nos Valeurs</h2>
            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}><FaHandshake /></div>
                <h3>Solidarité</h3>
                <p>Nous croyons en l'entraide et au soutien mutuel pour construire une communauté forte.</p>
              </div>
              
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}><FaGlobeAmericas /></div>
                <h3>Diversité</h3>
                <p>Nous célébrons les différences culturelles comme une richesse pour notre société.</p>
              </div>
              
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}><FaComments /></div>
                <h3>Dialogue</h3>
                <p>Nous encourageons l'échange et la communication pour mieux se comprendre.</p>
              </div>
              
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}><FaUsers /></div>
                <h3>Respect</h3>
                <p>Nous valorisons chaque individu et promouvons la dignité humaine.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className={styles.historySection}>
          <div className={styles.container}>
            <h2>Notre Histoire</h2>
            <div className={styles.historyContent}>
              <div className={styles.historyText}>
                <p>
                  Action Plus a été fondée en 2010 par un groupe de personnes passionnées par le dialogue interculturel et l'inclusion sociale. 
                  Au départ, l'association organisait de petits événements culturels dans le quartier de Belleville à Paris.
                </p>
                <p>
                  Au fil des années, Action Plus a grandi et a étendu ses activités à travers toute la France. Aujourd'hui, 
                  nous comptons plus de 450 membres actifs et organisons plus de 100 événements par an.
                </p>
                <p>
                  Notre engagement pour la promotion du dialogue interculturel nous a valu plusieurs reconnaissances, 
                  dont le Prix de la Diversité Culturelle en 2018 et le Prix de l'Innovation Sociale en 2020.
                </p>
              </div>
              <div className={styles.historyTimeline}>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineDate}>2010</div>
                  <div className={styles.timelineContent}>
                    <h4>Fondation</h4>
                    <p>Création de l'association Action Plus à Paris</p>
                  </div>
                </div>
                
                <div className={styles.timelineItem}>
                  <div className={styles.timelineDate}>2013</div>
                  <div className={styles.timelineContent}>
                    <h4>Expansion</h4>
                    <p>Ouverture de notre premier bureau à Lyon</p>
                  </div>
                </div>
                
                <div className={styles.timelineItem}>
                  <div className={styles.timelineDate}>2016</div>
                  <div className={styles.timelineContent}>
                    <h4>Reconnaissance</h4>
                    <p>Obtention du statut d'association d'utilité publique</p>
                  </div>
                </div>
                
                <div className={styles.timelineItem}>
                  <div className={styles.timelineDate}>2018</div>
                  <div className={styles.timelineContent}>
                    <h4>Prix</h4>
                    <p>Récompensée par le Prix de la Diversité Culturelle</p>
                  </div>
                </div>
                
                <div className={styles.timelineItem}>
                  <div className={styles.timelineDate}>2020</div>
                  <div className={styles.timelineContent}>
                    <h4>Innovation</h4>
                    <p>Lancement de notre plateforme numérique</p>
                  </div>
                </div>
                
                <div className={styles.timelineItem}>
                  <div className={styles.timelineDate}>2023</div>
                  <div className={styles.timelineContent}>
                    <h4>Aujourd'hui</h4>
                    <p>Plus de 450 membres actifs dans 25 pays</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className={styles.teamSection}>
          <div className={styles.container}>
            <h2>Notre Équipe</h2>
            <div className={styles.teamGrid}>
              <div className={styles.teamMember}>
                <div className={styles.memberPhoto} style={{backgroundImage: 'url(https://randomuser.me/api/portraits/men/32.jpg)'}}></div>
                <h3>Jean Dupont</h3>
                <p className={styles.memberRole}>Président</p>
                <p className={styles.memberBio}>Passionné par le dialogue interculturel depuis plus de 20 ans, Jean a fondé Action Plus en 2010.</p>
              </div>
              
              <div className={styles.teamMember}>
                <div className={styles.memberPhoto} style={{backgroundImage: 'url(https://randomuser.me/api/portraits/women/44.jpg)'}}></div>
                <h3>Marie Laurent</h3>
                <p className={styles.memberRole}>Vice-présidente</p>
                <p className={styles.memberBio}>Spécialiste en médiation culturelle, Marie coordonne nos programmes éducatifs.</p>
              </div>
              
              <div className={styles.teamMember}>
                <div className={styles.memberPhoto} style={{backgroundImage: 'url(https://randomuser.me/api/portraits/men/68.jpg)'}}></div>
                <h3>Ahmed Benali</h3>
                <p className={styles.memberRole}>Secrétaire Général</p>
                <p className={styles.memberBio}>Expert en relations internationales, Ahmed gère nos partenariats stratégiques.</p>
              </div>
              
              <div className={styles.teamMember}>
                <div className={styles.memberPhoto} style={{backgroundImage: 'url(https://randomuser.me/api/portraits/women/65.jpg)'}}></div>
                <h3>Sophie Martin</h3>
                <p className={styles.memberRole}>Trésorière</p>
                <p className={styles.memberBio}>Avec son expertise en finance, Sophie assure la bonne gestion des ressources de l'association.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className={styles.joinSection}>
          <div className={styles.container}>
            <h2>Rejoignez-nous</h2>
            <p className={styles.joinText}>
              Vous partagez nos valeurs et notre vision ? Rejoignez Action Plus et participez à la construction d'une société plus inclusive et respectueuse de la diversité culturelle.
            </p>
            <div className={styles.joinButtons}>
              <a href="/register" className={styles.primaryButton}>Devenir membre</a>
              <a href="/donate" className={styles.secondaryButton}>Faire un don</a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;