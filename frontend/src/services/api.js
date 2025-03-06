import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token eklemek için
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Etkinlikler için API fonksiyonları
export const eventService = {
  // Tüm etkinlikleri getir
  getAllEvents: () => api.get('/events'),
  
  // ID'ye göre etkinlik getir
  getEventById: (id) => api.get(`/events/${id}`),
  
  // Yeni etkinlik oluştur
  createEvent: (eventData) => api.post('/events', eventData),
  
  // Etkinlik güncelle
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  
  // Etkinlik sil
  deleteEvent: (id) => api.delete(`/events/${id}`),
  
  // Etkinliğe katıl
  joinEvent: (id) => api.post(`/events/${id}/join`),
  
  // Etkinlikten ayrıl
  leaveEvent: (id) => api.post(`/events/${id}/leave`),
};

// Kullanıcı profili için API fonksiyonları
export const userService = {
  // Kullanıcı profilini getir
  getProfile: () => api.get('/users/profile'),
  
  // Profil güncelle
  updateProfile: (userData) => api.put('/users/profile', userData),
  
  // Kullanıcının katıldığı etkinlikleri getir
  getUserEvents: () => api.get('/users/events'),
};

// Bağış işlemleri için API fonksiyonları
export const donationService = {
  // Bağış yap
  makeDonation: (donationData) => api.post('/donations', donationData),
  
  // Bağış geçmişini getir
  getDonationHistory: () => api.get('/donations/history'),
};

export default api; 