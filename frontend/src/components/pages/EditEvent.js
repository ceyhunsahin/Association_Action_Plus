import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import styles from './EditEvent.module.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaImage, FaSave, FaArrowLeft } from 'react-icons/fa';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image: '',
    max_participants: 50
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Admin değilse, ana sayfaya yönlendir
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Etkinlik verilerini getir
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/events/${id}`);
        const eventData = response.data;
        
        // Tarih formatını düzelt (YYYY-MM-DD)
        let formattedDate = eventData.date;
        if (eventData.date && !eventData.date.includes('-')) {
          const date = new Date(eventData.date);
          formattedDate = date.toISOString().split('T')[0];
        }
        
        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          date: formattedDate || '',
          location: eventData.location || '',
          image: eventData.image || '',
          max_participants: eventData.max_participants || 50
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Impossible de charger les détails de l\'événement');
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

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
      console.log("Sending updated event data:", formData);
      
      const response = await axios.put(
        `http://localhost:8000/api/events/${id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Update response:', response.data);
      setSuccess(true);
      setLoading(false);
      
      // 2 saniye sonra etkinlik detay sayfasına yönlendir
      setTimeout(() => {
        navigate(`/events/${id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating event:', error);
      setError(error.response?.data?.detail || 'Une erreur s\'est produite lors de la mise à jour de l\'événement');
      setLoading(false);
    }
  };

  if (loading && !success) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className={styles.editEventContainer}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate(`/events/${id}`)}
        >
          <FaArrowLeft /> Retour
        </button>
        <h1 className={styles.title}>Modifier l'événement</h1>
      </div>
      
      {success && (
        <div className={styles.successMessage}>
          Événement mis à jour avec succès! Redirection...
        </div>
      )}
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      <form className={styles.editForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Titre *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Titre de l'événement"
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
              <FaImage className={styles.inputIcon} /> Image URL
            </label>
            <input
              type="text"
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
              placeholder="Nombre maximum de participants"
            />
          </div>
        </div>
        
        {formData.image && (
          <div className={styles.imagePreview}>
            <h3>Aperçu de l'image</h3>
            <img src={formData.image} alt="Aperçu" />
          </div>
        )}
        
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => navigate(`/events/${id}`)}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className={styles.saveButton}
            disabled={loading}
          >
            <FaSave /> Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent; 