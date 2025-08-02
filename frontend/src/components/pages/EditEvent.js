import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import styles from './EditEvent.module.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaImage, FaSave, FaArrowLeft, FaCheck } from 'react-icons/fa';

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
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [existingImages, setExistingImages] = useState([]);

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
        const response = await axios.get(`https://association-action-plus.onrender.com/api/events/${id}`);
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
        
        // Mevcut resimleri ayarla
        if (eventData.images && eventData.images.length > 0) {
          setExistingImages(eventData.images);
        } else if (eventData.image) {
          setExistingImages([eventData.image]);
        }
        
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

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Yeni dosyaları mevcut listeye ekle
      setImageFiles(prevFiles => [...prevFiles, ...files]);
      
      // Preview'ları oluştur
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prevPreviews => [...prevPreviews, e.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'https://association-action-plus.onrender.com'}/api/upload-multiple-images`, formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadingImage(false);
      return response.data.uploaded_files.map(file => file.image_url);
    } catch (error) {
      console.error('Images upload error:', error);
      setUploadingImage(false);
      throw new Error('Resim yükleme hatası');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Sending updated event data:", formData);
      
      // Eğer yeni resim dosyaları varsa önce yükle
      let imageUrls = [...existingImages]; // Mevcut resimleri koru
      if (imageFiles.length > 0) {
        const uploadedImageUrls = await uploadImages();
        imageUrls = [...imageUrls, ...uploadedImageUrls];
      }
      
      // Event verilerini hazırla
      const eventData = {
        ...formData,
        image: imageUrls[0] || '', // İlk resmi ana resim olarak kullan
        images: imageUrls // Tüm resimleri images array'inde sakla
      };
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL || 'https://association-action-plus.onrender.com'}/api/events/${id}`,
        eventData,
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
              <FaImage className={styles.inputIcon} /> Images de l'événement
            </label>
            <div className={styles.imageUploadContainer}>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImagesChange}
                className={styles.fileInput}
              />
              <label htmlFor="image" className={styles.fileInputLabel}>
                Ajouter une image
              </label>
              {imagePreviews.length > 0 && (
                <div className={styles.multipleImagePreview}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className={styles.previewItem}>
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <span className={styles.previewLabel}>{imageFiles[index]?.name}</span>
                      <button 
                        type="button" 
                        className={styles.removeButton}
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.imageCount}>
                {imageFiles.length > 0 && `${imageFiles.length} image(s) sélectionnée(s)`}
              </div>
            </div>
            
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="Ou entrer une URL d'image (optionnel)"
              className={styles.urlInput}
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
        
        {/* Mevcut resimler */}
        {existingImages.length > 0 && (
          <div className={styles.existingImagesContainer}>
            <h3>Images existantes</h3>
            <div className={styles.existingImagesGrid}>
              {existingImages.map((imageUrl, index) => (
                <div key={index} className={styles.existingImageItem}>
                  <img src={imageUrl} alt={`Image existante ${index + 1}`} />
                  <button 
                    type="button" 
                    className={styles.removeExistingButton}
                    onClick={() => removeExistingImage(index)}
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
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
            disabled={loading || uploadingImage}
          >
            {loading || uploadingImage ? 'Mise à jour...' : (
              <>
                <FaSave /> Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent; 