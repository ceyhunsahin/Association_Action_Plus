import React from 'react';
import styles from './modal.module.css'; // Modal için CSS dosyası

const Modal = ({ message, onClose }) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <p>{message}</p>
                <button onClick={onClose} className={styles.closeButton}>
                    Fermer
                </button>
            </div>
        </div>
    );
};

export default Modal;