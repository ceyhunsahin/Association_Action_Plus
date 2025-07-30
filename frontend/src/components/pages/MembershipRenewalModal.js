import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaCreditCard, FaCheck } from 'react-icons/fa';
import styles from './MembershipRenewalModal.module.css';

const MembershipRenewalModal = ({ isOpen, onClose, onRenew, membership, loading }) => {
  const [selectedDuration, setSelectedDuration] = useState(12); // Ay cinsinden

  const durationOptions = [
    { value: 6, label: '6 mois', price: 15 },
    { value: 12, label: '1 an', price: 25 },
    { value: 24, label: '2 ans', price: 45 },
    { value: 36, label: '3 ans', price: 65 }
  ];

  const selectedDurationData = durationOptions.find(option => option.value === selectedDuration);

  const calculatePrice = () => {
    return selectedDurationData.price;
  };

  const calculateEndDate = () => {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + selectedDuration);
    return endDate.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleRenew = () => {
    onRenew({
      plan: 'standard',
      duration: selectedDuration,
      price: calculatePrice(),
      endDate: calculateEndDate()
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Renouveler votre adhésion</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Mevcut Üyelik Bilgileri */}
          <div className={styles.currentMembership}>
            <h3>Votre adhésion actuelle</h3>
            <div className={styles.currentInfo}>
              <p><strong>Statut:</strong> {membership?.status || 'Actif'}</p>
              <p><strong>Date de fin:</strong> {membership ? new Date(membership.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
              <p><strong>Renouvellements:</strong> {membership?.renewal_count || 0}</p>
            </div>
          </div>

          {/* Süre Seçimi */}
          <div className={styles.durationSelection}>
            <h3>Choisissez la durée</h3>
            <div className={styles.durationOptions}>
              {durationOptions.map(option => (
                <div 
                  key={option.value}
                  className={`${styles.durationOption} ${selectedDuration === option.value ? styles.selected : ''}`}
                  onClick={() => setSelectedDuration(option.value)}
                >
                  <div className={styles.durationLabel}>{option.label}</div>
                  <div className={styles.durationPrice}>{option.price}€</div>
                </div>
              ))}
            </div>
          </div>

          {/* Özet */}
          <div className={styles.summary}>
            <h3>Résumé de votre renouvellement</h3>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span>Plan:</span>
                <span>Adhésion Standard</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Durée:</span>
                <span>{`${selectedDuration} mois`}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Date de fin:</span>
                <span>{calculateEndDate()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Prix:</span>
                <span className={styles.totalPrice}>{calculatePrice()}€</span>
              </div>
            </div>
          </div>

          {/* Butonlar */}
          <div className={styles.modalActions}>
            <button 
              className={styles.cancelButton} 
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              className={styles.renewButton} 
              onClick={handleRenew}
              disabled={loading}
            >
              {loading ? 'Renouvellement en cours...' : `Renouveler (${calculatePrice()}€)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipRenewalModal; 