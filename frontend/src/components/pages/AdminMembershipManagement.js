import React, { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaCalendar, FaDownload, FaAccessibleIcon, FaEye } from 'react-icons/fa';
import styles from './AdminMembershipManagement.module.css';

const AdminMembershipManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalData, setRenewalData] = useState({
    duration: 12,
    amount: 25
  });

  // Tüm üyeleri getir
  const fetchAllMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/members', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        setMembers(data);
      } else {
        console.error('Erreur lors du chargement des membres:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Üyeliği yenile (admin tarafından)
  const handleRenewMembership = async () => {
    if (!selectedMember) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/admin/members/${selectedMember.id}/renew`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(renewalData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Renewal response:', result);
        alert('Adhésion renouvelée avec succès!');
        setShowRenewalModal(false);
        
        // Eğer payment_id varsa, üyeyi güncelle
        if (result.payment_id) {
          setMembers(prevMembers => 
            prevMembers.map(member => 
              member.id === selectedMember.id 
                ? { ...member, lastPaymentId: result.payment_id }
                : member
            )
          );
        }
        
        fetchAllMembers(); // Listeyi yenile
      } else {
        alert('Erreur lors du renouvellement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du renouvellement');
    }
  };

  // Fatura indir
  const handleDownloadInvoice = async (paymentId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/download-invoice/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `facture_${paymentId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Erreur lors du téléchargement de la facture');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du téléchargement de la facture');
    }
  };

  // Üye detaylarını göster
  const showMemberDetails = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  // Filtrelenmiş üyeler
  const filteredMembers = members.filter(member => {
    if (!searchTerm || searchTerm.trim() === '') {
      return true; // Arama terimi yoksa tüm üyeleri göster
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    const firstName = member.firstName?.toLowerCase() || '';
    const lastName = member.lastName?.toLowerCase() || '';
    const email = member.email?.toLowerCase() || '';
    
    return firstName.includes(searchLower) || 
           lastName.includes(searchLower) || 
           email.includes(searchLower);
  });

  useEffect(() => {
    fetchAllMembers();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gestion des Memberships</h1>
        <p>Gérez les memberships et générez des factures</p>
      </div>

      {/* Arama */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher un membre par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Üye Listesi */}
      <div className={styles.membersList}>
        {loading ? (
          <div className={styles.loading}>Chargement...</div>
        ) : (
          <>
            <div className={styles.listHeader}>
              <span>Membre</span>
              <span>Email</span>
              <span>Adhésion</span>
              <span>Statut</span>
              <span>Actions</span>
            </div>
            
            {filteredMembers.map(member => (
              <div key={member.id} className={styles.memberRow}>
                <div className={styles.memberInfo}>
                  <FaUser className={styles.userIcon} />
                  <span>{member.firstName} {member.lastName}</span>
                </div>
                <span className={styles.memberEmail}>{member.email}</span>
                <div className={styles.membershipInfo}>
                  <FaCalendar className={styles.calendarIcon} />
                  <span>
                    {member.membership?.end_date ? 
                      new Date(member.membership.end_date).toLocaleDateString('fr-FR') : 
                      'Aucune adhésion'
                    }
                  </span>
                </div>
                <span className={`${styles.status} ${member.membership?.status === 'active' ? styles.active : styles.inactive}`}>
                  {member.membership?.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
                <div className={styles.actions}>
                  <button 
                    className={styles.actionButton}
                    onClick={() => showMemberDetails(member)}
                    title="Voir les détails"
                  >
                    <FaEye />
                  </button>
                  <button 
                    className={styles.actionButton}
                    onClick={() => {
                      setSelectedMember(member);
                      setShowRenewalModal(true);
                    }}
                    title="Renouveler l'adhésion"
                  >
                    <FaAccessibleIcon />
                  </button>
                  {member.lastPaymentId && (
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleDownloadInvoice(member.lastPaymentId)}
                      title="Télécharger la facture"
                    >
                      <FaDownload />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Üye Detay Modal */}
      {showMemberModal && selectedMember && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Détails du Membre</h2>
              <button onClick={() => setShowMemberModal(false)}>×</button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.memberDetails}>
                <h3>{selectedMember.firstName} {selectedMember.lastName}</h3>
                <p><strong>Email:</strong> {selectedMember.email}</p>
                <p><strong>ID Membre:</strong> {selectedMember.id}A{new Date().getFullYear()}</p>
                <p><strong>Date d'inscription:</strong> {new Date(selectedMember.created_at).toLocaleDateString('fr-FR')}</p>
                
                {selectedMember.membership && (
                  <div className={styles.membershipDetails}>
                    <h4>Adhésion Actuelle</h4>
                    <p><strong>Type:</strong> {selectedMember.membership.membership_type}</p>
                    <p><strong>Date de début:</strong> {new Date(selectedMember.membership.start_date).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Date de fin:</strong> {new Date(selectedMember.membership.end_date).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Renouvellements:</strong> {selectedMember.membership.renewal_count || 0}</p>
                    <p><strong>Statut:</strong> {selectedMember.membership.status}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yenileme Modal */}
      {showRenewalModal && selectedMember && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Renouveler l'Adhésion</h2>
              <button onClick={() => setShowRenewalModal(false)}>×</button>
            </div>
            <div className={styles.modalContent}>
              <h3>Renouveler l'adhésion de {selectedMember.firstName} {selectedMember.lastName}</h3>
              
              <div className={styles.renewalForm}>
                <div className={styles.formGroup}>
                  <label>Durée:</label>
                  <select 
                    value={renewalData.duration} 
                    onChange={(e) => setRenewalData({...renewalData, duration: parseInt(e.target.value)})}
                  >
                    <option value={6}>6 mois (15€)</option>
                    <option value={12}>1 an (25€)</option>
                    <option value={24}>2 ans (45€)</option>
                    <option value={36}>3 ans (65€)</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Montant:</label>
                  <input 
                    type="number" 
                    value={renewalData.amount}
                    onChange={(e) => setRenewalData({...renewalData, amount: parseFloat(e.target.value)})}
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button onClick={() => setShowRenewalModal(false)}>Annuler</button>
                <button onClick={handleRenewMembership} className={styles.confirmButton}>
                  Renouveler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembershipManagement; 