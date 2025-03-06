import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import styles from './CreateEvent.module.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaImage, FaCheck } from 'react-icons/fa';

const CreateEvent = () => {
  const { accessToken, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image: '',
    max_participants: 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Admin değilse, ana sayfaya yönlendir
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/events',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Event created:', response.data);
      setLoading(false);
      
      // Başarılı mesajı göster
      alert('Événement créé avec succès!');
      
      // Etkinlik detay sayfasına yönlendir
      navigate(`/events/${response.data.id}`);
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.response?.data?.detail || 'Une erreur est survenue lors de la création de l\'événement');
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return <div className={styles.loading}>Redirection vers la page d'accueil...</div>;
  }

  return (
    <div className={styles.createEventContainer}>
      <h1 className={styles.pageTitle}>Créer un nouvel événement</h1>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.eventForm}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Titre de l'événement *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Entrez le titre de l'événement"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="Décrivez l'événement"
            rows={5}
          />
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="date">
              <FaCalendarAlt className={styles.inputIcon} /> Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="location">
              <FaMapMarkerAlt className={styles.inputIcon} /> Lieu *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              placeholder="Lieu de l'événement"
            />
          </div>
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="image">
              <FaImage className={styles.inputIcon} /> URL de l'image
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="URL de l'image (optionnel)"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="max_participants">
              <FaUsers className={styles.inputIcon} /> Nombre maximum de participants
            </label>
            <input
              type="number"
              id="max_participants"
              name="max_participants"
              value={formData.max_participants}
              onChange={handleInputChange}
              min="1"
              max="1000"
            />
          </div>
        </div>
        
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => navigate('/events')}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Création...' : (
              <>
                <FaCheck /> Créer l'événement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;