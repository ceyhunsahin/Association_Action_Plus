import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import styles from './DonatePage.module.css';
import { FaPaypal, FaCreditCard, FaUniversity, FaHeart, FaHandHoldingHeart, FaHandsHelping } from 'react-icons/fa';

const DonatePage = () => {
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [showBankDetails, setShowBankDetails] = useState(false);

  const handleAmountClick = (amount) => {
    setDonationAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    setCustomAmount(e.target.value);
    setDonationAmount('custom');
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === 'bank') {
      setShowBankDetails(true);
    } else {
      setShowBankDetails(false);
    }
  };

  const handleDonateClick = () => {
    const amount = donationAmount === 'custom' ? customAmount : donationAmount;
    if (!amount) {
      alert('Veuillez sélectionner ou saisir un montant');
      return;
    }

    if (paymentMethod === 'paypal') {
      // PayPal bağış sayfasına yönlendir
      window.open(`https://www.paypal.com/donate?hosted_button_id=YOUR_PAYPAL_BUTTON_ID&amount=${amount}`, '_blank');
    } else if (paymentMethod === 'card') {
      // Kredi kartı ödeme sayfasına yönlendir
      alert('Redirection vers la page de paiement par carte...');
    }
  };

  return (
    <>
      <Helmet>
        <title>Faire un don | Action Plus</title>
        <meta name="description" content="Soutenez Action Plus en faisant un don pour aider à promouvoir le dialogue interculturel et l'inclusion sociale." />
      </Helmet>
      
      <div className={styles.donatePage}>
        <div className={styles.donateHeader}>
          <h1>Faire un don à Action Plus</h1>
          <p>Votre soutien nous aide à continuer notre mission de promotion du dialogue interculturel</p>
        </div>
        
        <div className={styles.donateContent}>
          <div className={styles.donateOptions}>
            <h2>Choisissez le montant de votre don</h2>
            
            <div className={styles.donateAmounts}>
              <button 
                className={`${styles.donateAmount} ${donationAmount === '5' ? styles.active : ''}`}
                onClick={() => handleAmountClick('5')}
              >
                5€
              </button>
              <button 
                className={`${styles.donateAmount} ${donationAmount === '10' ? styles.active : ''}`}
                onClick={() => handleAmountClick('10')}
              >
                10€
              </button>
              <button 
                className={`${styles.donateAmount} ${donationAmount === '20' ? styles.active : ''}`}
                onClick={() => handleAmountClick('20')}
              >
                20€
              </button>
              <button 
                className={`${styles.donateAmount} ${donationAmount === '50' ? styles.active : ''}`}
                onClick={() => handleAmountClick('50')}
              >
                50€
              </button>
              <button 
                className={`${styles.donateAmount} ${donationAmount === '100' ? styles.active : ''}`}
                onClick={() => handleAmountClick('100')}
              >
                100€
              </button>
              <div className={styles.customAmount}>
                <label htmlFor="customAmount">Autre montant:</label>
                <input 
                  type="number" 
                  id="customAmount" 
                  min="1" 
                  placeholder="€" 
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                />
              </div>
            </div>
            
            <div className={styles.donateFrequency}>
              <h3>Fréquence</h3>
              <div className={styles.frequencyOptions}>
                <label>
                  <input type="radio" name="frequency" value="once" defaultChecked />
                  <span>Don unique</span>
                </label>
                <label>
                  <input type="radio" name="frequency" value="monthly" />
                  <span>Don mensuel</span>
                </label>
                <label>
                  <input type="radio" name="frequency" value="yearly" />
                  <span>Don annuel</span>
                </label>
              </div>
            </div>
            
            <div className={styles.paymentMethods}>
              <h3>Méthode de paiement</h3>
              <div className={styles.paymentOptions}>
                <button 
                  className={`${styles.paymentOption} ${paymentMethod === 'paypal' ? styles.active : ''}`}
                  onClick={() => handlePaymentMethodChange('paypal')}
                >
                  <FaPaypal />
                  <span>PayPal</span>
                </button>
                <button 
                  className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.active : ''}`}
                  onClick={() => handlePaymentMethodChange('card')}
                >
                  <FaCreditCard />
                  <span>Carte bancaire</span>
                </button>
                <button 
                  className={`${styles.paymentOption} ${paymentMethod === 'bank' ? styles.active : ''}`}
                  onClick={() => handlePaymentMethodChange('bank')}
                >
                  <FaUniversity />
                  <span>Virement bancaire</span>
                </button>
              </div>
            </div>
            
            {showBankDetails ? (
              <div className={styles.bankDetails}>
                <h3>Coordonnées bancaires</h3>
                <div className={styles.bankInfo}>
                  <p><strong>Titulaire du compte:</strong> Association Action Plus</p>
                  <p><strong>IBAN:</strong> FR76 1234 5678 9123 4567 8912 345</p>
                  <p><strong>BIC/SWIFT:</strong> ABCDEFGHIJK</p>
                  <p><strong>Banque:</strong> Banque Nationale de Paris</p>
                  <p><strong>Référence:</strong> DON-{new Date().getFullYear()}</p>
                </div>
                <div className={styles.bankNote}>
                  <p>Veuillez inclure la référence dans votre virement pour nous aider à identifier votre don.</p>
                </div>
              </div>
            ) : (
              <button 
                className={styles.donateButton}
                onClick={handleDonateClick}
              >
                Faire un don maintenant
              </button>
            )}
          </div>
          
          <div className={styles.donateInfo}>
            <div className={styles.impactSection}>
              <h2>Votre impact</h2>
              <div className={styles.impactItems}>
                <div className={styles.impactItem}>
                  <div className={styles.impactIcon}><FaHeart /></div>
                  <h3>5€</h3>
                  <p>Permet de financer du matériel pour nos ateliers interculturels</p>
                </div>
                <div className={styles.impactItem}>
                  <div className={styles.impactIcon}><FaHandHoldingHeart /></div>
                  <h3>20€</h3>
                  <p>Contribue à l'organisation d'un événement culturel pour la communauté</p>
                </div>
                <div className={styles.impactItem}>
                  <div className={styles.impactIcon}><FaHandsHelping /></div>
                  <h3>50€</h3>
                  <p>Aide à développer des programmes éducatifs pour promouvoir l'inclusion</p>
                </div>
              </div>
            </div>
            
            <h2>Pourquoi faire un don ?</h2>
            <p>Votre don nous aide à :</p>
            <ul>
              <li>Organiser des événements culturels et interculturels</li>
              <li>Soutenir les initiatives d'inclusion sociale</li>
              <li>Développer des programmes éducatifs</li>
              <li>Créer des espaces de dialogue et d'échange</li>
              <li>Renforcer les liens entre les différentes communautés</li>
            </ul>
            
            <div className={styles.taxInfo}>
              <h3>Information fiscale</h3>
              <p>Les dons à Action Plus sont déductibles des impôts à hauteur de 66% dans la limite de 20% du revenu imposable.</p>
              <p>Exemple : Un don de 100€ vous coûte réellement 34€ après déduction fiscale.</p>
            </div>
            
            <div className={styles.testimonial}>
              <blockquote>
                "Grâce aux dons reçus, nous avons pu organiser plus de 30 événements l'année dernière, touchant plus de 1500 personnes et créant des liens durables entre différentes cultures."
              </blockquote>
              <cite>— Le Président d'Action Plus</cite>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DonatePage; 