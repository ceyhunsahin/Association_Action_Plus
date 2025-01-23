import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useLoaderData, useLocation, Link } from 'react-router-dom';
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
  const event = useLoaderData();  // Loader'dan gelen veriyi al
  const location = useLocation();
  const [showAllDetails, setShowAllDetails] = useState(false);

  const handleShowAllDetails = () => {
    setShowAllDetails(!showAllDetails);
  };

  if (!event) {
    return <div className={styles.error}>Événement non trouvé</div>;
  }

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
      <p className={styles.description}>
        {showAllDetails ? event.description : `${event.description.slice(0, 100)}...`}
      </p>
      {!showAllDetails && (
        <button onClick={handleShowAllDetails} className={styles.moreButton}>
          Voir plus
        </button>
      )}
      {showAllDetails && (
        <button onClick={handleShowAllDetails} className={styles.moreButton}>
          Voir moins
        </button>
      )}
      <p className={styles.date}>Date: {event.date}</p>
    </div>
  );
};

export default EventDetail;