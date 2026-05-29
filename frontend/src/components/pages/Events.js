import React, { useState, memo } from "react";
import { Helmet } from "react-helmet";
import styles from "./Events.module.css";
import { PAST_EVENTS } from "../../data/events";

const CATEGORIES = [
  "Tous",
  "Rencontres",
  "Culture",
  "Éducation",
  "Solidarité",
  "Sorties",
];

const CATEGORY_MAP = {
  Rencontres: "rencontre",
  Culture: "culture",
  Éducation: "education",
  Solidarité: "solidarite",
  Sorties: "sortie",
};

const MONTH_INDEX = {
  janvier: 0,
  janv: 0,
  février: 1,
  fevrier: 1,
  fevr: 1,
  mars: 2,
  avril: 3,
  avr: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  juil: 6,
  août: 7,
  aout: 7,
  septembre: 8,
  sept: 8,
  octobre: 9,
  oct: 9,
  novembre: 10,
  nov: 10,
  décembre: 11,
  decembre: 11,
  dec: 11,
};

const normalizeText = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .trim();

const getEventTimestamp = (event) => {
  if (!event?.date) return 0;

  const parts = event.date.trim().split(/\s+/);
  if (parts.length < 3) return 0;

  const day = Number.parseInt(parts[0], 10);
  const year = Number.parseInt(parts[parts.length - 1], 10);
  const monthKey = normalizeText(parts.slice(1, -1).join(" "));
  const monthIndex = MONTH_INDEX[monthKey];

  if (
    !Number.isFinite(day) ||
    !Number.isFinite(year) ||
    monthIndex === undefined
  ) {
    return 0;
  }

  return new Date(year, monthIndex, day).getTime();
};

/* Kategori Rozeti */
const CategoryBadge = ({ type }) => {
  const labels = {
    rencontre: "RENCONTRE",
    culture: "CULTURE",
    education: "ÉDUCATION",
    solidarite: "SOLIDARITÉ",
    sortie: "SORTIE",
  };
  return (
    <span className={`${styles.categoryBadge} ${styles[`cat_${type}`]}`}>
      {labels[type] || type.toUpperCase()}
    </span>
  );
};

/* Etkinlik Kartı */
const EventCard = memo(({ event }) => {
  const photoCount = event.images?.length ? event.images.length + 1 : 0;

  return (
    <div className={styles.eventCard}>
      <div className={styles.cardImageWrap}>
        <img
          src={event.image}
          alt={event.title}
          className={styles.cardImage}
          loading="lazy"
          onError={(e) => {
            e.target.src = "/assets/home-hero.png";
          }}
        />
        <div className={styles.dateBadge}>
          <span className={styles.dateBadgeDay}>{event.day}</span>
          <span className={styles.dateBadgeMonth}>{event.month}</span>
        </div>
        {photoCount > 0 && (
          <div className={styles.photoCountBadge}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="12"
              height="12"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            {photoCount} photos
          </div>
        )}
      </div>
      <div className={styles.cardBody}>
        <CategoryBadge type={event.categoryColor} />
        <h3 className={styles.cardTitle}>{event.title}</h3>
        <div className={styles.cardMeta}>
          <span className={styles.cardMetaRow}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {event.location}
          </span>
          <span className={styles.cardMetaRow}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {event.date}
          </span>
        </div>
        <p className={styles.cardDescription}>{event.description}</p>
        <a href={`/events/${event.slug}`} className={styles.cardLink}>
          Voir les détails →
        </a>
      </div>
    </div>
  );
});

