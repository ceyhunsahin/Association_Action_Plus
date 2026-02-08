import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createDonation, getDonation, downloadDonationReceipt } from '../../services/donationService';
import { FaHandHoldingHeart, FaCreditCard, FaMoneyBillWave, FaCheckCircle, 
  FaLock, FaInfoCircle, FaFileInvoice, FaUniversity, FaQuestionCircle, FaRegCreditCard, 
  FaReceipt, FaEuroSign, FaPercentage, FaArrowRight, FaArrowLeft, FaEnvelope, FaDownload, FaPrint } from 'react-icons/fa';
import styles from './Donate.module.css';

const DonatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [donorName, setDonorName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [donorEmail, setDonorEmail] = useState(user ? user.email : '');
  const [donorAddress, setDonorAddress] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorMessage, setDonorMessage] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [receiptNeeded, setReceiptNeeded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showBankInfo, setShowBankInfo] = useState(false);
  const [showReceiptInfo, setShowReceiptInfo] = useState(false);
  const [taxDeduction, setTaxDeduction] = useState(0);
  const [donationData, setDonationData] = useState(null);
  const [receiptSent, setReceiptSent] = useState(false);

  // Banka bilgileri
  const bankInfo = {
    accountName: "Association Culturelle de Paris",
    iban: "FR76 3000 6000 0123 4567 8900 189",
    bic: "AGRIFRPP",
    bankName: "Crédit Agricole",
    reference: `DON-${user?.id || 'GUEST'}-${new Date().getTime().toString().slice(-6)}`
  };

  // Vergi makbuzu bilgileri
  const receiptInfo = {
    associationName: "Association Culturelle de Paris",
    siret: "123 456 789 00012",
    address: "15 rue de la Culture, 75001 Paris",
    phone: "01 23 45 67 89",
    email: "contact@association-culturelle.fr",
    website: "www.association-culturelle.fr",
    legalStatus: "Association loi 1901",
    recognitionDate: "15/03/2010"
  };

  // Kullanıcı giriş yapmışsa, form alanlarını otomatik doldur
  useEffect(() => {
    if (user) {
      setDonorName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
      setDonorEmail(user.email || '');
    }
  }, [user]);

  // Vergi indirimi hesapla
  useEffect(() => {
    if (amount) {
      // Fransa'daki vergi indirimi: bağışın %66'sı, yıllık gelirin %20'sine kadar
      const deduction = parseFloat(amount) * 0.66;
      setTaxDeduction(deduction.toFixed(2));
    } else {
      setTaxDeduction(0);
    }
  }, [amount]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Sadece sayılar ve ondalık nokta kabul et
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
    }
  };

  const handleQuickAmount = (value) => {
    setAmount(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Form doğrulama
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Veuillez saisir un montant valide.');
      setLoading(false);
      return;
    }
    
    if (!donorName || !donorEmail) {
      setError('Veuillez saisir votre nom et votre adresse e-mail.');
      setLoading(false);
      return;
    }
    
    try {
      const donationFormData = {
        amount: parseFloat(amount),
        currency: 'EUR',
        payment_method: paymentMethod,
        donor_name: donorName,
        donor_email: donorEmail,
        donor_address: donorAddress,
        donor_phone: donorPhone,
        donor_message: donorMessage,
        is_recurring: isRecurring,
        receipt_needed: receiptNeeded,
        status: 'PENDING',
        user_id: user ? user.id : null,
        transaction_date: new Date().toISOString()
      };
      
      
      const response = await createDonation(donationFormData);
      
      // Bağış verilerini kaydet
      const savedDonation = {
        ...donationFormData,
        id: response.id,
        transaction_id: response.transaction_id || `TRX-${new Date().getTime()}`,
        created_at: new Date().toISOString(),
        status: response.status || donationFormData.status
      };
      setDonationData(savedDonation);
      localStorage.setItem('lastDonationId', String(response.id));
      
      // Makbuz admin onayından sonra gönderilecek
      if (receiptNeeded) {
        setReceiptSent(false);
      }
      
      setLoading(false);
      setSuccess(true);
      
      // Otomatik yönlendirmeyi kaldırdık, kullanıcı makbuzu görebilsin
    } catch (error) {
      setLoading(false);
      console.error('Erreur lors du processus de don:', error);
      setError('Une erreur s\'est produite lors du traitement de votre don. Veuillez réessayer plus tard.');
    }
  };

  const handleCancel = () => {
    navigate(-1); // Bir önceki sayfaya dön
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const refreshDonationStatus = async () => {
    if (!donationData?.id) return;
    try {
      const latest = await getDonation(donationData.id);
      if (latest && latest.status) {
        setDonationData(prev => ({ ...prev, status: latest.status }));
      }
    } catch {
      // ignore
    }
  };

  const handleDownloadReceipt = () => {
    // PDF indirme işlemi burada yapılabilir
    alert("La fonctionnalité de téléchargement sera bientôt disponible.");
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Başarılı bağış sonrası makbuz göster
  useEffect(() => {
    if (!success || !donationData?.id) return;
    const interval = setInterval(() => {
      refreshDonationStatus();
    }, 10000);
    return () => clearInterval(interval);
  }, [success, donationData?.id]);

  if (success && donationData?.status !== 'COMPLETED') {
    return (
      <div className={styles.donatePageContainer}>
        <div className={styles.donateHeader}>
          <FaHandHoldingHeart className={styles.donateIcon} />
          <h1>Merci pour votre don!</h1>
          <p>Votre don est en attente de validation par l’administrateur.</p>
        </div>
        <div className={styles.receiptActions}>
          <div className={styles.receiptPendingMessage}>
            <FaInfoCircle /> Statut: En attente de validation
          </div>
          <button 
            className={styles.refreshButton}
            onClick={refreshDonationStatus}
          >
            Actualiser le statut
          </button>
        </div>
      </div>
    );
  }

  if (success && donationData?.status === 'COMPLETED') {
    return (
      <div className={styles.donatePageContainer}>
        <div className={styles.donateHeader}>
          <FaCheckCircle className={styles.successIcon} />
          <h1>Merci pour votre don!</h1>
          <p>Votre don a été reçu avec succès. Nous vous remercions pour votre générosité.</p>
        </div>
        
        <div className={styles.receiptContainer}>
          <div className={styles.receiptCard}>
            <div className={styles.receiptHeader}>
              <h2>Reçu de don</h2>
              <div className={styles.receiptLogo}>
                <img src="/logo.svg" alt="Logo" />
              </div>
            </div>
            
            <div className={styles.receiptBody}>
              <div className={styles.receiptInfo}>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Numéro de transaction:</span>
                  <span className={styles.receiptValue}>{donationData?.transaction_id}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Date:</span>
                  <span className={styles.receiptValue}>
                    {new Date(donationData?.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Donateur:</span>
                  <span className={styles.receiptValue}>{donationData?.donor_name}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Email:</span>
                  <span className={styles.receiptValue}>{donationData?.donor_email}</span>
                </div>
                {donationData?.donor_address && (
                  <div className={styles.receiptRow}>
                    <span className={styles.receiptLabel}>Adresse:</span>
                    <span className={styles.receiptValue}>{donationData.donor_address}</span>
                  </div>
                )}
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Montant du don:</span>
                  <span className={styles.receiptValue}><strong>{parseFloat(donationData?.amount).toFixed(2)} €</strong></span>
                </div>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Méthode de paiement:</span>
                  <span className={styles.receiptValue}>
                    {donationData?.payment_method === 'card' ? 'Carte bancaire' : 
                     donationData?.payment_method === 'paypal' ? 'PayPal' :
                     donationData?.payment_method === 'cash' ? 'Espèces' : 'Virement bancaire'}
                  </span>
                </div>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>Don récurrent:</span>
                  <span className={styles.receiptValue}>{donationData?.is_recurring ? 'Oui' : 'Non'}</span>
                </div>
              </div>
              
              <div className={styles.receiptTaxInfo}>
                <h3>Informations fiscales</h3>
                <p>
                  Ce reçu peut être utilisé pour votre déclaration d'impôts. Votre don est déductible à hauteur de 66% 
                  dans la limite de 20% de votre revenu imposable.
                </p>
                <div className={styles.taxSummary}>
                  <div className={styles.taxRow}>
                    <span>Montant du don:</span>
                    <span>{parseFloat(donationData?.amount).toFixed(2)} €</span>
                  </div>
                  <div className={styles.taxRow}>
                    <span>Déduction fiscale (66%):</span>
                    <span>{(parseFloat(donationData?.amount) * 0.66).toFixed(2)} €</span>
                  </div>
                  <div className={styles.taxRow}>
                    <span>Coût réel après déduction:</span>
                    <span><strong>{(parseFloat(donationData?.amount) * 0.34).toFixed(2)} €</strong></span>
                  </div>
                </div>
              </div>
              
              <div className={styles.receiptFooter}>
                <div className={styles.associationInfo}>
                  <p><strong>{receiptInfo.associationName}</strong></p>
                  <p>SIRET: {receiptInfo.siret}</p>
                  <p>{receiptInfo.address}</p>
                  <p>Tél: {receiptInfo.phone} | Email: {receiptInfo.email}</p>
                  <p>{receiptInfo.legalStatus} | Reconnue d'intérêt général le {receiptInfo.recognitionDate}</p>
                </div>
                <div className={styles.receiptNote}>
                  <p>Merci pour votre soutien!</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.receiptActions}>
            <div className={styles.receiptPendingMessage}>
              <FaInfoCircle /> Le reçu fiscal sera envoyé après validation par l'administrateur.
            </div>
            
            <div className={styles.receiptActionButtons}>
              <button 
                className={styles.printReceiptButton}
                onClick={() => downloadDonationReceipt(donationData?.id)}
                disabled={donationData?.status !== 'COMPLETED'}
              >
                <FaPrint /> Imprimer
              </button>
              
              <button 
                className={styles.downloadReceiptButton}
                onClick={() => downloadDonationReceipt(donationData?.id)}
                disabled={donationData?.status !== 'COMPLETED'}
              >
                <FaDownload /> Télécharger PDF
              </button>
            </div>
            
            <button 
              className={styles.homeButton}
              onClick={handleGoHome}
            >
              Retour à l'accueil
            </button>
            <button 
              className={styles.refreshButton}
              onClick={refreshDonationStatus}
            >
              Actualiser le statut
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vergi makbuzu bilgilerini göster
  if (showReceiptInfo) {
    return (
      <div className={styles.donatePageContainer}>
        <div className={styles.donateHeader}>
          <FaReceipt className={styles.donateIcon} />
          <h1>Informations pour le reçu fiscal</h1>
          <p>Veuillez compléter vos coordonnées pour recevoir votre reçu fiscal.</p>
        </div>
        
        <div className={styles.receiptInfoContainer}>
          <div className={styles.receiptInfoCard}>
            <div className={styles.receiptInfoHeader}>
              <FaFileInvoice className={styles.receiptIcon} />
              <h2>Coordonnées pour le reçu fiscal</h2>
            </div>
            
            <form className={styles.receiptForm}>
              <div className={styles.formGroup}>
                <label htmlFor="receiptAddress">Adresse complète*</label>
                <input
                  type="text"
                  id="receiptAddress"
                  value={donorAddress}
                  onChange={(e) => setDonorAddress(e.target.value)}
                  placeholder="123 rue de Paris, 75001 Paris"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="receiptPhone">Téléphone</label>
                <input
                  type="tel"
                  id="receiptPhone"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                />
              </div>
              
              <div className={styles.receiptNote}>
                <FaInfoCircle className={styles.infoIcon} />
                <p>Le reçu fiscal vous permettra de bénéficier d'une réduction d'impôt de 66% du montant de votre don, dans la limite de 20% de votre revenu imposable.</p>
              </div>
              
              <div className={styles.receiptExample}>
                <h3>Exemple de reçu fiscal</h3>
                <div className={styles.receiptPreview}>
                  <div className={styles.receiptHeader}>
                    <div className={styles.receiptLogo}>
                      <FaHandHoldingHeart />
                    </div>
                    <div className={styles.receiptTitle}>
                      <h4>{receiptInfo.associationName}</h4>
                      <p>{receiptInfo.address}</p>
                      <p>SIRET: {receiptInfo.siret}</p>
                    </div>
                  </div>
                  
                  <div className={styles.receiptBody}>
                    <h3>REÇU FISCAL</h3>
                    <p><strong>Donateur:</strong> {donorName}</p>
                    <p><strong>Adresse:</strong> {donorAddress || "Votre adresse complète"}</p>
                    <p><strong>Montant du don:</strong> {amount || "XX"} €</p>
                    <p><strong>Date du don:</strong> {new Date().toLocaleDateString('fr-FR')}</p>
                    <p><strong>Mode de paiement:</strong> {paymentMethod === 'card' ? 'Carte bancaire' : paymentMethod === 'cash' ? 'Espèces' : 'Virement bancaire'}</p>
                    <p className={styles.receiptDeclaration}>
                      L'Association Culturelle de Paris certifie que ce don ouvre droit à la réduction d'impôt prévue à l'article 200 du CGI.
                    </p>
                  </div>
                  
                  <div className={styles.receiptFooter}>
                    <p>Date d'émission: {new Date().toLocaleDateString('fr-FR')}</p>
                    <div className={styles.receiptSignature}>
                      <p>Le Président</p>
                      <p>Jean Dupont</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.receiptActions}>
                <button 
                  type="button" 
                  className={styles.continueButton}
                  onClick={() => {
                    if (!donorAddress) {
                      setError('Veuillez entrer votre adresse pour recevoir le reçu fiscal');
      return;
    }
                    setShowReceiptInfo(false);
                    handleSubmit({ preventDefault: () => {} });
                  }}
                >
                  Continuer avec ces informations
                </button>
                <button 
                  type="button" 
                  className={styles.backButton}
                  onClick={() => setShowReceiptInfo(false)}
                >
                  Retour
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Banka bilgilerini göster
  if (showBankInfo) {
    return (
      <div className={styles.donatePageContainer}>
        <div className={styles.donateHeader}>
          <FaUniversity className={styles.donateIcon} />
          <h1>Informations bancaires pour votre don</h1>
          <p>Veuillez utiliser les coordonnées bancaires ci-dessous pour effectuer votre virement.</p>
        </div>
        
        <div className={styles.bankInfoContainer}>
          <div className={styles.bankInfoCard}>
            <div className={styles.bankInfoHeader}>
              <FaMoneyBillWave className={styles.bankIcon} />
              <h2>Coordonnées bancaires</h2>
            </div>
            
            <div className={styles.bankInfoDetails}>
              <div className={styles.bankInfoItem}>
                <span className={styles.bankInfoLabel}>Bénéficiaire:</span>
                <span className={styles.bankInfoValue}>{bankInfo.accountName}</span>
                <button 
                  className={styles.copyButton}
                  onClick={() => {
                    navigator.clipboard.writeText(bankInfo.accountName);
                    alert('Copié!');
                  }}
                >
                  Copier
                </button>
              </div>
              
              <div className={styles.bankInfoItem}>
                <span className={styles.bankInfoLabel}>IBAN:</span>
                <span className={styles.bankInfoValue}>{bankInfo.iban}</span>
                <button 
                  className={styles.copyButton}
                  onClick={() => {
                    navigator.clipboard.writeText(bankInfo.iban);
                    alert('Copié!');
                  }}
                >
                  Copier
                </button>
              </div>
              
              <div className={styles.bankInfoItem}>
                <span className={styles.bankInfoLabel}>BIC/SWIFT:</span>
                <span className={styles.bankInfoValue}>{bankInfo.bic}</span>
                <button 
                  className={styles.copyButton}
                  onClick={() => {
                    navigator.clipboard.writeText(bankInfo.bic);
                    alert('Copié!');
                  }}
                >
                  Copier
                </button>
              </div>
              
              <div className={styles.bankInfoItem}>
                <span className={styles.bankInfoLabel}>Banque:</span>
                <span className={styles.bankInfoValue}>{bankInfo.bankName}</span>
              </div>
              
              <div className={styles.bankInfoItem}>
                <span className={styles.bankInfoLabel}>Référence:</span>
                <span className={styles.bankInfoValue}>{bankInfo.reference}</span>
                <button 
                  className={styles.copyButton}
                  onClick={() => {
                    navigator.clipboard.writeText(bankInfo.reference);
                    alert('Copié!');
                  }}
                >
                  Copier
                </button>
              </div>
              
              <div className={styles.bankInfoItem}>
                <span className={styles.bankInfoLabel}>Montant:</span>
                <span className={styles.bankInfoValue}>{amount} €</span>
              </div>
            </div>
            
            <div className={styles.bankInfoInstructions}>
              <h3>Instructions pour le virement</h3>
              <ol>
                <li>Connectez-vous à votre espace bancaire en ligne</li>
                <li>Effectuez un virement vers le compte indiqué ci-dessus</li>
                <li>Indiquez la référence exacte dans le libellé du virement</li>
                <li>Une fois le virement effectué, vous recevrez une confirmation par email</li>
                <li>Le reçu fiscal vous sera envoyé après réception du virement</li>
              </ol>
            </div>
            
            <div className={styles.bankInfoNote}>
              <FaInfoCircle className={styles.infoIcon} />
              <p>Veuillez noter que le traitement des virements bancaires peut prendre 2 à 3 jours ouvrés.</p>
            </div>
            
            <div className={styles.bankInfoActions}>
              <button 
                className={styles.confirmButton}
                onClick={() => {
                  setSuccess(true);
                  setTimeout(() => {
                    navigate('/profile');
                  }, 3000);
                }}
              >
                J'ai effectué mon virement
              </button>
              <button 
                className={styles.backButton}
                onClick={() => setShowBankInfo(false)}
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ana bağış formu
  return (
    <div className={styles.donatePageContainer}>
      <div className={styles.donateHeader}>
        <FaHandHoldingHeart className={styles.donateIcon} />
        <h1>Faire un don</h1>
        <p>Votre soutien est essentiel pour nous permettre de continuer à promouvoir la culture et soutenir les artistes.</p>
        <p className={styles.guestNote}>Vous pouvez faire un don sans créer de compte.</p>
      </div>
      
      <div className={styles.donateFormContainer}>
        <form className={styles.donateForm} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
        </div>
      )}
      
          <div className={styles.formGroup}>
            <label htmlFor="amount">Montant du don*</label>
            <div className={styles.amountInputContainer}>
              <input
                type="text"
                id="amount"
                className={styles.amountInput}
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                required
              />
              <span className={styles.currencySymbol}>€</span>
            </div>
            
            <div className={styles.quickAmounts}>
              <button 
                type="button" 
                className={styles.quickAmountButton}
                onClick={() => handleQuickAmount('10')}
              >
                10€
              </button>
              <button 
                type="button" 
                className={styles.quickAmountButton}
                onClick={() => handleQuickAmount('20')}
              >
                20€
              </button>
              <button 
                type="button" 
                className={styles.quickAmountButton}
                onClick={() => handleQuickAmount('50')}
              >
                50€
              </button>
              <button 
                type="button" 
                className={styles.quickAmountButton}
                onClick={() => handleQuickAmount('100')}
              >
                100€
              </button>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Mode de paiement*</label>
            <div className={styles.paymentMethods}>
              <div 
                className={`${styles.paymentMethod} ${paymentMethod === 'card' ? styles.selected : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <FaCreditCard />
                <span>Carte bancaire</span>
              </div>
              <div 
                className={`${styles.paymentMethod} ${paymentMethod === 'bank_transfer' ? styles.selected : ''}`}
                onClick={() => setPaymentMethod('bank_transfer')}
              >
                <FaMoneyBillWave />
                <span>Virement bancaire</span>
              </div>
              <div 
                className={`${styles.paymentMethod} ${paymentMethod === 'cash' ? styles.selected : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <FaMoneyBillWave />
                <span>Espèces</span>
              </div>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="donorName">Nom complet*</label>
            <input
              type="text"
              id="donorName"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Jean Dupont"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="donorEmail">Email*</label>
            <input
              type="email"
              id="donorEmail"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              placeholder="jean.dupont@example.com"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="donorAddress">Adresse (pour reçu fiscal)</label>
            <input
              type="text"
              id="donorAddress"
              value={donorAddress}
              onChange={(e) => setDonorAddress(e.target.value)}
              placeholder="123 rue de Paris, 75001 Paris"
            />
        </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="donorPhone">Téléphone</label>
            <input
              type="tel"
              id="donorPhone"
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              placeholder="06 12 34 56 78"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="donorMessage">Message (optionnel)</label>
            <textarea
              id="donorMessage"
              value={donorMessage}
              onChange={(e) => setDonorMessage(e.target.value)}
              placeholder="Votre message..."
              rows="3"
            />
          </div>
          
          <div className={styles.formOptions}>
            <div className={styles.formOption}>
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              <label htmlFor="isRecurring">Faire un don mensuel</label>
        </div>
        
            <div className={styles.formOption}>
              <input
                type="checkbox"
                id="receiptNeeded"
                checked={receiptNeeded}
                onChange={(e) => setReceiptNeeded(e.target.checked)}
              />
              <label htmlFor="receiptNeeded">Je souhaite recevoir un reçu fiscal</label>
            </div>
          </div>
          
          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={loading}
            >
              <FaArrowLeft /> Retour
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Traitement en cours...' : 'Faire un don'} <FaHandHoldingHeart />
            </button>
          </div>
          
          <div className={styles.secureInfo}>
            <p><FaLock /> Toutes les transactions sont sécurisées et cryptées.</p>
            <p><FaFileInvoice /> Vous recevrez un reçu fiscal par email.</p>
              </div>
        </form>
        
        <div className={styles.donationInfo}>
          <h3>Pourquoi faire un don?</h3>
          <ul>
            <li>Soutenir les artistes locaux et émergents</li>
            <li>Financer des événements culturels accessibles à tous</li>
            <li>Contribuer à l'éducation artistique des jeunes</li>
            <li>Préserver notre patrimoine culturel</li>
            <li>Développer des projets innovants</li>
          </ul>
          
          <h3>Avantages fiscaux</h3>
          <p>Vos dons sont déductibles des impôts à hauteur de 66% dans la limite de 20% de votre revenu imposable.</p>
          
          {amount && parseFloat(amount) > 0 && (
            <div className={styles.taxExample}>
              <p>
                Pour un don de {parseFloat(amount).toFixed(2)} €, votre déduction fiscale sera de {taxDeduction} €.
              </p>
              <p>
                Coût réel après déduction : {(parseFloat(amount) - parseFloat(taxDeduction)).toFixed(2)} €
              </p>
            </div>
          )}
          
          <div className={styles.taxCalculator}>
            <h4>Calculez votre économie d'impôt</h4>
            
            <div className={styles.taxCalculatorVisual}>
              <div className={styles.taxCalculatorHeader}>
                <div className={styles.taxColumn}>
                  <FaEuroSign className={styles.taxIcon} />
                  <span>Votre don</span>
                </div>
                <div className={styles.taxColumn}>
                  <FaPercentage className={styles.taxIcon} />
                  <span>Déduction fiscale</span>
                </div>
                <div className={styles.taxColumn}>
                  <FaArrowRight className={styles.taxIcon} />
                  <span>Coût réel</span>
                </div>
              </div>
              
              <div className={styles.taxCalculatorRows}>
                <div className={styles.taxRow}>
                  <div className={styles.taxColumn}>
                    <div className={styles.taxBubble}>50€</div>
                  </div>
                  <div className={styles.taxColumn}>
                    <div className={styles.taxArrow}>
                      <div className={styles.taxArrowLine}></div>
                      <div className={styles.taxArrowHead}></div>
                    </div>
                    <div className={`${styles.taxBubble} ${styles.taxBubbleSecondary}`}>33€</div>
                  </div>
                  <div className={styles.taxColumn}>
                    <div className={`${styles.taxBubble} ${styles.taxBubbleSuccess}`}>17€</div>
                  </div>
                </div>
                
                <div className={styles.taxRow}>
                  <div className={styles.taxColumn}>
                    <div className={styles.taxBubble}>100€</div>
                  </div>
                  <div className={styles.taxColumn}>
                    <div className={styles.taxArrow}>
                      <div className={styles.taxArrowLine}></div>
                      <div className={styles.taxArrowHead}></div>
                    </div>
                    <div className={`${styles.taxBubble} ${styles.taxBubbleSecondary}`}>66€</div>
                  </div>
                  <div className={styles.taxColumn}>
                    <div className={`${styles.taxBubble} ${styles.taxBubbleSuccess}`}>34€</div>
                  </div>
                </div>
                
                <div className={styles.taxRow}>
                  <div className={styles.taxColumn}>
                    <div className={styles.taxBubble}>200€</div>
                  </div>
                  <div className={styles.taxColumn}>
                    <div className={styles.taxArrow}>
                      <div className={styles.taxArrowLine}></div>
                      <div className={styles.taxArrowHead}></div>
                    </div>
                    <div className={`${styles.taxBubble} ${styles.taxBubbleSecondary}`}>132€</div>
                  </div>
                  <div className={styles.taxColumn}>
                    <div className={`${styles.taxBubble} ${styles.taxBubbleSuccess}`}>68€</div>
                  </div>
                </div>
                
                {amount && parseFloat(amount) > 0 && (
                  <div className={`${styles.taxRow} ${styles.taxRowHighlighted}`}>
                    <div className={styles.taxColumn}>
                      <div className={`${styles.taxBubble} ${styles.taxBubblePrimary}`}>{amount}€</div>
                    </div>
                    <div className={styles.taxColumn}>
                      <div className={`${styles.taxArrow} ${styles.taxArrowHighlighted}`}>
                        <div className={styles.taxArrowLine}></div>
                        <div className={styles.taxArrowHead}></div>
                      </div>
                      <div className={`${styles.taxBubble} ${styles.taxBubbleSecondary}`}>{Math.round(parseFloat(amount) * 0.66)}€</div>
                    </div>
                    <div className={styles.taxColumn}>
                      <div className={`${styles.taxBubble} ${styles.taxBubbleSuccess}`}>{Math.round(parseFloat(amount) * 0.34)}€</div>
                    </div>
                </div>
                )}
              </div>
              
              <div className={styles.taxCalculatorNote}>
                <FaInfoCircle className={styles.infoIcon} />
                <p>66% de votre don est déductible de vos impôts dans la limite de 20% de votre revenu imposable.</p>
              </div>
            </div>
            
            <div className={styles.taxCalculatorCTA}>
              <button 
                className={styles.calculateButton}
                onClick={() => document.getElementById('amount').focus()}
              >
                Calculer mon économie d'impôt
              </button>
        </div>
      </div>
      
          <div className={styles.faqSection}>
            <h3>Questions fréquentes</h3>
            
            <div className={styles.faqItem}>
              <h4><FaQuestionCircle /> Comment puis-je obtenir mon reçu fiscal?</h4>
              <p>Un reçu fiscal vous sera automatiquement envoyé par email dans les 15 jours suivant votre don.</p>
            </div>
            
            <div className={styles.faqItem}>
              <h4><FaQuestionCircle /> Comment sont utilisés les dons?</h4>
              <p>Tous les dons sont utilisés pour financer nos projets culturels, soutenir les artistes et organiser des événements. Un rapport d'activité est publié chaque année.</p>
            </div>
            
            <div className={styles.faqItem}>
              <h4><FaQuestionCircle /> Puis-je annuler mon don mensuel?</h4>
              <p>Oui, vous pouvez annuler votre don mensuel à tout moment en nous contactant par email à dons@association-culturelle.fr.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatePage; 
