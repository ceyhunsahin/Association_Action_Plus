import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './EventCreate.module.css';
import Modal from '../Modal/modal'; // Modal bileşenini içe aktar

const EventCreate = () => {
    const [eventData, setEventData] = useState({
        title: '',
        date: '',
        description: '',
        image: '',
    });
    const { user, accessToken } = useAuth(); // user ve accessToken'ı al
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false); // Modal'ın görünürlüğünü kontrol et
    const [modalMessage, setModalMessage] = useState(''); // Modal'da gösterilecek mesaj

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !accessToken) {
            alert('Vous devez vous connecter pour créer un événement!');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/eventcreate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(eventData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Erreur lors de la création de l\'événement');
            }

            const data = await response.json();
            console.log('Événement créé:', data);

            // Modal'ı göster ve mesajı ayarla
            setModalMessage('Événement créé avec succès!');
            setShowModal(true);

            // 2 saniye sonra modal'ı kapat ve events sayfasına yönlendir
            setTimeout(() => {
                setShowModal(false);
                navigate('/events');
            }, 2000);
        } catch (error) {
            console.error('Erreur:', error);
            setModalMessage(error.message || 'Erreur lors de la création de l\'événement');
            setShowModal(true);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Créer un nouvel événement</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="title" className={styles.label}>
                        Titre de l'événement:
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={eventData.title}
                        onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="date" className={styles.label}>
                        Date de l'événement:
                    </label>
                    <input
                        type="date"
                        id="date"
                        value={eventData.date}
                        onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description" className={styles.label}>
                        Description de l'événement:
                    </label>
                    <textarea
                        id="description"
                        value={eventData.description}
                        onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                        className={styles.textarea}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="image" className={styles.label}>
                        URL de l'image:
                    </label>
                    <input
                        type="text"
                        id="image"
                        value={eventData.image}
                        onChange={(e) => setEventData({ ...eventData, image: e.target.value })}
                        className={styles.input}
                        required
                    />
                </div>

                <button type="submit" className={styles.button}>
                    Créer l'événement
                </button>
            </form>

            {/* Modal'ı göster */}
            {showModal && (
                <Modal
                    message={modalMessage}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default EventCreate;