/* Ana Bileşen */
const Events = () => {
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filteredEvents =
    activeCategory === "Tous"
      ? PAST_EVENTS
      : PAST_EVENTS.filter(
          (e) => e.categoryColor === CATEGORY_MAP[activeCategory],
        );

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => getEventTimestamp(b) - getEventTimestamp(a),
  );

  return (
    <div className={styles.eventsPage}>
      <Helmet>
        <title>Événements | Action Plus</title>
        <meta
          name="description"
          content="Découvrez nos événements passés et à venir : rencontres, culture, éducation, solidarité et sorties avec Action Plus."
        />
        <meta
          name="keywords"
          content="événements, activités, rencontres, culture, Metz, Action Plus"
        />
        <link rel="canonical" href="https://actionplusmetz.org/events" />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero}>
        <img
          src="/assets/event-bg.png"
          alt="Événements Action+"
          className={styles.heroBg}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.heroSubtitle}>NOS ÉVÉNEMENTS</p>
          <h1 className={styles.heroTitle}>Nos événements</h1>
          <p className={styles.heroDesc}>
            Découvrez les activités, rencontres et moments de partage organisés
            par Action+.
          </p>
        </div>
      </section>

      <div className={styles.pageContent}>
        {/* Gelecek Etkinlikler */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionTitleIcon}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            Événements à venir
          </h2>

          {/* Boş Durum */}
          <div className={styles.emptyState}>
            <div className={styles.emptyIllustration}>
              <svg
                viewBox="0 0 160 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.emptyCalendarSvg}
              >
                {/* Shadow */}
                <ellipse
                  cx="80"
                  cy="128"
                  rx="48"
                  ry="7"
                  fill="#e8e0f7"
                  opacity="0.7"
                />
                {/* Calendar body */}
                <rect
                  x="20"
                  y="28"
                  width="120"
                  height="90"
                  rx="10"
                  fill="white"
                  stroke="#ddd6fe"
                  strokeWidth="2"
                />
                {/* Calendar header */}
                <rect
                  x="20"
                  y="28"
                  width="120"
                  height="30"
                  rx="10"
                  fill="#7C3AED"
                  opacity="0.15"
                />
                <rect
                  x="20"
                  y="48"
                  width="120"
                  height="10"
                  rx="0"
                  fill="#7C3AED"
                  opacity="0.10"
                />
                {/* Rings */}
                <rect
                  x="50"
                  y="20"
                  width="8"
                  height="18"
                  rx="4"
                  fill="#7C3AED"
                />
                <rect
                  x="102"
                  y="20"
                  width="8"
                  height="18"
                  rx="4"
                  fill="#7C3AED"
                />
                {/* Grid lines */}
                <line
                  x1="20"
                  y1="68"
                  x2="140"
                  y2="68"
                  stroke="#ede9fe"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="85"
                  x2="140"
                  y2="85"
                  stroke="#ede9fe"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="102"
                  x2="140"
                  y2="102"
                  stroke="#ede9fe"
                  strokeWidth="1"
                />
                <line
                  x1="53"
                  y1="58"
                  x2="53"
                  y2="118"
                  stroke="#ede9fe"
                  strokeWidth="1"
                />
                <line
                  x1="87"
                  y1="58"
                  x2="87"
                  y2="118"
                  stroke="#ede9fe"
                  strokeWidth="1"
                />
                <line
                  x1="121"
                  y1="58"
                  x2="121"
                  y2="118"
                  stroke="#ede9fe"
                  strokeWidth="1"
                />
                {/* Dots */}
                <circle cx="37" cy="76" r="4" fill="#ddd6fe" />
                <circle cx="70" cy="76" r="4" fill="#ddd6fe" />
                <circle cx="104" cy="76" r="4" fill="#7C3AED" opacity="0.4" />
                <circle cx="37" cy="93" r="4" fill="#ddd6fe" />
                <circle cx="70" cy="93" r="4" fill="#ddd6fe" />
                <circle cx="104" cy="93" r="4" fill="#ddd6fe" />
                <circle cx="37" cy="110" r="4" fill="#ddd6fe" />
                {/* Flowers/leaves decoration */}
                <ellipse
                  cx="118"
                  cy="112"
                  rx="10"
                  ry="5"
                  fill="#a78bfa"
                  opacity="0.5"
                  transform="rotate(-30 118 112)"
                />
                <ellipse
                  cx="128"
                  cy="105"
                  rx="10"
                  ry="5"
                  fill="#7C3AED"
                  opacity="0.35"
                  transform="rotate(20 128 105)"
                />
                <circle cx="122" cy="109" r="4" fill="#7C3AED" opacity="0.5" />
                <ellipse
                  cx="112"
                  cy="118"
                  rx="8"
                  ry="4"
                  fill="#c4b5fd"
                  opacity="0.5"
                  transform="rotate(10 112 118)"
                />
              </svg>
            </div>
            <div className={styles.emptyText}>
              <h3 className={styles.emptyTitle}>Aucun événement à venir</h3>
              <p className={styles.emptyDesc}>
                De nouveaux événements sont en préparation.
                <br />
                Revenez bientôt pour découvrir nos prochaines rencontres.
              </p>
            </div>
          </div>
        </section>

        {/* Geçmiş Etkinlikler */}
        <section className={styles.section}>
          <div className={styles.pastHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionTitleIcon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              Événements passés
            </h2>

            {/* Filtreler */}
            <div className={styles.filters}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.filterPill} ${activeCategory === cat ? styles.filterActive : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Etkinlik Listesi */}
          <div className={styles.eventsGrid}>
            {sortedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Events;
