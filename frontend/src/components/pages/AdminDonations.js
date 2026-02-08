import React, { useEffect, useState } from 'react';
import styles from './AdminDonations.module.css';
import { downloadDonationReceipt } from '../../services/donationService';

const AdminDonations = () => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/api/admin/donations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des dons');
      }
      const data = await response.json();
      setDonations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const approveDonation = async (donationId) => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/donations/${donationId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la validation');
      }
      setDonations(prev =>
        prev.map(d => d.id === donationId ? { ...d, status: 'COMPLETED' } : d)
      );
    } catch (err) {
      setError(err.message || 'Erreur');
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const pendingCount = donations.filter(d => (d.status || '').toUpperCase() !== 'COMPLETED').length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dons</h1>
        <div className={styles.pendingBadge}>
          {pendingCount} en attente
        </div>
      </div>
      {pendingCount > 0 && (
        <div className={styles.pendingAlert}>
          Vous avez <strong>{pendingCount}</strong> don(s) en attente de validation.
        </div>
      )}
      {loading && <div className={styles.loading}>Chargement...</div>}
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.list}>
        {donations.map(d => (
          <div key={d.id} className={styles.card}>
            <div className={styles.info}>
              <div><strong>Donateur:</strong> {d.donor_name}</div>
              <div><strong>Email:</strong> {d.donor_email}</div>
              <div><strong>Montant:</strong> {d.amount} {d.currency || 'EUR'}</div>
              <div><strong>Méthode:</strong> {d.payment_method}</div>
              <div><strong>Statut:</strong> {d.status}</div>
              <div><strong>Date:</strong> {new Date(d.created_at).toLocaleDateString('fr-FR')}</div>
              <div><strong>Transaction:</strong> {d.transaction_id}</div>
            </div>
            <div className={styles.actions}>
              {d.status !== 'COMPLETED' && (
                <button className={styles.approveButton} onClick={() => approveDonation(d.id)}>
                  Valider le don
                </button>
              )}
              {d.status === 'COMPLETED' && (
                <button className={styles.approveButton} onClick={() => downloadDonationReceipt(d.id, true)}>
                  Télécharger le reçu
                </button>
              )}
            </div>
          </div>
        ))}
        {(!loading && donations.length === 0) && (
          <div className={styles.empty}>Aucun don pour le moment.</div>
        )}
      </div>
    </div>
  );
};

export default AdminDonations;
