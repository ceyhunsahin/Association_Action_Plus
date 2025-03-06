import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import styles from './Donate.module.css';

const Donate = () => {
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France'
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');

  const handleAmountSelect = (amount) => {
    setDonationAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    setCustomAmount(e.target.value);
    setDonationAmount('custom');
  };

  const handleDonorInfoChange = (e) => {
    setDonorInfo({
      ...donorInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Burada ödeme işlemi gerçekleştirilecek
    console.log({
      amount: donationAmount === 'custom' ? customAmount : donationAmount,
      isRecurring,
      isAnonymous,
      donorInfo: isAnonymous ? null : donorInfo,
      paymentMethod,
      message
    });
    
    // Başarılı ödeme sonrası teşekkür sayfasına yönlendirme yapılabilir
    alert('Merci pour votre don ! Vous allez être redirigé vers la page de paiement.');
  };

  return (
    <>
      <Helmet>
        <title>Faire un don | Action Plus</title>
        <meta name="description" content="Soutenez Action Plus en faisant un don. Votre contribution nous aide à promouvoir le dialogue interculturel et à organiser des événements culturels." />
      </Helmet>
      
      <div className={styles.donateContainer}>
        <div className={styles.donateHero}>
          <h1 className={styles.donateTitle}>Soutenez notre mission</h1>
          <p className={styles.donateSubtitle}>
            Votre don nous aide à promouvoir le dialogue interculturel et à créer des espaces d'échange entre les communautés.
          </p>
        </div>
        
        <div className={styles.donateContent}>
          <div className={styles.donateInfo}>
            <h2>Pourquoi faire un don ?</h2>
            <p>
              En tant qu'association à but non lucratif, Action Plus dépend de la générosité de ses donateurs pour mener à bien sa mission. Votre soutien financier nous permet de :
            </p>
            <ul>
              <li>Organiser des événements culturels accessibles à tous</li>
              <li>Mettre en place des ateliers d'échange interculturel</li>
              <li>Soutenir les initiatives locales favorisant la diversité</li>
              <li>Développer des programmes éducatifs pour les jeunes</li>
            </ul>
            
            <div className={styles.impactSection}>
              <h3>Votre impact</h3>
              <div className={styles.impactItems}>
                <div className={styles.impactItem}>
                  <span className={styles.impactAmount}>20€</span>
                  <p>Permet à une personne de participer à un atelier interculturel</p>
                </div>
                <div className={styles.impactItem}>
                  <span className={styles.impactAmount}>50€</span>
                  <p>Finance du matériel pédagogique pour nos activités</p>
                </div>
                <div className={styles.impactItem}>
                  <span className={styles.impactAmount}>100€</span>
                  <p>Contribue à l'organisation d'un événement culturel</p>
                </div>
              </div>
            </div>
            
            <div className={styles.taxInfo}>
              <h3>Avantages fiscaux</h3>
              <p>
                En tant qu'association reconnue d'intérêt général, vos dons à Action Plus sont déductibles des impôts à hauteur de 66% dans la limite de 20% de votre revenu imposable.
              </p>
              <p>
                Par exemple, un don de 100€ ne vous coûte réellement que 34€ après déduction fiscale.
              </p>
            </div>
          </div>
          
          <div className={styles.donateForm}>
            <h2>Faire un don</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formSection}>
                <h3>Montant du don</h3>
                <div className={styles.amountButtons}>
                  <button 
                    type="button" 
                    className={`${styles.amountButton} ${donationAmount === '20' ? styles.selected : ''}`}
                    onClick={() => handleAmountSelect('20')}
                  >
                    20€
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.amountButton} ${donationAmount === '50' ? styles.selected : ''}`}
                    onClick={() => handleAmountSelect('50')}
                  >
                    50€
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.amountButton} ${donationAmount === '100' ? styles.selected : ''}`}
                    onClick={() => handleAmountSelect('100')}
                  >
                    100€
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.amountButton} ${donationAmount === '200' ? styles.selected : ''}`}
                    onClick={() => handleAmountSelect('200')}
                  >
                    200€
                  </button>
                </div>
                
                <div className={styles.customAmount}>
                  <label>
                    <input 
                      type="radio" 
                      name="donationAmount" 
                      checked={donationAmount === 'custom'} 
                      onChange={() => setDonationAmount('custom')} 
                    />
                    Autre montant
                  </label>
                  <div className={styles.customAmountInput}>
                    <span className={styles.currencySymbol}>€</span>
                    <input 
                      type="number" 
                      min="1" 
                      value={customAmount} 
                      onChange={handleCustomAmountChange} 
                      placeholder="Montant personnalisé"
                    />
                  </div>
                </div>
                
                <div className={styles.donationOptions}>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={isRecurring} 
                      onChange={() => setIsRecurring(!isRecurring)} 
                    />
                    Don mensuel récurrent
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={isAnonymous} 
                      onChange={() => setIsAnonymous(!isAnonymous)} 
                    />
                    Don anonyme
                  </label>
                </div>
              </div>
              
              {!isAnonymous && (
                <div className={styles.formSection}>
                  <h3>Vos coordonnées</h3>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="firstName">Prénom</label>
                      <input 
                        type="text" 
                        id="firstName" 
                        name="firstName" 
                        value={donorInfo.firstName} 
                        onChange={handleDonorInfoChange} 
                        required 
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="lastName">Nom</label>
                      <input 
                        type="text" 
                        id="lastName" 
                        name="lastName" 
                        value={donorInfo.lastName} 
                        onChange={handleDonorInfoChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={donorInfo.email} 
                      onChange={handleDonorInfoChange} 
                      required 
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="address">Adresse</label>
                    <input 
                      type="text" 
                      id="address" 
                      name="address" 
                      value={donorInfo.address} 
                      onChange={handleDonorInfoChange} 
                      required 
                    />
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="city">Ville</label>
                      <input 
                        type="text" 
                        id="city" 
                        name="city" 
                        value={donorInfo.city} 
                        onChange={handleDonorInfoChange} 
                        required 
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="postalCode">Code postal</label>
                      <input 
                        type="text" 
                        id="postalCode" 
                        name="postalCode" 
                        value={donorInfo.postalCode} 
                        onChange={handleDonorInfoChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="country">Pays</label>
                    <select 
                      id="country" 
                      name="country" 
                      value={donorInfo.country} 
                      onChange={handleDonorInfoChange} 
                      required
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Canada">Canada</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>
              )}
              
              <div className={styles.formSection}>
                <h3>Méthode de paiement</h3>
                <div className={styles.paymentMethods}>
                  <label className={styles.paymentMethod}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="card" 
                      checked={paymentMethod === 'card'} 
                      onChange={() => setPaymentMethod('card')} 
                    />
                    <div className={styles.paymentIcon}>
                      <i className="fas fa-credit-card"></i>
                    </div>
                    <span>Carte bancaire</span>
                  </label>
                  
                  <label className={styles.paymentMethod}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="paypal" 
                      checked={paymentMethod === 'paypal'} 
                      onChange={() => setPaymentMethod('paypal')} 
                    />
                    <div className={styles.paymentIcon}>
                      <img src="/paypal-logo.png" alt="PayPal" />
                    </div>
                    <span>PayPal</span>
                  </label>
                  
                  <label className={styles.paymentMethod}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="bank" 
                      checked={paymentMethod === 'bank'} 
                      onChange={() => setPaymentMethod('bank')} 
                    />
                    <div className={styles.paymentIcon}>
                      <i className="fas fa-university"></i>
                    </div>
                    <span>Virement bancaire</span>
                  </label>
                </div>
              </div>
              
              <div className={styles.formSection}>
                <h3>Message (facultatif)</h3>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="Laissez un message avec votre don"
                  rows="3"
                ></textarea>
              </div>
              
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  {paymentMethod === 'paypal' ? 'Continuer avec PayPal' : 'Faire un don'}
                </button>
              </div>
              
              <div className={styles.securePayment}>
                <i className="fas fa-lock"></i> Paiement sécurisé
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Donate; 