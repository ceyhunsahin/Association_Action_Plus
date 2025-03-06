import React, { useState, useEffect } from 'react';
import { FaHandHoldingHeart, FaRegCreditCard, FaPaypal, FaRegCheckCircle, FaSchool, FaBook, FaUsers, FaHeart, FaCreditCard as FaCreditCardIcon, FaUniversity, FaInfoCircle } from 'react-icons/fa';
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
  const [loading, setLoading] = useState(true);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [bankInfo, setBankInfo] = useState({});

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
  
  useEffect(() => {
    // .env dosyasından banka bilgilerini al
    const fetchBankInfo = async () => {
      try {
        // Doğrudan process.env'den değerleri alalım
        const bankInfo = {
          bankName: process.env.REACT_APP_BANK_NAME || 'Banque Nationale',
          accountName: process.env.REACT_APP_ACCOUNT_NAME || 'Association Culturelle',
          iban: process.env.REACT_APP_IBAN || 'FR76 XXXX XXXX XXXX XXXX XXXX XXX',
          bic: process.env.REACT_APP_BIC || 'BNPAFRPPXXX',
        };
        
        setBankInfo(bankInfo);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bank info:', err);
        setDonationError('Impossible de charger les informations bancaires');
        setLoading(false);
      }
    };

    fetchBankInfo();
  }, []);
  
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

  const handleAmountChange = (e) => {
    setDonationAmount(e.target.value);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Bağış işlemi için gerekli kodlar
    console.log('Donation amount:', donationAmount);
    console.log('Payment method:', paymentMethod);
    
    // Burada gerçek ödeme işlemi yapılacak
    alert(`Merci pour votre don de ${donationAmount}€ ! Votre soutien est précieux.`);
    
    // Formu sıfırla
    setDonationAmount('');
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  if (donationError) {
    return <div className={styles.error}>{donationError}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FaHandHoldingHeart className={styles.icon} />
        <h1>Faire un don</h1>
        <p className={styles.subtitle}>
          Votre soutien nous aide à continuer notre mission de préservation et de promotion de notre patrimoine culturel.
        </p>
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
      
      <div className={styles.content}>
        <div className={styles.donationInfo}>
          <h2>Pourquoi faire un don ?</h2>
          <p>
            Vos dons nous permettent de :
          </p>
          <ul>
            <li>Organiser des événements culturels pour la communauté</li>
            <li>Soutenir les artistes et artisans locaux</li>
            <li>Préserver notre patrimoine culturel pour les générations futures</li>
            <li>Offrir des programmes éducatifs pour les jeunes</li>
          </ul>
          
          <div className={styles.taxInfo}>
            <FaInfoCircle />
            <p>
              Vos dons peuvent être déductibles d'impôts. Un reçu fiscal vous sera envoyé pour tout don supérieur à 20€.
            </p>
          </div>
        </div>
        
        <div className={styles.donationForm}>
          <h2>Faire un don maintenant</h2>
          
          <div className={styles.paymentMethods}>
            <button 
              className={`${styles.methodButton} ${paymentMethod === 'card' ? styles.active : ''}`}
              onClick={() => handlePaymentMethodChange('card')}
            >
              <FaCreditCardIcon />
              <span>Carte bancaire</span>
            </button>
            <button 
              className={`${styles.methodButton} ${paymentMethod === 'bank' ? styles.active : ''}`}
              onClick={() => handlePaymentMethodChange('bank')}
            >
              <FaUniversity />
              <span>Virement bancaire</span>
            </button>
          </div>
          
          {paymentMethod === 'card' ? (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="amount">Montant du don (€)</label>
                <input 
                  type="number" 
                  id="amount" 
                  value={donationAmount} 
                  onChange={handleAmountChange}
                  min="1"
                  required
                  placeholder="Entrez le montant"
                />
              </div>
              
              <div className={styles.presetAmounts}>
                <button type="button" onClick={() => setDonationAmount('10')}>10€</button>
                <button type="button" onClick={() => setDonationAmount('20')}>20€</button>
                <button type="button" onClick={() => setDonationAmount('50')}>50€</button>
                <button type="button" onClick={() => setDonationAmount('100')}>100€</button>
              </div>
              
              <button type="submit" className={styles.submitButton}>
                Faire un don
              </button>
            </form>
          ) : (
            <div className={styles.bankTransferInfo}>
              <h3>Coordonnées bancaires</h3>
              <p>Pour effectuer un virement bancaire, veuillez utiliser les informations suivantes :</p>
              
              <div className={styles.bankDetails}>
                <div className={styles.bankDetail}>
                  <span className={styles.label}>Banque :</span>
                  <span className={styles.value}>{bankInfo.bankName}</span>
                </div>
                <div className={styles.bankDetail}>
                  <span className={styles.label}>Titulaire du compte :</span>
                  <span className={styles.value}>{bankInfo.accountName}</span>
                </div>
                <div className={styles.bankDetail}>
                  <span className={styles.label}>IBAN :</span>
                  <span className={styles.value}>{bankInfo.iban}</span>
                </div>
                <div className={styles.bankDetail}>
                  <span className={styles.label}>BIC/SWIFT :</span>
                  <span className={styles.value}>{bankInfo.bic}</span>
                </div>
              </div>
              
              <p className={styles.bankTransferNote}>
                Veuillez indiquer "Don" et votre nom dans la référence du virement pour nous permettre d'identifier votre don.
              </p>
            </div>
          )}
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