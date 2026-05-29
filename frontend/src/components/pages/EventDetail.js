import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import styles from "./EventDetail.module.css";
import { useAuth } from "../../context/AuthContext";
import {
  FaCalendarAlt,
  FaUsers,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaShareAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { PAST_EVENTS } from "../../data/events";

// Yükleyici
export async function loader({ params }) {
  const ev = PAST_EVENTS.find((e) => String(e.slug) === String(params.slug));
  if (ev) return ev;
  throw new Response("Event not found", { status: 404 });
}

// Medya Listesi
const buildMediaList = (event) => {
  if (!event) return [];

  const seen = new Set();
  const media = [];

  const push = (type, rawUrl) => {
    if (!rawUrl) return;
    const url = rawUrl.startsWith("/uploads/")
      ? `${window.location.origin}${rawUrl}`
      : rawUrl;
    if (seen.has(url)) return;
    seen.add(url);
    media.push({ type, url });
  };

  // 1. Main thumbnail first
  push("image", event.image);

  // 2. Extra images (normalise: may be an array or a JSON string)
  const extraImages = normalizeArray(event.images);
  extraImages.forEach((img) => push("image", img));

  // 3. Videos
  const videos = normalizeArray(event.videos);
  videos.forEach((v) => push("video", v));

  // 4. Fallback
  if (media.length === 0) {
    getDummyImages(event).forEach((url) => push("image", url));
  }

  return media;
};

// Array Normalizer
const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

const getDummyImages = (evt) => {
  const title = (evt?.title || "").toLowerCase();

  if (
    title.includes("dîner") ||
    title.includes("diner") ||
    title.includes("ramadan")
  ) {
    return [
      "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    ];
  }
  if (
    title.includes("pique") ||
    title.includes("piquenique") ||
    title.includes("pique-nique")
  ) {
    return [
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    ];
  }
  if (title.includes("lecture") || title.includes("discussion")) {
    return [
      "https://images.unsplash.com/photo-1457694587812-e8bf29a43845?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=1200&q=80",
    ];
  }
  if (title.includes("aide") || title.includes("devoirs")) {
    return [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    ];
  }
  if (title.includes("kermesse")) {
    return [
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    ];
  }
  if (
    title.includes("séminaire") ||
    title.includes("seminaire") ||
    title.includes("conférence")
  ) {
    return [
      "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    ];
  }
  if (title.includes("assemblée") || title.includes("assemblee")) {
    return [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    ];
  }

  return [
    "https://images.unsplash.com/flagged/photo-1570569444087-3cf1c333a010?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  ];
};

const getCarouselSlots = (currentIndex, totalImages) => {
  if (totalImages === 0) return [];

  // For small galleries keep it simple: just show all images in order, active last shown as center.
  if (totalImages === 1) return [currentIndex];
  if (totalImages === 2) {
    return [currentIndex, (currentIndex + 1) % totalImages];
  }
  if (totalImages === 3) {
    return [
      (currentIndex - 1 + totalImages) % totalImages,
      currentIndex,
      (currentIndex + 1) % totalImages,
    ];
  }
  if (totalImages === 4) {
    return [
      (currentIndex - 1 + totalImages) % totalImages,
      currentIndex,
      (currentIndex + 1) % totalImages,
      (currentIndex + 2) % totalImages,
    ];
  }

  return [
    (currentIndex - 2 + totalImages) % totalImages,
    (currentIndex - 1 + totalImages) % totalImages,
    currentIndex,
    (currentIndex + 1) % totalImages,
    (currentIndex + 2) % totalImages,
  ];
};

// Slayt Sınıflandırması
const getSlideClass = (slotIndex, totalSlots, styles) => {
  const centerIndex = Math.floor(totalSlots / 2);
  const diff = slotIndex - centerIndex;

  if (diff === 0) return styles.activeSlide;
  if (diff === -1 || diff === 1)
    return `${styles.leftSlide || ""} ${styles.adjacentSlide || ""}`.trim();
  if (diff === -2 || diff === 2)
    return `${styles.leftSlide || ""} ${styles.farSlide || ""}`.trim();
  // fallback
  return slotIndex < centerIndex
    ? styles.leftSlide || ""
    : styles.rightSlide || "";
};

// Ana Bileşen
const EventDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, accessToken, isAdmin } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const carouselRef = useRef(null);

  // Build media list once event is loaded (memoised to avoid recalc on every render)
  const mediaList = event ? buildMediaList(event) : [];

  // Kayıt Kontrolü
  const checkRegistration = useCallback(async () => {
    if (!user || !accessToken) return;
    try {
      const baseUrl =
        process.env.REACT_APP_API_BASE_URL || window.location.origin;
      const response = await axios.get(
        `${baseUrl}/api/events/${slug}/check-registration`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setIsRegistered(response.data.registered);
    } catch (err) {
      console.error("Error checking registration:", err);
    }
  }, [user, accessToken, slug]);

  // Etkinlik Yükleme
  useEffect(() => {
    if (!slug) {
      setError("Paramètre slug manquant");
      setLoading(false);
      return;
    }

    const localEvent = PAST_EVENTS.find(
      (e) => String(e.slug).trim() === String(slug).trim(),
    );

    if (localEvent) {
      setEvent(localEvent);
      setLoading(false);
      // Arka planda kayıt durumunu kontrol et
      checkRegistration();
      return;
    }

    const baseUrl =
      process.env.REACT_APP_API_BASE_URL || window.location.origin;
    axios
      .get(`${baseUrl}/api/events/${slug}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
      .then((res) => {
        setEvent(res.data);
        checkRegistration();
      })
      .catch((err) => {
        console.error("Error fetching event from API:", err);
        setError("Impossible de charger les détails de l'événement");
      })
      .finally(() => setLoading(false));
  }, [slug, accessToken, checkRegistration]);

  // Karusel indeksini sıfırla
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [slug]);

  // Karusel Navigasyonu
  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      mediaList.length > 0
        ? (prev - 1 + mediaList.length) % mediaList.length
        : 0,
    );
  }, [mediaList.length]);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      mediaList.length > 0 ? (prev + 1) % mediaList.length : 0,
    );
  }, [mediaList.length]);

  // Admin İşlemleri
  const handleEditEvent = () => navigate(`/events/edit/${slug}`);

  const handleDeleteEvent = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet événement?"))
      return;
    try {
      const baseUrl =
        process.env.REACT_APP_API_BASE_URL || window.location.origin;
      await axios.delete(`${baseUrl}/api/events/${slug}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      alert("Événement supprimé avec succès!");
      navigate("/events");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Une erreur s'est produite lors de la suppression de l'événement.");
    }
  };

  // Paylaşım
  const handleShare = () => {
    const shareUrl = window.location.href;
    const shareText =
      `${event?.title || "Événement"} - ${event?.location || ""} - ${event?.date || ""}`.trim();
    if (navigator.share) {
      navigator
        .share({
          title: event?.title || "Événement",
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {});
      return;
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  // Render Gözetimi
  if (loading) return <div className={styles.loading}>Chargement...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!event) return <div className={styles.error}>Événement non trouvé</div>;

  // Karusel Konumları
  const slots = getCarouselSlots(currentImageIndex, mediaList.length);

  // Render
  return (
    <div className={styles.eventDetailContainer}>
      <Helmet>
        <title>{event.title} | Action Plus</title>
        <meta name="description" content={event.description} />
        <meta
          name="keywords"
          content={`${event.title}, ${event.location || ""}, Action Plus, événement`}
        />
        <link
          rel="canonical"
          href={`https://actionplusmetz.org/events/${slug}`}
        />
      </Helmet>

      {/* En-tête */}
      <div className={styles.eventDetailHeader}>
        <Link to="/events" className={styles.backButton}>
          <FaArrowLeft /> Retour aux événements
        </Link>
        {isAdmin && (
          <div className={styles.adminActions}>
            <button onClick={handleEditEvent} className={styles.editButton}>
              <FaEdit /> Modifier
            </button>
            <button onClick={handleDeleteEvent} className={styles.deleteButton}>
              <FaTrash /> Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Sinema Karuseli */}
      {mediaList.length > 0 && (
        <div className={styles.cinemaCarousel}>
          {mediaList.length > 1 && (
            <button
              className={`${styles.carouselButton} ${styles.prevButton}`}
              onClick={prevImage}
              aria-label="Image précédente"
            >
              <FaChevronLeft />
            </button>
          )}

          <div className={styles.carouselTrack} ref={carouselRef}>
            {slots.map((mediaIndex, slotPos) => {
              const media = mediaList[mediaIndex];
              if (!media) return null;

              const slideClass = getSlideClass(slotPos, slots.length, styles);

              return (
                <div
                  key={`slot-${slotPos}-idx-${mediaIndex}`}
                  className={`${styles.carouselSlide} ${slideClass}`}
                >
                  {media.type === "image" ? (
                    <img
                      src={media.url}
                      alt={`${event.title} — photo ${mediaIndex + 1}`}
                      className={styles.carouselImage}
                      onError={(e) => {
                        // Kırık görselleri zarif şekilde gizle
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <video
                      src={media.url}
                      className={styles.carouselVideo}
                      controls
                      muted
                      playsInline
                      loop
                      autoPlay={slotPos === Math.floor(slots.length / 2)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {mediaList.length > 1 && (
            <button
              className={`${styles.carouselButton} ${styles.nextButton}`}
              onClick={nextImage}
              aria-label="Image suivante"
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className={styles.eventContent}>
        <h1 className={styles.eventTitle}>{event.title}</h1>

        <div className={styles.eventMeta}>
          <div className={styles.metaItem}>
            <FaCalendarAlt className={styles.metaIcon} />
            <span>{event.date}</span>
          </div>
          {event.participant_count > 0 && (
            <div className={styles.metaItem}>
              <FaUsers className={styles.metaIcon} />
              <span>{event.participant_count} participants</span>
            </div>
          )}
        </div>

        <div className={styles.eventDescription}>
          <p>{event.description}</p>
        </div>

        {/* Standalone video section (for events with videos but no images) */}
        {normalizeArray(event.videos).length > 0 && (
          <div className={styles.eventVideos}>
            <h3 className={styles.sectionTitle}>Vidéos</h3>
            <div className={styles.videoGrid}>
              {normalizeArray(event.videos).map((videoUrl, index) => (
                <video
                  key={index}
                  src={videoUrl}
                  controls
                  className={styles.videoItem}
                />
              ))}
            </div>
          </div>
        )}

        <div className={styles.eventActions}>
          <button onClick={handleShare} className={styles.shareButton}>
            <FaShareAlt /> Partager
            <span className={styles.shareBadge}>
              <FaWhatsapp /> WhatsApp
            </span>
          </button>

          <button
            onClick={() => navigate("/events")}
            className={styles.backButton}
          >
            <FaArrowLeft /> Retour aux événements
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
