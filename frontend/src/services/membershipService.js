import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || window.location.origin;

// Token'ı header'a ekle
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Kullanıcının mevcut üyelik bilgilerini getir
export const getMyMembership = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/membership/my-membership`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching membership:', error);
    throw error;
  }
};

// Üyeliği yenile
export const renewMembership = async (renewalData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/membership/renew`, renewalData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error renewing membership:', error);
    throw error;
  }
};

// Üyelik geçmişini getir
export const getMembershipHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/membership/history`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching membership history:', error);
    throw error;
  }
};

// Ödeme geçmişini getir
export const getPaymentHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/membership/payment-history`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

// Fatura indir
export const downloadInvoice = async (paymentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/membership/download-invoice/${paymentId}`, {
      headers: getAuthHeaders(),
      responseType: 'blob' // PDF dosyası için
    });
    
    // PDF dosyasını indir
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `facture_adhésion_${paymentId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};

// Admin: Yeni kullanıcı oluştur
export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/create-user`, userData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Admin: Yeni üyelik oluştur
export const createMembership = async (membershipData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/create-membership`, membershipData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating membership:', error);
    throw error;
  }
};
