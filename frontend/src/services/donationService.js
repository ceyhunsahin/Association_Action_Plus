import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || window.location.origin;

export const createDonation = async (donationData) => {
  const response = await axios.post(`${API_BASE_URL}/api/donations`, donationData);
  return response.data;
};

export const sendDonationReceipt = async (payload) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/donations/${payload.donationId}/send-receipt`,
    payload
  );
  return response.data;
};

export const getDonation = async (donationId) => {
  const response = await axios.get(`${API_BASE_URL}/api/donations/${donationId}`);
  return response.data;
};

export const getMyDonations = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/donations/me`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  return response.data;
};

export const downloadDonationReceipt = async (donationId, isAdmin = false) => {
  const url = isAdmin
    ? `${API_BASE_URL}/api/admin/donations/${donationId}/receipt`
    : `${API_BASE_URL}/api/donations/${donationId}/receipt`;
  const response = await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    responseType: 'blob'
  });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', `recu_don_${donationId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};
