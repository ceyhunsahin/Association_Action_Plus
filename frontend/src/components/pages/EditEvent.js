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
  const baseUrl = process.env.REACT_APP_API_BASE_URL || window.location.origin;
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
  const [videoFiles, setVideoFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [uploadWarnings, setUploadWarnings] = useState([]);

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
        const response = await axios.get(`${baseUrl}/api/events/${id}`);
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
        if (eventData.videos && eventData.videos.length > 0) {
          setExistingVideos(eventData.videos);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Impossible de charger les détails de l\'événement');
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, baseUrl]);

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
      const warnings = [];
      const validFiles = [];
      files.forEach(file => {
        if (!file.type.startsWith('image/')) {
          warnings.push(`${file.name}: format image non supporté`);
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          warnings.push(`${file.name}: dépasse 5MB`);
          return;
        }
        validFiles.push(file);
      });
      if (warnings.length > 0) {
        setUploadWarnings(prev => [...prev, ...warnings]);
      }
      if (validFiles.length === 0) return;
      // Yeni dosyaları mevcut listeye ekle
      setImageFiles(prevFiles => [...prevFiles, ...validFiles]);
      
      // Preview'ları oluştur
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prevPreviews => [...prevPreviews, e.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVideosChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const warnings = [];
      const validFiles = [];
      files.forEach(file => {
        if (!file.type.startsWith('video/')) {
          warnings.push(`${file.name}: format vidéo non supporté`);
          return;
        }
        if (file.size > 50 * 1024 * 1024) {
          warnings.push(`${file.name}: dépasse 50MB`);
          return;
        }
        validFiles.push(file);
      });
      if (warnings.length > 0) {
        setUploadWarnings(prev => [...prev, ...warnings]);
      }
      if (validFiles.length === 0) return;
      setVideoFiles(prevFiles => [...prevFiles, ...validFiles]);
      validFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        setVideoPreviews(prevPreviews => [...prevPreviews, url]);
      });
    }
  };

  const removeImage = (index) => {
    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideoFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setVideoPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const removeExistingVideo = (index) => {
    setExistingVideos(prevVideos => prevVideos.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await axios.post(`${baseUrl}/api/upload-multiple-images`, formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadingImage(false);
      return response.data.uploaded_files
        .filter(file => file.type === 'image')
        .map(file => file.file_url);
    } catch (error) {
      console.error('Images upload error:', error);
      setUploadingImage(false);
      throw new Error('Resim yükleme hatası');
    }
  };

  const uploadVideos = async () => {
    if (videoFiles.length === 0) return [];
    setUploadingImage(true);
    try {
      const formData = new FormData();
      videoFiles.forEach(file => {
        formData.append('files', file);
      });
      const response = await axios.post(`${baseUrl}/api/upload-multiple-images`, formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadingImage(false);
      return response.data.uploaded_files
        .filter(file => file.type === 'video')
        .map(file => file.file_url);
    } catch (error) {
      console.error('Videos upload error:', error);
      setUploadingImage(false);
      throw new Error('Video yükleme hatası');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      
      // Eğer yeni resim dosyaları varsa önce yükle
      let imageUrls = [...existingImages]; // Mevcut resimleri koru
      if (imageFiles.length > 0) {
        const uploadedImageUrls = await uploadImages();
        imageUrls = [...imageUrls, ...uploadedImageUrls];
      }
      let videoUrls = [...existingVideos];
      if (videoFiles.length > 0) {
        const uploadedVideoUrls = await uploadVideos();
        videoUrls = [...videoUrls, ...uploadedVideoUrls];
      }
      
      // Event verilerini hazırla
      const eventData = {
        ...formData,
        image: imageUrls[0] || '', // İlk resmi ana resim olarak kullan
        images: imageUrls, // Tüm resimleri images array'inde sakla
        videos: videoUrls
      };
      
      await axios.put(
        `${baseUrl}/api/events/${id}`,
        eventData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
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
                multiple
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
            <div className={styles.formatInfo}>
              Formats image acceptés: JPG, JPEG, PNG, WEBP, GIF. Taille max: 5MB par image.
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="video">
              <FaImage className={styles.inputIcon} /> Vidéos de l'événement
            </label>
            <div className={styles.imageUploadContainer}>
              <input
                type="file"
                id="video"
                name="video"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                multiple
                onChange={handleVideosChange}
                className={styles.fileInput}
              />
              <label htmlFor="video" className={styles.fileInputLabel}>
                Ajouter une vidéo
              </label>
              {videoPreviews.length > 0 && (
                <div className={styles.multipleImagePreview}>
                  {videoPreviews.map((preview, index) => (
                    <div key={index} className={styles.previewItem}>
                      <video src={preview} controls />
                      <span className={styles.previewLabel}>{videoFiles[index]?.name}</span>
                      <button 
                        type="button" 
                        className={styles.removeButton}
                        onClick={() => removeVideo(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.imageCount}>
                {videoFiles.length > 0 && `${videoFiles.length} vidéo(s) sélectionnée(s)`}
              </div>
            </div>
            <div className={styles.formatInfo}>
              Formats vidéo acceptés: MP4, WEBM, OGG, MOV. Taille max: 50MB par vidéo.
            </div>
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

        {uploadWarnings.length > 0 && (
          <div className={styles.uploadWarnings}>
            {uploadWarnings.map((w, i) => (
              <div key={i}>{w}</div>
            ))}
          </div>
        )}
        
        {/* Mevcut resimler */}
        {existingImages.length > 0 && (
          <div className={styles.existingImagesContainer}>
            <h3>Images existantes</h3>
            <div className={styles.existingImagesGrid}>
              {existingImages.map((imageUrl, index) => (
                <div key={index} className={styles.existingImageItem}>
                  <img src={imageUrl.startsWith('/uploads/') ? `${baseUrl}${imageUrl}` : imageUrl} alt={`Visuel existant ${index + 1}`} />
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

        {existingVideos.length > 0 && (
          <div className={styles.existingImagesContainer}>
            <h3>Vidéos existantes</h3>
            <div className={styles.existingImagesGrid}>
              {existingVideos.map((videoUrl, index) => (
                <div key={index} className={styles.existingImageItem}>
                  <video src={videoUrl.startsWith('/uploads/') ? `${baseUrl}${videoUrl}` : videoUrl} controls />
                  <button 
                    type="button" 
                    className={styles.removeExistingButton}
                    onClick={() => removeExistingVideo(index)}
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
