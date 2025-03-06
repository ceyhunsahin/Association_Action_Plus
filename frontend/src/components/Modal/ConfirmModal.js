import React from 'react';
import styles from './modal.module.css';

const ConfirmModal = ({ message, onConfirm, onCancel, confirmText = 'Confirmer', cancelText = 'Annuler' }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalButtons}>
          <button onClick={onCancel} className={styles.cancelButton}>
            {cancelText}
          </button>
          <button onClick={onConfirm} className={styles.confirmButton}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 