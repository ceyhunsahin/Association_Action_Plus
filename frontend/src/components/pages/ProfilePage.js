import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaCalendarAlt, FaEdit, FaHandHoldingHeart, FaEye, FaSearch, 
  FaCalendarCheck, FaSignOutAlt, FaMapMarkerAlt, FaClock, FaHeart, FaTrophy, FaMedal,
  FaCheckCircle, FaExclamationCircle, FaCalendarDay, FaCalendarWeek, FaRegCalendarAlt, 
  FaHistory, FaTools, FaMusic, FaPalette, FaMicrophone, FaTheaterMasks, FaChartLine,
  FaBirthdayCake, FaStar, FaGem, FaAward, FaCrown, FaUserFriends, FaBookmark } from 'react-icons/fa';
import styles from './ProfilePage.module.css';
import MembershipRenewalModal from './MembershipRenewalModal';
import { getMyMembership, renewMembership, getMembershipHistory, getPaymentHistory, downloadInvoice } from '../../services/membershipService';
import { getMyDonations, downloadDonationReceipt } from '../../services/donationService';



const ProfilePage = () => {
  const { user, accessToken, logout, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, events, settings, messages
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileImage: ''
  });

  const [userEvents, setUserEvents] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [animateProfile, setAnimateProfile] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyData, setReplyData] = useState({
    subject: '',
    message: ''
  });
  const [membership, setMembership] = useState(null);
  const [membershipHistory, setMembershipHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipError, setMembershipError] = useState(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDonationModal, setShowDonationModal] = useState(false);

  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Sayfa yüklendiğinde animasyon efekti
  useEffect(() => {
    setAnimateProfile(true);
    const timer = setTimeout(() => setAnimateProfile(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/login');
      return;
    }

    // Form verilerini kullanıcı bilgileriyle doldur
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        profileImage: user.profileImage || ''
      });
    }

    // Kullanıcının etkinliklerini getir
    fetchUserEvents();

    // Üyelik ve ödeme geçmişini getir
    fetchMembershipData();
    fetchDonations();
    
    // Admin ise contact mesajlarını getir
    if (user && user.role === 'admin') {
      fetchContactMessages();
    }
  }, [user, accessToken, navigate]);

  const fetchDonations = async () => {
    if (!accessToken) return;
    try {
      const data = await getMyDonations();
      setDonations(Array.isArray(data) ? data : []);
    } catch {
      setDonations([]);
    }
  };

  const openDonationModal = (donation) => {
    setSelectedDonation(donation);
    setShowDonationModal(true);
  };

  const fetchMembershipData = async () => {
    if (!accessToken) return;
    try {
      setMembershipLoading(true);
      setMembershipError(null);
      const [membershipData, historyData, paymentsData] = await Promise.all([
        getMyMembership(),
        getMembershipHistory(),
        getPaymentHistory()
      ]);
      setMembership(membershipData);
      setMembershipHistory(Array.isArray(historyData) ? historyData : []);
      setPaymentHistory(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (err) {
      setMembershipError('Impossible de charger les informations d\'adhésion');
    } finally {
      setMembershipLoading(false);
    }
  };

  const handleRenewMembership = async (renewalData) => {
    try {
      setRenewalLoading(true);
      await renewMembership(renewalData);
      await fetchMembershipData();
      setShowRenewalModal(false);
      setSuccessMessage('Adhésion renouvelée avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setMembershipError(err.response?.data?.detail || 'Erreur lors du renouvellement');
    } finally {
      setRenewalLoading(false);
    }
  };

  const handleDownloadInvoice = async (paymentId) => {
    try {
      await downloadInvoice(paymentId);
    } catch (err) {
      setMembershipError('Erreur lors du téléchargement de la facture');
    }
  };



  // Contact mesajlarını getir (admin için)
  const fetchContactMessages = async () => {
    if (!accessToken || user?.role !== 'admin') return;
    
    try {
      const response = await axios.get('https://association-action-plus.onrender.com/api/admin/contact-messages', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      setContactMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
    }
  };

  // Mesajı okundu olarak işaretle
  const markMessageAsRead = async (messageId) => {
    if (!accessToken || user?.role !== 'admin') return;
    
    try {
      await axios.put(`https://association-action-plus.onrender.com/api/admin/contact-messages/${messageId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      // Mesajları güncelle
      setContactMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, status: 'read' } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Mesaj detayını göster
  const showMessageDetail = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    
    // Mesaj okundu olarak işaretle
    if (message.status === 'unread') {
      markMessageAsRead(message.id);
    }
  };

  // Yanıtlama formunu aç
  const openReplyForm = () => {
    if (selectedMessage) {
      setReplyData({
        subject: `Re: ${selectedMessage.subject || 'Sans sujet'}`,
        message: `\n\n--- Message original ---\nDe: ${selectedMessage.name} (${selectedMessage.email})\nDate: ${new Date(selectedMessage.created_at).toLocaleString('fr-FR')}\n\n${selectedMessage.message}`
      });
      setShowReplyForm(true);
    }
  };

  // Yanıtlama formunu kapat
  const closeReplyForm = () => {
    setShowReplyForm(false);
    setReplyData({ subject: '', message: '' });
  };

  // Yanıt gönder
  const sendReply = () => {
    if (selectedMessage && replyData.subject && replyData.message) {
      // Email bilgilerini kopyala
      const emailInfo = {
        to: selectedMessage.email,
        subject: replyData.subject,
        body: replyData.message
      };
      
      // Bilgileri clipboard'a kopyala
      const emailText = `À: ${emailInfo.to}\nSujet: ${emailInfo.subject}\n\n${emailInfo.body}`;
      navigator.clipboard.writeText(emailText).then(() => {
        alert('Informations de réponse copiées dans le presse-papiers. Vous pouvez maintenant les coller dans votre client email.');
      });
      
      closeReplyForm();
    }
  };

  // Kullanıcının etkinliklerini getir
  const fetchUserEvents = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      
      // Doğrudan tüm etkinlikleri getir ve kullanıcının katıldıklarını işaretle
      const allEventsResponse = await axios.get('https://association-action-plus.onrender.com/api/events');
      
      // Tüm etkinlikleri al
      const allEvents = Array.isArray(allEventsResponse.data) ? allEventsResponse.data : 
                       (allEventsResponse.data && Array.isArray(allEventsResponse.data.events)) ? allEventsResponse.data.events : [];
      
      // Kullanıcının katıldığı etkinlikleri kontrol et
      try {
        const userEventsResponse = await axios.get('https://association-action-plus.onrender.com/api/users/me/events', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        
        // Kullanıcının katıldığı etkinliklerin ID'lerini al
        const userEventIds = userEventsResponse.data.events ? 
                            userEventsResponse.data.events.map(event => event.id) : [];
        
        // Tüm etkinlikleri işaretle
        const markedEvents = allEvents.map(event => ({
          ...event,
          isParticipating: userEventIds.includes(event.id)
        }));
        
        // Kullanıcının katıldığı etkinlikleri filtrele
        const participatingEvents = markedEvents.filter(event => event.isParticipating);
        
        // Eğer kullanıcının katıldığı etkinlik yoksa, tüm etkinlikleri göster
        setUserEvents(participatingEvents.length > 0 ? participatingEvents : markedEvents.slice(0, 5));
      } catch (error) {
        console.error('Error fetching user events:', error);
        // Hata durumunda tüm etkinlikleri göster
        setUserEvents(allEvents.slice(0, 5));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error in fetchUserEvents:', err);
      setError('Nous n\'avons pas pu récupérer vos événements pour le moment.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
      setSuccessMessage('Votre profil a été mis à jour avec succès!');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Profil güncellenirken hata oluştu:', error);
      setError('Une erreur est survenue lors de la mise à jour de votre profil.');
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleViewEvent = (eventId) => {
    navigate(`/events/${eventId}`);
  };





  // Kullanıcının üyelik süresini hesapla
  const calculateMembershipDuration = () => {
   if (!user || !user.created_at) return '0 jour';
    
    const createdDate = new Date(user.created_at);
    const today = new Date();
    const diffTime = Math.abs(today - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mois`;
    }
    
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    
    if (remainingMonths === 0) return `${years} an${years > 1 ? 's' : ''}`;
    return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
  };



  // Kullanıcının etkinliklerini render et
  const renderUserEvents = () => {
    if (loading) {
      return (
        <div className={styles.loadingEvents}>
          <div className={styles.loadingAnimation}></div>
          <p>Chargement de votre agenda culturel...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className={styles.errorContainer}>
          <FaExclamationCircle className={styles.errorIcon} />
          <p>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={fetchUserEvents}
          >
            Réessayer
          </button>
        </div>
      );
    }
    
    
    // API yanıtının yapısını kontrol et
    let eventsToRender = userEvents;
    if (userEvents.events && Array.isArray(userEvents.events)) {
      eventsToRender = userEvents.events;
    }
    
    if (!eventsToRender || eventsToRender.length === 0) {
      return (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyState}>
            <FaCalendarAlt className={styles.emptyStateIcon} />
            <h3>Votre agenda est vide</h3>
            <p>Rejoignez nos événements culturels et enrichissez votre expérience associative!</p>
            <Link to="/events" className={styles.discoverButton}>
              <FaSearch /> Découvrir les événements
            </Link>
          </div>
        </div>
      );
    }
    
    // Etkinlikleri tarihe göre sırala (en yakın tarihli önce)
    const sortedEvents = [...eventsToRender].sort((a, b) => {
      const dateA = new Date(a.date || a.event_date);
      const dateB = new Date(b.date || b.event_date);
      return dateA - dateB;
    });
    
    // Geçmiş ve gelecek etkinlikleri filtrele
    const now = new Date();
    const futureEvents = sortedEvents.filter(event => {
      const eventDate = new Date(event.date || event.event_date);
      return eventDate >= now;
    });
    
    const pastEvents = sortedEvents.filter(event => {
      const eventDate = new Date(event.date || event.event_date);
      return eventDate < now;
    });
    
    return (
      <div className={styles.eventsContainer}>
        <div className={styles.eventsTabs}>
          <button 
            className={`${styles.eventTab} ${!showPastEvents ? styles.activeTab : ''}`}
            onClick={() => setShowPastEvents(false)}
          >
            <FaCalendarDay /> Événements à venir ({futureEvents.length})
          </button>
          <button 
            className={`${styles.eventTab} ${showPastEvents ? styles.activeTab : ''}`}
            onClick={() => setShowPastEvents(true)}
          >
            <FaHistory /> Événements passés ({pastEvents.length})
          </button>
        </div>
        
        <div className={styles.eventsList}>
          {(showPastEvents ? pastEvents : futureEvents).map(event => {
            const eventDate = new Date(event.date || event.event_date);
            const eventType = event.type || event.event_type || 'Événement';
            
            // Etkinlik türüne göre ikon seç
            let typeIcon;
            switch(eventType.toLowerCase()) {
              case 'concert':
                typeIcon = <FaMusic />;
                break;
              case 'exposition':
                typeIcon = <FaPalette />;
                break;
              case 'conférence':
                typeIcon = <FaMicrophone />;
                break;
              case 'théâtre':
                typeIcon = <FaTheaterMasks />;
                break;
              case 'atelier':
                typeIcon = <FaTools />;
                break;
              default:
                typeIcon = <FaCalendarCheck />;
            }
            
            return (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventHeader}>
                  <div className={styles.eventType}>
                    {typeIcon} {eventType}
                  </div>
                  <div className={styles.eventDate}>
                    <FaCalendarAlt /> {eventDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                
                <h3 className={styles.eventTitle}>{event.title || event.name}</h3>
                
                <div className={styles.eventDetails}>
                  {event.location && (
                    <div className={styles.eventLocation}>
                      <FaMapMarkerAlt /> {event.location}
                    </div>
                  )}
                  
                  {event.time && (
                    <div className={styles.eventTime}>
                      <FaClock /> {event.time}
                    </div>
                  )}
                </div>
                
                <div className={styles.eventActions}>
                  <button 
                    className={styles.viewEventButton}
                    onClick={() => handleViewEvent(event.id)}
                  >
                    <FaEye /> Voir les détails
                  </button>
                  <button 
                    className={styles.unregisterButton}
                    onClick={() => handleUnregister(event.id)}
                  >
                    <FaSignOutAlt /> Se désinscrire
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Kullanıcı genel bakış sayfasını render et
  const renderOverview = () => {
    return (
      <div className={styles.overviewContainer}>
        <div className={styles.statsCards}>
          <div className={styles.statsCard}>
            <div className={styles.statsIcon}>
              <FaCalendarCheck />
            </div>
            <div className={styles.statsInfo}>
              <span className={styles.statsValue}>{userEvents.length}</span>
              <span className={styles.statsLabel}>Événements</span>
            </div>
          </div>
          

          
          <div className={styles.statsCard}>
            <div className={styles.statsIcon}>
              <FaBirthdayCake />
            </div>
            <div className={styles.statsInfo}>
              <span className={styles.statsValue}>{calculateMembershipDuration()}</span>
              <span className={styles.statsLabel}>Membre depuis</span>
            </div>
          </div>
        </div>
        
        <div className={styles.twoColumnLayout}>
          <div className={styles.leftColumn}>
            <div className={styles.membershipSection}>
              <h2>Votre adhésion</h2>
              <div className={styles.membershipCard}>
                {membershipLoading ? (
                  <div className={styles.membershipLoading}>Chargement...</div>
                ) : membershipError ? (
                  <div className={styles.membershipError}>{membershipError}</div>
                ) : (
                  <>
                    <div className={styles.membershipStatus}>
                      {membership?.status === 'active' ? 'Membre actif' : 'Adhésion inactive'}
                    </div>
                    <div className={styles.membershipDetails}>
                      <p><strong>Numéro d'adhérent:</strong> {user.id}A{new Date().getFullYear()}</p>
                      <p><strong>Date d'adhésion:</strong> {membership?.start_date ? new Date(membership.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p><strong>Date de fin:</strong> {membership?.end_date ? new Date(membership.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
                      <p><strong>Renouvellements:</strong> {membership?.renewal_count || 0}</p>
                      <p><strong>Statut:</strong> {membership?.status || 'Actif'}</p>
                    </div>
                    <div className={styles.membershipActions}>
                      <button className={styles.renewButton} onClick={() => setShowRenewalModal(true)}>
                        Renouveler l'adhésion
                      </button>
                    </div>
                  </>
                )}
              </div>

              {paymentHistory.length > 0 && (
                <div className={styles.membershipHistory}>
                  <h3>Historique des paiements</h3>
                  <div className={styles.historyList}>
                    {paymentHistory.map(payment => (
                      <div key={payment.id} className={styles.historyItem}>
                        <div className={styles.historyInfo}>
                          <div><strong>Date:</strong> {new Date(payment.payment_date || payment.created_at || Date.now()).toLocaleDateString('fr-FR')}</div>
                          <div><strong>Montant:</strong> {payment.amount}€</div>
                          <div><strong>Type:</strong> {payment.payment_type}</div>
                        </div>
                        <button
                          className={styles.invoiceButton}
                          onClick={() => handleDownloadInvoice(payment.id)}
                        >
                          Télécharger la facture
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.donationsSection}>
              <h2>Mes dons</h2>
              {donations.length === 0 ? (
                <div className={styles.empty}>Aucun don pour le moment.</div>
              ) : (
                <div className={styles.donationsList}>
                  {donations.map(d => (
                    <button
                      key={d.id}
                      className={styles.donationItem}
                      onClick={() => openDonationModal(d)}
                    >
                      <span>{new Date(d.created_at).toLocaleDateString('fr-FR')}</span>
                      <span>{d.amount} {d.currency || 'EUR'}</span>
                      <span className={d.status === 'COMPLETED' ? styles.statusOk : styles.statusPending}>
                        {d.status === 'COMPLETED' ? 'Validé' : 'En attente'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.rightColumn}>
            <div className={styles.upcomingEvents}>
              <h2><FaCalendarCheck /> Vos prochains événements</h2>
              {userEvents.length > 0 ? (
                <>
                  <div className={styles.eventsList}>
                    {userEvents.slice(0, 3).map(event => {
                      const eventDate = new Date(event.date || event.event_date);
                      const eventType = event.type || event.event_type || 'Événement';
                      
                      // Etkinlik türüne göre ikon seç
                      let typeIcon;
                      switch(eventType.toLowerCase()) {
                        case 'concert':
                          typeIcon = <FaMusic />;
                          break;
                        case 'exposition':
                          typeIcon = <FaPalette />;
                          break;
                        case 'conférence':
                          typeIcon = <FaMicrophone />;
                          break;
                        case 'théâtre':
                          typeIcon = <FaTheaterMasks />;
                          break;
                        case 'atelier':
                          typeIcon = <FaTools />;
                          break;
                        default:
                          typeIcon = <FaCalendarCheck />;
                      }
                      
                      return (
                        <div key={event.id} className={styles.eventCard}>
                          <div className={styles.eventHeader}>
                            <div className={styles.eventType}>
                              {typeIcon} {eventType}
                            </div>
                            <div className={styles.eventDate}>
                              <FaCalendarAlt /> {eventDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          </div>
                          
                          <h3 className={styles.eventTitle}>{event.title || event.name}</h3>
                          
                          <div className={styles.eventActions}>
                            <button 
                              className={styles.viewEventButton}
                              onClick={() => handleViewEvent(event.id)}
                            >
                              <FaEye /> Voir les détails
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <button 
                    className={styles.viewAllButton}
                    onClick={() => setActiveTab('events')}
                  >
                    Voir tous les événements
                  </button>
                </>
              ) : (
                <div className={styles.emptyStateContainer}>
                  <div className={styles.emptyState}>
                    <FaCalendarAlt className={styles.emptyStateIcon} />
                    <h3>Votre agenda est vide</h3>
                    <p>Rejoignez nos événements culturels et enrichissez votre expérience associative!</p>
                    <Link to="/events" className={styles.discoverButton}>
                      <FaSearch /> Découvrir les événements
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Kullanıcı ayarlarını render et
  const renderContactMessages = () => {
    if (user?.role !== 'admin') {
      return (
        <div className={styles.noAccess}>
          <FaExclamationCircle />
          <p>Vous n'avez pas accès à cette section.</p>
        </div>
      );
    }

    const unreadCount = contactMessages.filter(msg => msg.status === 'unread').length;

    return (
      <div className={styles.messagesSection}>
        <div className={styles.messagesHeader}>
          <h3>
            <FaEnvelope /> Messages de Contact
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount}</span>
            )}
          </h3>
        </div>
        
        {contactMessages.length === 0 ? (
          <div className={styles.noMessages}>
            <FaEnvelope />
            <p>Aucun message pour le moment.</p>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {contactMessages.map((message) => (
              <div 
                key={message.id} 
                className={`${styles.messageCard} ${message.status === 'unread' ? styles.unreadMessage : ''}`}
                onClick={() => showMessageDetail(message)}
              >
                <div className={styles.messageHeader}>
                  <div className={styles.messageTitle}>
                    <h4>{message.subject || 'Sans sujet'}</h4>
                    {message.status === 'unread' && (
                      <span className={styles.unreadDot}>●</span>
                    )}
                    {message.status === 'read' && (
                      <span className={styles.readIcon}>✓</span>
                    )}
                  </div>
                  <span className={styles.messageDate}>
                    {new Date(message.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                
                <div className={styles.messageInfo}>
                  <p><strong>De:</strong> {message.name} ({message.email})</p>
                </div>
                
                <div className={styles.messagePreview}>
                  <p>
                    {message.message.length > 100 
                      ? `${message.message.substring(0, 100)}...` 
                      : message.message}
                  </p>
                  {message.message.length > 100 && (
                    <span className={styles.readMore}>Lire la suite →</span>
                  )}
                </div>
                
                <div className={styles.messageStatus}>
                  <span className={`${styles.status} ${message.status === 'unread' ? styles.unread : styles.read}`}>
                    {message.status === 'unread' ? 'Non lu' : 'Lu'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Modal de détail du message */}
        {showMessageModal && selectedMessage && (
          <div className={styles.messageModal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>{selectedMessage.subject || 'Sans sujet'}</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowMessageModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.messageDetailInfo}>
                  <p><strong>De:</strong> {selectedMessage.name}</p>
                  <p><strong>Email:</strong> {selectedMessage.email}</p>
                  <p><strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}</p>
                </div>
                
                <div className={styles.messageDetailContent}>
                  <h4>Message:</h4>
                  <p>{selectedMessage.message}</p>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  className={styles.replyButton}
                  onClick={openReplyForm}
                >
                  <FaEnvelope /> Répondre
                </button>
                <button 
                  className={styles.closeModalButton}
                  onClick={() => setShowMessageModal(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Yanıtlama Formu Modal */}
        {showReplyForm && selectedMessage && (
          <div className={styles.messageModal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>Répondre à {selectedMessage.name}</h3>
                <button 
                  className={styles.closeButton}
                  onClick={closeReplyForm}
                >
                  ×
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.replyForm}>
                  <div className={styles.formGroup}>
                    <label>À:</label>
                    <input 
                      type="email" 
                      value={selectedMessage.email} 
                      readOnly 
                      className={styles.readOnlyInput}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Sujet:</label>
                    <input 
                      type="text" 
                      value={replyData.subject}
                      onChange={(e) => setReplyData({...replyData, subject: e.target.value})}
                      className={styles.formInput}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Message:</label>
                    <textarea 
                      value={replyData.message}
                      onChange={(e) => setReplyData({...replyData, message: e.target.value})}
                      className={styles.formTextarea}
                      rows={10}
                      placeholder="Tapez votre réponse..."
                    />
                  </div>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  className={styles.sendButton}
                  onClick={sendReply}
                >
                  <FaEnvelope /> Copier et Fermer
                </button>
                <button 
                  className={styles.closeModalButton}
                  onClick={closeReplyForm}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className={styles.settingsContainer}>
        <h2>Paramètres du compte</h2>
        
        <div className={styles.editProfileForm}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">Prénom</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="lastName">Nom</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="profileImage">URL de l'image de profil</label>
              <input
                type="text"
                id="profileImage"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
              />
            </div>
            
            <div className={styles.formActions}>
              <button type="submit" className={styles.saveButton}>
                Enregistrer
              </button>
            </div>
          </form>
        </div>
        
        <div className={styles.dangerZone}>
          <h3>Zone de danger</h3>
          <button className={styles.deleteAccountButton}>
            Supprimer mon compte
          </button>
        </div>
      </div>
    );
  };

  // Etkinlikten ayrılma fonksiyonu
  const handleUnregister = async (eventId) => {
    try {
        const response = await axios.delete(
            `https://association-action-plus.onrender.com/api/events/${eventId}/register`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
        );

        if (response.status === 200) {
            // Etkinlik listelerini güncelle
            setUserEvents(userEvents.filter(event => event.id !== eventId));
        }
    } catch (error) {
        console.error('Error unregistering from event:', error);
        alert('Erreur lors de la désinscription de l\'événement');
    }
  };

  if (!user) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={`${styles.profilePage} ${animateProfile ? styles.animateProfile : ''}`} ref={profileRef}>
        <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
                {user.profileImage ? (
                    <img src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                    <div className={styles.defaultAvatar}>
                        <FaUser />
                    </div>
                )}
            </div>
            
            <div className={styles.profileInfo}>
                <h1>{user.firstName} {user.lastName}</h1>
                <p className={styles.userEmail}><FaEnvelope /> {user.email}</p>
                
                <div className={styles.userBadges}>
                    <span className={styles.userBadge} title="Membre actif">
                        <FaUserFriends />
                    </span>

                    {userEvents.length > 5 && (
                        <span className={styles.userBadge} title="Participant régulier">
                            <FaStar />
                        </span>
                    )}
                </div>
            </div>
            
            <div className={styles.profileActions}>
                <button className={styles.logoutButton} onClick={logout}>
                    <FaSignOutAlt /> Se déconnecter
                </button>
            </div>
        </div>
        
        {successMessage && (
            <div className={styles.successMessage}>
                <FaCheckCircle /> {successMessage}
            </div>
        )}
        
        {error && (
            <div className={styles.errorMessage}>
                <FaExclamationCircle /> {error}
            </div>
        )}
        
        <div className={styles.profileNavigation}>
            <button 
                className={`${styles.navButton} ${activeTab === 'overview' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('overview')}
            >
                <FaUser /> Vue d'ensemble
            </button>
            <button 
                className={`${styles.navButton} ${activeTab === 'events' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('events')}
            >
                <FaCalendarCheck /> Événements
            </button>

            <button 
                className={`${styles.navButton} ${activeTab === 'settings' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('settings')}
            >
                <FaEdit /> Paramètres
            </button>
            
            {user.role === 'admin' && (
                <button 
                    className={`${styles.navButton} ${activeTab === 'messages' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('messages')}
                >
                    <FaEnvelope /> Messages
                </button>
            )}
        </div>
        
        <div className={styles.profileContent}>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'events' && renderUserEvents()}
            {activeTab === 'settings' && renderSettings()}
            {activeTab === 'messages' && renderContactMessages()}
        </div>

        <MembershipRenewalModal
          isOpen={showRenewalModal}
          onClose={() => setShowRenewalModal(false)}
          onRenew={handleRenewMembership}
          membership={membership}
          loading={renewalLoading}
        />

        {showDonationModal && selectedDonation && (
          <div className={styles.donationModalOverlay}>
            <div className={styles.donationModal}>
              <h3>Reçu de don</h3>
              <p><strong>Montant:</strong> {selectedDonation.amount} {selectedDonation.currency || 'EUR'}</p>
              <p><strong>Date:</strong> {new Date(selectedDonation.created_at).toLocaleDateString('fr-FR')}</p>
              <p><strong>Statut:</strong> {selectedDonation.status === 'COMPLETED' ? 'Validé' : 'En attente'}</p>
              <div className={styles.donationModalActions}>
                <button onClick={() => setShowDonationModal(false)} className={styles.closeModalButton}>
                  Fermer
                </button>
                <button
                  className={styles.printReceiptButton}
                  onClick={() => downloadDonationReceipt(selectedDonation.id)}
                  disabled={selectedDonation.status !== 'COMPLETED'}
                >
                  Imprimer
                </button>
                <button
                  className={styles.downloadReceiptButton}
                  onClick={() => downloadDonationReceipt(selectedDonation.id)}
                  disabled={selectedDonation.status !== 'COMPLETED'}
                >
                  Télécharger
                </button>
              </div>
              {selectedDonation.status !== 'COMPLETED' && (
                <div className={styles.pendingNote}>
                  Votre don est en attente de validation par l'administrateur.
                </div>
              )}
            </div>
          </div>
        )}

    </div>
  );
};

export default ProfilePage;
