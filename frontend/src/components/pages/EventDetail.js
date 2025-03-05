import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLoaderData, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './EventDetail.module.css';

// Loader fonksiyonu
export async function loader({ params }) {
  try {
    const response = await axios.get(`http://localhost:8000/events/${params.id}`);
    return response.data;  // Backend'den gelen veriyi döndür
  } catch (error) {
    throw new Response("Event not found", { status: 404 });
  }
}

const EventDetail = () => {
  const { id } = useParams(); // id'yi kullan
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/events/${id}`);
        console.log('Event detail:', response.data);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Event detail error:', err);
        setError(err.response?.data?.detail || 'Erreur lors du chargement de l\'événement');
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [id]);

  if (loading) return <div className={styles.loading}>Chargement...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!event) return <div className={styles.error}>Événement non trouvé</div>;

  return (
    <div className={styles.container}>
      <Link to={location.state?.search || "/events"} className={styles.backLink}>
        Retour aux événements
      </Link>
      <h1 className={styles.title}>{event.title}</h1>
      <div className={styles.imageContainer}>
        <img
          src={event.image || "https://via.placeholder.com/800x400"}
          alt={event.title}
          className={styles.eventImage}
        />
      </div>
      <div className={styles.info}>
        <p className={styles.date}>Date: {event.date}</p>
        <p className={styles.description}>{event.description}</p>
        <p className={styles.participants}>
          Nombre de participants: {event.participant_count}
        </p>
      </div>
    </div>
  );
};

export default EventDetail;