// ─────────────────────────────────────────────────────────────────────────────
// events.js  –  Source of truth for all static event data
//
// IMAGE PATH CONVENTION:
//   • All paths start with "/assets/" which maps to public/assets/ at runtime.
//   • CRA (Create React App) serves everything in /public as static files, so
//     "/assets/foo.png" in an <img src> will resolve to public/assets/foo.png.
//   • Never use relative paths ("../../assets/...") or webpack imports here
//     because this file is used both in list views and in detail views at
//     different route depths.
// ─────────────────────────────────────────────────────────────────────────────

export const PAST_EVENTS = [
  {
    id: 1,
    slug: "assemblee-generale-2026-a7f3b2k1",
    day: "06",
    month: "FÉVR.",
    category: "RENCONTRE",
    categoryColor: "rencontre",
    title: "Assemblée générale 2026",
    location: "13 Rte de Woippy, Metz",
    date: "6 février 2026",
    description:
      "Assemblée générale de l'association Action Plus. Programme : accueil des participants, rapport moral sur les activités 2025...",
    image: "/assets/genel-kurul.png",
    images: [],
  },
  {
    id: 2,
    slug: "reunion-hebdomadaire-discussion-lecture-m9k2p1x5",
    day: "07",
    month: "FÉVR.",
    category: "RENCONTRE",
    categoryColor: "rencontre",
    title: "Réunion hebdomadaire de discussion et de lecture",
    location: "Metz",
    date: "7 février 2026",
    description:
      "Réunions hebdomadaires de discussion et de lecture avec les adhérents. Objectif : créer un espace d'échange...",
    image: "/assets/books.png",
    images: [],
  },
  {
    id: 3,
    slug: "diner-interreligieux-ramadan-d4j8v3n2",
    day: "28",
    month: "FÉVR.",
    category: "RENCONTRE",
    categoryColor: "rencontre",
    title: "Dîner interreligieux du Ramadan",
    location: "Centre Socio-Culturel de Metz",
    date: "28 février 2026",
    description:
      "Dîner interreligieux à l'occasion du Ramadan, favorisant le dialogue et la rencontre entre les différentes communautés...",
    image: "/assets/iftar-afisi.png",
    images: [
      "/assets/iftar-2.png",
      "/assets/iftar-3.png",
      "/assets/iftar-1.png",
      "/assets/iftar-4.png",
    ],
  },
  {
    id: 4,
    slug: "diner-vivre-ensemble-ramadan-careme-r5q1w8z3",
    day: "22",
    month: "MARS",
    category: "RENCONTRE",
    categoryColor: "rencontre",
    title: "Dîner du Vivre Ensemble (Ramadan & Carême)",
    location: "Metz",
    date: "22 mars 2025",
    description:
      "Dîner du vivre-ensemble sur le thème du Ramadan et du Carême. Objectif : favoriser la rencontre interreligieuse...",
    image: "/assets/home-hero.png",
    images: [],
  },
  {
    id: 5,
    slug: "grand-piquenique-adherents-parc-yutz-c2t7h9f4",
    day: "20",
    month: "AVR.",
    category: "SORTIE",
    categoryColor: "sortie",
    title: "Grand pique-nique des adhérents (Parc de Yutz)",
    location: "Parc de Yutz",
    date: "20 avril 2025",
    description:
      "Grand pique-nique avec les adhérents et leurs familles au Parc de Yutz. Objectif : renforcer les liens...",
    image: "/assets/piknik.png",
    images: [],
  },
  {
    id: 6,
    slug: "seminaire-ecrivaine-hilal-nesin-b6m1s9l7",
    day: "15",
    month: "AVR.",
    category: "CULTURE",
    categoryColor: "culture",
    title: "Séminaire avec l'écrivaine Hilal Nesin",
    location: "Metz",
    date: "15 avril 2025",
    description:
      "Séminaire avec l'écrivaine Hilal Nesin autour de son livre « Albatros Firtinasi ». Objectif : promouvoir la lecture...",
    image: "/assets/hilal-nesin-seminer.png",
    images: [],
  },
  {
    id: 7,
    slug: "grand-piquenique-aid-adha-parc-yutz-e8n3p4v1",
    day: "15",
    month: "JUIN",
    category: "SORTIE",
    categoryColor: "sortie",
    title: "Grand pique-nique Aid al-Adha (Parc de Yutz)",
    location: "Parc de Yutz",
    date: "15 juin 2025",
    description:
      "Grand pique-nique pour Aid al-Adha au Parc de Yutz. Objectif : célébrer ensemble une fête culturelle...",
    image: "/assets/piknik.png",
    images: [],
  },
  {
    id: 8,
    slug: "aide-devoirs-lyceens-collegiens-j2k5r8x6",
    day: "13",
    month: "SEPT.",
    category: "ÉDUCATION",
    categoryColor: "education",
    title: "Aide aux devoirs (lycéens et collégiens)",
    location: "Metz",
    date: "13 septembre 2025",
    description:
      "Mise en place d'une aide aux devoirs le week-end pour les lycéens et collégiens des enfants d'adhérents...",
    image: "/assets/ders-yardimi.png",
    images: [],
  },
  {
    id: 9,
    slug: "diner-vivre-ensemble-laicite-o9g4u1m5",
    day: "05",
    month: "DÉC.",
    category: "RENCONTRE",
    categoryColor: "rencontre",
    title: "Dîner du Vivre Ensemble (Laïcité)",
    location: "Metz",
    date: "5 décembre 2025",
    description:
      "Dîner du vivre-ensemble sur le thème de la laïcité, avec l'intervention du professeur Christopher POLLMANN...",
    image: "/assets/home-hero.png",
    images: [],
  },
  {
    id: 10,
    slug: "conference-jon-pahl-h7d2y8k3",
    day: "23",
    month: "AVR.",
    category: "CULTURE",
    categoryColor: "culture",
    title: "Conférence de Jon Pahl",
    location: "Salle Graouly, Complexe Jeydie",
    date: "23 avril 2026",
    description:
      "Conférence animée par Jon Pahl sur le dialogue interreligieux et la coexistence pacifique. Un moment de réflexion partagée...",
    image: "/assets/jon-pahl-afis.png",
    images: [
      "/assets/jon-pahl-3.png",
      "/assets/jon-pahl-2.png",
      "/assets/jon-pahl-1.png",
      "/assets/jon-konferans.png",
    ],
  },
  {
    id: 11,
    slug: "partage-asure-abbatiale-sainte-croix-f5w9j1n2",
    day: "14",
    month: "MAI",
    category: "SOLIDARITÉ",
    categoryColor: "solidarite",
    title: "Partage de l'Aşure",
    location: "Abbatiale Sainte-Croix",
    date: "14 mai 2026",
    description:
      "Partage de l'Aşure, dessert traditionnel, symbole de partage et de fraternité entre les communautés. Venez nombreux !",
    image: "/assets/asure-afis.png",
    images: [
      "/assets/asure-2.png",
      "/assets/asure-3.png",
      "/assets/asure-afis.png",
      "/assets/asure-paylasimi.png",
    ],
  },

  {
    id: 13,
    slug: "diner-vivre-ensemble-mars-2026-b8c1v5m9",
    day: "20",
    month: "MARS",
    category: "RENCONTRE",
    categoryColor: "rencontre",
    title: "Dîner du Vivre Ensemble (Mars)",
    location: "Metz",
    date: "20 mars 2026",
    description:
      "Dîner du vivre-ensemble prévu en mars 2026 (date à définir). Objectif : maintenir un rendez-vous trimestriel favorisant la rencontre...",
    image: "/assets/home-hero.png",
    images: [
      "/assets/yemek-1.png",
      "/assets/yemek-2.png",
    ],
  },
  {
    id: 14,
    slug: "kermesse-grand-piquenique-printemps-e6p3i7s2",
    day: "17",
    month: "MAI",
    category: "SORTIE",
    categoryColor: "sortie",
    title: "Kermesse et grand pique-nique",
    location: "Metz",
    date: "17 mai 2026",
    description:
      "Organisation d'une kermesse et d'un grand pique-nique lors des périodes de fêtes. Objectif : proposer des activités...",
    image: "/assets/piknik.png",
    images: [],
  },
];
