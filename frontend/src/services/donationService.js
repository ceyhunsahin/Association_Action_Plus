import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000/api/donations';

// Bağış oluştur
export const createDonation = async (donationData) => {
  try {
    // Kullanıcı ID'sini ekle (eğer giriş yapmışsa)
    const formattedData = {
      amount: parseFloat(donationData.amount),
      currency: donationData.currency || 'EUR',
      payment_method: donationData.payment_method || 'card',
      donor_name: donationData.donor_name,
      donor_email: donationData.donor_email,
      user_id: donationData.user_id || null  // Kullanıcı ID'sini ekle
    };

    console.log("Gönderilen bağış verileri:", formattedData);
    
    const response = await axios.post(API_URL, formattedData);
    return response.data;
  } catch (error) {
    console.error("Bağış oluşturulamadı:", error);
    throw error;
  }
};

// Bağış makbuzu gönder
export const sendDonationReceipt = async (receiptData) => {
  try {
    const response = await axios.post(`${API_URL}/receipt`, receiptData);
    return response.data;
  } catch (error) {
    console.error("Makbuz gönderilemedi:", error);
    throw error;
  }
};

// Kullanıcının bağışlarını getir
export const getUserDonations = async (userId) => {
  try {
    // SQLite3 API endpoint'i
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Bağış geçmişi alınamadı:", error);
    return [];
  }
};

// Tüm bağışları getir (admin için)
export const getAllDonations = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Tüm bağışlar alınamadı:", error);
    throw error;
  }
};

// Bağış detaylarını getir
export const getDonation = async (donationId) => {
  try {
    const response = await axios.get(`${API_URL}/${donationId}`);
    return response.data;
  } catch (error) {
    console.error("Bağış detayları alınamadı:", error);
    throw error;
  }
}; 