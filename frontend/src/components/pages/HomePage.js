import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import styles from "./HomePage.module.css";
const pillars = [
  {
    title: "Dialogue",
    color: "purple",
    description:
      "Favoriser l'écoute active et les échanges constructifs entre toutes les générations et cultures.",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="22"
          cy="22"
          r="10"
          stroke="#7B5EA7"
          strokeWidth="2.5"
          fill="none"
        />
        <circle
          cx="42"
          cy="22"
          r="10"
          stroke="#7B5EA7"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M12 48c0-8 8-13 20-13"
          stroke="#7B5EA7"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M52 48c0-8-8-13-20-13"
          stroke="#7B5EA7"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M28 22h8M22 28h12"
          stroke="#7B5EA7"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Solidarité",
    color: "orange",
    description:
      "Agir ensemble dans l'Eurométropole de Strasbourg et au-delà, pour ne laisser personne de côté.",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="14" r="8" fill="#F97316" opacity="0.9" />
        <path
          d="M10 52c0-12 10-20 22-20s22 8 22 20"
          stroke="#F97316"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M20 36c-4 2-8 6-10 10"
          stroke="#F97316"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M44 36c4 2 8 6 10 10"
          stroke="#F97316"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Éducation",
    color: "blue",
    description:
      "Transmettre les savoirs pour permettre à chacun de s'épanouir et de progresser librement.",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="12"
          y="16"
          width="40"
          height="32"
          rx="3"
          stroke="#38BDF8"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M32 16v32"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 28h20M12 36h20"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M32 24l8-6v28l-8-6"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    title: "Vivre ensemble",
    color: "green",
    description:
      "Célébrer la diversité culturelle et construire des ponts entre tous les acteurs de la société.",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="22"
          cy="20"
          r="8"
          stroke="#4ADE80"
          strokeWidth="2.5"
          fill="none"
        />
        <circle
          cx="42"
          cy="20"
          r="8"
          stroke="#4ADE80"
          strokeWidth="2.5"
          fill="none"
        />
        <circle
          cx="32"
          cy="36"
          r="8"
          stroke="#4ADE80"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M14 50c0-6 6-10 16-10M50 50c0-6-6-10-16-10"
          stroke="#4ADE80"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

// Yorumlar
const testimonials = [
  {
    initials: "SM",
    name: "Sophie Martin",
    since: "Membre depuis 2025",
    quote:
      "Action Plus m'a permis de découvrir de nouvelles cultures et de me faire des amis du monde entier. Les événements sont toujours enrichissants et bien organisés.",
  },
  {
    initials: "AB",
    name: "Ahmed Benali",
    since: "Membre depuis 2025",
    quote:
      "Grâce à Action Plus, j'ai pu partager ma culture et en apprendre davantage sur celles des autres. C'est une communauté vraiment accueillante et inclusive.",
  },
  {
    initials: "MG",
    name: "Maria Garcia",
    since: "Membre depuis 2025",
    quote:
      "Les ateliers d'Action Plus sont non seulement éducatifs mais aussi très amusants. J'ai appris beaucoup sur différentes traditions et coutumes.",
  },
];

// Projeler
const projects = [
  {
    tag: "Événement",
    tagColor: "orange",
    title: "Dîner du Dialogue",
    description:
      "Un repas convivial qui rassemble des personnes de cultures et de générations différentes autour d'échanges sincères et enrichissants.",
    date: "15 mars 2026",
    image: "/assets/home-hero.png",
  },
  {
    tag: "Solidarité",
    tagColor: "blue",
    title: "Distribution d'Achoura",
    description:
      "Chaque année, nous préparons et distribuons la bouillie d'Achoura aux familles et voisins, perpétuant ainsi une belle tradition de partage.",
    date: "25 juillet 2026",
    image: "/assets/asure-paylasimi.png",
  },
  {
    tag: "Culture & Foi",
    tagColor: "green",
    title: "Iftar du Dialogue",
    description:
      "Un iftar ouvert à tous pour briser le jeûne ensemble, favoriser la rencontre interculturelle et renforcer les liens de solidarité à Metz.",
    date: "12 mars 2026",
    image: "/assets/iftar-2.png",
  },
  {
    tag: "Conférence",
    tagColor: "purple",
    title: "Conférence – Jon  Pahl",
    description:
      "Une conférence inspirante animée par l'auteur Jon Pahl sur le dialogue entre les cultures, l'identité et la construction d'un avenir commun.",
    date: "8 novembre 2026",
    image: "/assets/jon-pahl-afis.png",
  },
];

const HomePage = () => {
  return (
    <div className={styles.page}>
      <Helmet>
        <title>Accueil | Action Plus</title>
        <meta
          name="description"
          content="Découvrez Action Plus, une association à Metz dédiée au dialogue interculturel, à la solidarité et à l'éducation pour un avenir meilleur."
        />
        <meta
          name="keywords"
          content="Metz, association, dialogue interculturel, solidarité, éducation, vivre ensemble"
        />
        <link rel="canonical" href="https://actionplusmetz.org/" />
      </Helmet>
      <main>
        {/* Banner */}
        <section className={styles.hero} id="accueil">
          <div className={styles.heroBg}>
            <div className={styles.heroBgOverlay} />
          </div>

          <div className={styles.heroFloatingCard} aria-hidden="true">
            <img src="/logo.svg" alt="" className={styles.heroFloatingLogo} />
            <div>
              <div className={styles.heroFloatingName}>Action +</div>
              <div className={styles.heroFloatingSub}>
                L'esprit vivre ensemble
              </div>
            </div>
          </div>

          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>L'esprit vivre ensemble</p>
            <h1 className={styles.heroTitle}>
              Construisons
              <br />
              un avenir solidaire
            </h1>
            <p className={styles.heroText}>
              Action Plus promeut le dialogue entre les cultures, la solidarité
              et l'éducation pour un monde plus inclusif et harmonieux.
            </p>
            <div className={styles.heroActions}>
              <Link to="/events" className={styles.heroBtnPrimary}>
                Découvrir nos actions →
              </Link>
            </div>
          </div>
        </section>

        {/* Misyon */}
        <section className={styles.pillarsSection} id="a-propos">
          <div className={styles.pillarsContainer}>
            {pillars.map((pillar) => (
              <article key={pillar.title} className={styles.pillarCard}>
                <div className={styles.pillarIconWrap}>{pillar.icon}</div>
                <h3
                  className={`${styles.pillarTitle} ${styles[`pillarTitle_${pillar.color}`]}`}
                >
                  {pillar.title.toUpperCase()}
                </h3>
                <p className={styles.pillarDesc}>{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Projeler */}
        <section className={styles.projectsSection} id="projets">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Nos réalisations</p>
                <h2 className={styles.sectionTitle}>Projets récents</h2>
              </div>
              <Link to="/events" className={styles.seeAllLink}>
                Voir tous les événements →
              </Link>
            </div>

            <div className={styles.projectsGrid}>
              {projects.map((project) => (
                <article key={project.title} className={styles.projectCard}>
                  <div
                    className={`${styles.projectCardTop} ${styles[`projectTop_${project.tagColor}`]}`}
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      className={styles.projectImage}
                      loading="lazy"
                    />
                    <div className={styles.projectImageOverlay} />
                    <span
                      className={`${styles.projectBadge} ${styles[`projectBadge_${project.tagColor}`]}`}
                    >
                      {project.tag}
                    </span>
                  </div>
                  <div className={styles.projectCardBody}>
                    <p className={styles.projectDate}>{project.date}</p>
                    <h3 className={styles.projectCardTitle}>{project.title}</h3>
                    <p className={styles.projectCardDesc}>
                      {project.description}
                    </p>
                    <Link to="/events" className={styles.projectLink}>
                      En savoir plus →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Görüşler */}
        <section className={styles.testimonialsSection} id="temoignages">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeaderCentered}>
              <p className={styles.eyebrow}>Témoignages</p>
              <h2 className={styles.sectionTitle}>Ce que disent nos membres</h2>
              <p className={styles.sectionSubtitle}>
                Ils nous font confiance et s'engagent à nos côtés chaque jour.
              </p>
            </div>

            <div className={styles.testimonialsGrid}>
              {testimonials.map((t) => (
                <article key={t.name} className={styles.testimonialCard}>
                  <div className={styles.testimonialStars}>★★★★★</div>
                  <p className={styles.testimonialQuote}>"{t.quote}"</p>
                  <hr className={styles.testimonialRule} />
                  <div className={styles.testimonialFooter}>
                    <div className={styles.avatar}>{t.initials}</div>
                    <div>
                      <div className={styles.testimonialName}>{t.name}</div>
                      <div className={styles.testimonialSince}>{t.since}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaBand}>
          <div className={styles.sectionContainer}>
            <div className={styles.ctaLayout}>
              <h2 className={styles.ctaTitle}>
                Rejoignez une communauté qui fait vraiment la différence à Metz.
              </h2>
              <div className={styles.ctaActions}>
                <Link to="/contact" className={styles.ctaBtnPrimary}>
                  Contact
                </Link>
                <Link to="/donate" className={styles.ctaBtnSecondary}>
                  Faire un don
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
