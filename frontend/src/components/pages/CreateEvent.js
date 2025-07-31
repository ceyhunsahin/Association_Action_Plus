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
    max_participants: 50,
    created_by: 1,
    created_at: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await axios.post('http://localhost:8000/api/upload-multiple-images', formData, {
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
      console.log("Sending event data:", formData);
      console.log("Using token:", accessToken);
      
      // Eğer resim dosyaları varsa önce yükle
      let imageUrls = formData.image ? [formData.image] : [];
      if (imageFiles.length > 0) {
        const uploadedImageUrls = await uploadImages();
        imageUrls = uploadedImageUrls;
      }
      
      // Event verilerini hazırla
      const eventData = {
        ...formData,
        image: imageUrls[0] || '', // İlk resmi ana resim olarak kullan
        images: imageUrls // Tüm resimleri images array'inde sakla
      };
      
      const response = await axios({
        method: 'post',
        url: 'http://localhost:8000/api/events',
        data: eventData,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Event created:', response.data);
      setLoading(false);
      
      // Başarılı mesajı göster
      alert('Événement créé avec succès!');
      
      // Etkinlik detay sayfasına yönlendir
      navigate(`/events/${response.data.id}`);
    } catch (err) {
      console.error('Error creating event:', err);
      console.error('Error response:', err.response);
      console.error('Error details:', err.response?.data);
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
            disabled={loading || uploadingImage}
          >
            {loading || uploadingImage ? 'Création...' : (
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