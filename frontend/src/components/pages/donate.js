import React, { useState, useEffect } from 'react';
import { FaHandHoldingHeart, FaRegCreditCard, FaPaypal, FaRegCheckCircle, FaSchool, FaBook, FaUsers, FaHeart } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import styles from './Donate.module.css';

const Donate = () => {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState('10');
  const [customAmount, setCustomAmount] = useState('');
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [donationError, setDonationError] = useState('');
  const [donationHistory, setDonationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  
  // Bağış geçmişini getir
  const fetchDonationHistory = async () => {
    if (!currentUser || !currentUser.id) return;
    
    try {
      setLoading(true);
      // Gerçek API çağrısı - şu an için mock veri kullanıyoruz
      // const response = await axios.get(`/api/donations/user/${currentUser.id}`);
      
      // Mock veri
      const mockDonations = [
        {
          id: '1',
          date: new Date().toISOString(),
          amount: 25,
          currency: 'EUR',
          paymentMethod: 'PayPal',
          status: 'COMPLETED'
        },
        {
          id: '2',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 50,
          currency: 'EUR',
          paymentMethod: 'Carte Bancaire',
          status: 'COMPLETED'
        }
      ];
      
      setDonationHistory(mockDonations);
      setLoading(false);
    } catch (error) {
      console.error('Bağış geçmişi alınamadı:', error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Kullanıcı giriş yapmışsa bağış geçmişini getir
    if (currentUser && currentUser.id) {
      fetchDonationHistory();
    }
  }, [currentUser]);
  
  // PayPal entegrasyonu için ayrı bir useEffect
  useEffect(() => {
    // Eğer PayPal zaten yüklendiyse tekrar yükleme
    if (paypalLoaded) return;
    
    // PayPal butonlarını manuel olarak oluştur
    const simulatePayPalDonation = () => {
      // Bağış miktarını kontrol et
      const donationAmount = getDonationAmount();
      if (!donationAmount || donationAmount <= 0) {
        setDonationError('Veuillez entrer un montant valide.');
        return;
      }
      
      // Başarılı bağış simülasyonu
      setTimeout(() => {
        // Bağış bilgilerini kaydet (gerçek API çağrısı yerine simülasyon)
        const donationData = {
          userId: currentUser?.id,
          amount: donationAmount,
          currency: "EUR",
          paymentMethod: "PayPal",
          transactionId: 'sim-' + Math.random().toString(36).substring(2, 15),
          status: 'COMPLETED',
          donorName: currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : 'Anonymous',
          donorEmail: currentUser?.email || 'anonymous@example.com',
          date: new Date().toISOString()
        };
        
        console.log('Simulated donation:', donationData);
        
        // Bağış başarılı mesajı göster
        setDonationSuccess(true);
        setDonationError('');
        
        // Bağış geçmişini güncelle
        if (currentUser && currentUser.id) {
          fetchDonationHistory();
        }
      }, 1500);
    };
    
    // PayPal butonlarını oluştur
    const container = document.getElementById('paypal-button-container');
    if (container) {
      // Mevcut içeriği temizle
      container.innerHTML = '';
      
      // Simüle edilmiş PayPal butonu oluştur
      const paypalButton = document.createElement('button');
      paypalButton.className = styles.paypalButton;
      paypalButton.innerHTML = '<span><FaPaypal /> Payer avec PayPal</span>';
      paypalButton.onclick = (e) => {
        e.preventDefault();
        simulatePayPalDonation();
      };
      
      container.appendChild(paypalButton);
      setPaypalLoaded(true);
    }
    
    // Kredi kartı butonu için
    const cardContainer = document.getElementById('card-button-container');
    if (cardContainer) {
      // Mevcut içeriği temizle
      cardContainer.innerHTML = '';
      
      // Simüle edilmiş kredi kartı butonu oluştur
      const cardButton = document.createElement('button');
      cardButton.className = styles.cardButton;
      cardButton.innerHTML = '<span><FaRegCreditCard /> Payer par carte</span>';
      cardButton.onclick = (e) => {
        e.preventDefault();
        simulatePayPalDonation(); // Aynı simülasyonu kullan
      };
      
      cardContainer.appendChild(cardButton);
    }
  }, [amount, customAmount, currentUser, paypalLoaded]);
  
  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };
  
  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    // Sadece sayısal değerlere izin ver
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setAmount('custom');
    }
  };
  
  const getDonationAmount = () => {
    if (amount === 'custom') {
      return parseFloat(customAmount) || 0;
    }
    return parseFloat(amount) || 0;
  };
  
  // Simüle edilmiş bağış işlemi
  const handleDonation = (e) => {
    e.preventDefault();
    
    // Bağış miktarını kontrol et
    const donationAmount = getDonationAmount();
    if (!donationAmount || donationAmount <= 0) {
      setDonationError('Veuillez entrer un montant valide.');
      return;
    }
    
    // Başarılı bağış simülasyonu
    setTimeout(() => {
      setDonationSuccess(true);
      setDonationError('');
      
      // Bağış geçmişini güncelle
      if (currentUser && currentUser.id) {
        fetchDonationHistory();
      }
    }, 1500);
  };
  
  return (
    <div className={styles.donateContainer}>
      <div className={styles.donateHeader}>
        <h1>Soutenez notre association</h1>
        <p>Votre don nous aide à continuer notre mission de préservation et de promotion de la culture.</p>
      </div>
      
      {donationSuccess && (
        <div className={`${styles.message} ${styles.success}`}>
          <FaRegCheckCircle /> Merci pour votre don ! Votre soutien est très apprécié.
        </div>
      )}
      
      {donationError && (
        <div className={`${styles.message} ${styles.error}`}>
          {donationError}
        </div>
      )}
      
      <div className={styles.donateContent}>
        <div className={styles.donateInfo}>
          <h2><FaHandHoldingHeart /> Pourquoi faire un don ?</h2>
          <p>
            Votre soutien financier est essentiel pour nous permettre de continuer à organiser des événements culturels, 
            des ateliers éducatifs et des programmes de sensibilisation à la culture.
          </p>
          
          <div className={styles.impactSection}>
            <h3>Votre impact</h3>
            <div className={styles.impactItems}>
              <div className={styles.impactItem}>
                <div className={styles.impactIcon}><FaSchool /></div>
                <h4>Éducation</h4>
                <p>Financer des ateliers et des programmes éducatifs pour les jeunes</p>
              </div>
              <div className={styles.impactItem}>
                <div className={styles.impactIcon}><FaBook /></div>
                <h4>Préservation</h4>
                <p>Aider à préserver et documenter notre patrimoine culturel</p>
              </div>
              <div className={styles.impactItem}>
                <div className={styles.impactIcon}><FaUsers /></div>
                <h4>Communauté</h4>
                <p>Soutenir les événements communautaires et les célébrations culturelles</p>
              </div>
            </div>
          </div>
          
          <div className={styles.taxInfo}>
            <h3>Avantages fiscaux</h3>
            <p>
              Votre don peut être déductible des impôts. Vous recevrez un reçu fiscal pour tout don supérieur à 20€.
            </p>
          </div>
        </div>
        
        <div className={styles.donateForm}>
          {donationSuccess ? (
            <div className={styles.thankYouMessage}>
              <FaRegCheckCircle size={50} />
              <h2>Merci pour votre générosité !</h2>
              <p>Votre don nous aidera à continuer notre mission.</p>
              <button 
                className={styles.newDonationButton}
                onClick={() => setDonationSuccess(false)}
              >
                Faire un autre don
              </button>
            </div>
          ) : (
            <>
              <h2><FaHeart /> Faire un don maintenant</h2>
              
              <div className={styles.amountSelector}>
                <h3>Choisissez un montant</h3>
                <div className={styles.amountOptions}>
                  <button 
                    className={`${styles.amountButton} ${amount === '10' ? styles.selected : ''}`}
                    onClick={() => handleAmountSelect('10')}
                  >
                    10€
                  </button>
                  <button 
                    className={`${styles.amountButton} ${amount === '25' ? styles.selected : ''}`}
                    onClick={() => handleAmountSelect('25')}
                  >
                    25€
                  </button>
                  <button 
                    className={`${styles.amountButton} ${amount === '50' ? styles.selected : ''}`}
                    onClick={() => handleAmountSelect('50')}
                  >
                    50€
                  </button>
                  <button 
                    className={`${styles.amountButton} ${amount === '100' ? styles.selected : ''}`}
                    onClick={() => handleAmountSelect('100')}
                  >
                    100€
                  </button>
                  <button 
                    className={`${styles.amountButton} ${amount === 'custom' ? styles.selected : ''}`}
                    onClick={() => handleAmountSelect('custom')}
                  >
                    Autre
                  </button>
                </div>
                
                {amount === 'custom' && (
                  <div className={styles.customAmount}>
                    <label htmlFor="customAmount">Montant personnalisé (€)</label>
                    <input
                      type="text"
                      id="customAmount"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Entrez un montant"
                    />
                  </div>
                )}
              </div>
              
              <div className={styles.paymentMethods}>
                <h3>Choisissez votre méthode de paiement</h3>
                
                <div className={styles.paymentButtons}>
                  <div className={styles.paymentOption}>
                    <h4><FaPaypal /> PayPal</h4>
                    <p>Sécurisé et rapide, pas besoin de compte PayPal</p>
                    <div id="paypal-button-container">
                      <button 
                        className={styles.paypalButton}
                        onClick={handleDonation}
                      >
                        <FaPaypal /> Payer avec PayPal
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.paymentOption}>
                    <h4><FaRegCreditCard /> Carte bancaire</h4>
                    <p>Paiement sécurisé par carte de crédit/débit</p>
                    <div id="card-button-container">
                      <button 
                        className={styles.cardButton}
                        onClick={handleDonation}
                      >
                        <FaRegCreditCard /> Payer par carte
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className={styles.securityInfo}>
            <p>
              <small>
                Toutes les transactions sont sécurisées et cryptées. 
                Nous ne stockons pas vos informations de carte de crédit.
              </small>
            </p>
          </div>
        </div>
      </div>
      
      {currentUser && currentUser.id && (
        <div className={styles.donationHistory}>
          <h2>Historique de vos dons</h2>
          
          {loading ? (
            <p>Chargement de votre historique...</p>
          ) : donationHistory.length > 0 ? (
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Méthode</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {donationHistory.map((donation) => (
                  <tr key={donation._id || donation.id}>
                    <td>{new Date(donation.date).toLocaleDateString()}</td>
                    <td>{donation.amount} {donation.currency}</td>
                    <td>{donation.paymentMethod}</td>
                    <td>
                      <span className={`${styles.status} ${styles[donation.status.toLowerCase()]}`}>
                        {donation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Vous n'avez pas encore fait de don.</p>
          )}
        </div>
      )}
      
      <div className={styles.contactSection}>
        <h2>Des questions ?</h2>
        <p>
          Pour toute question concernant les dons ou pour faire un don par un autre moyen, 
          n'hésitez pas à nous contacter à <a href="mailto:dons@association-culturelle.fr">dons@association-culturelle.fr</a> 
          ou par téléphone au +33 1 23 45 67 89.
        </p>
      </div>
    </div>
  );
};

export default Donate; 