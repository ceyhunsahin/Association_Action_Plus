import React, { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaCalendar, FaDownload, FaAccessibleIcon, FaEye, FaPlus } from 'react-icons/fa';
import styles from './AdminMembershipManagement.module.css';
import { createUser, createMembership } from '../../services/membershipService';

const AdminMembershipManagement = () => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [renewalData, setRenewalData] = useState({
    duration: 12,
    amount: 25
  });
  const [newMemberData, setNewMemberData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    membershipType: 'standard',
    duration: 12,
    amount: 25
  });
  const [addMemberLoading, setAddMemberLoading] = useState(false);

  // Tüm üyeleri getir
  const fetchAllMembers = async () => {
    setLoading(true);
    try {
              const response = await fetch(`${baseUrl}/api/admin/members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
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
    if (!selectedMember) {
      return;
    }
    
    try {
              const response = await fetch(`${baseUrl}/api/admin/members/${selectedMember.id}/renew`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(renewalData)
      });
      
      if (response.ok) {
        const result = await response.json();
        alert('Adhésion renouvelée avec succès!');
        setShowRenewalModal(false);
        
        // Eğer membership_id varsa, üyeyi güncelle
        if (result.membership_id) {
          setMembers(prevMembers => 
            prevMembers.map(member => 
              member.id === selectedMember.id 
                ? { ...member, lastMembershipId: result.membership_id }
                : member
            )
          );
        }
        
        // State'i güncelle, API çağrısı yapma
      } else {
        alert('Erreur lors du renouvellement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du renouvellement');
    }
  };

  // Yeni üye ekle
  const handleAddMember = async () => {
    setAddMemberLoading(true);
    try {
      
      // Form validasyonu
      if (!newMemberData.firstName || !newMemberData.lastName || !newMemberData.email || !newMemberData.username) {
        throw new Error('Tous les champs obligatoires doivent être remplis');
      }
      
      // Email formatı kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newMemberData.email)) {
        throw new Error('Format d\'email invalide');
      }
      
      // Önce kullanıcıyı oluştur
      const userData = await createUser({
        firstName: newMemberData.firstName,
        lastName: newMemberData.lastName,
        email: newMemberData.email,
        username: newMemberData.username,
        password: 'default123', // Varsayılan şifre
        role: 'user'
      });


      // Sonra üyelik oluştur
      const membershipData = await createMembership({
        userId: userData.id,
        membershipType: newMemberData.membershipType,
        duration: newMemberData.duration,
        amount: newMemberData.amount
      });

      if (membershipData?.invoice_available && membershipData?.payment_id) {
        await handleDownloadInvoice(membershipData.payment_id);
      }

      alert('Membre ajouté avec succès!');
      setShowAddMemberModal(false);
      setNewMemberData({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        membershipType: 'standard',
        duration: 12,
        amount: 25
      });

      // Üye listesini yenile
      fetchAllMembers();

    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
      alert('Erreur lors de l\'ajout du membre: ' + error.message);
    } finally {
      setAddMemberLoading(false);
    }
  };

  // Fatura indir
  const handleDownloadInvoice = async (paymentId) => {
    try {
              const response = await fetch(`${baseUrl}/api/admin/download-invoice/${paymentId}`, {
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

  // Membership ID ile fatura indir
  const handleDownloadInvoiceMembership = async (membershipId) => {
    try {
              const response = await fetch(`${baseUrl}/api/admin/download-invoice-membership/${membershipId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `facture_membership_${membershipId}.pdf`);
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
        <button 
          className={styles.addMemberButton}
          onClick={() => setShowAddMemberModal(true)}
          title="Nouveau membre"
        >
          <FaPlus />
        </button>
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
                  {member.lastMembershipId && (
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleDownloadInvoiceMembership(member.lastMembershipId)}
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

      {/* Yeni Üye Ekleme Modal */}
      {showAddMemberModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Ajouter un Nouveau Membre</h2>
              <button onClick={() => setShowAddMemberModal(false)}>×</button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.addMemberForm}>
                <div className={styles.formGroup}>
                  <label>Prénom *</label>
                  <input 
                    type="text" 
                    value={newMemberData.firstName}
                    onChange={(e) => setNewMemberData({...newMemberData, firstName: e.target.value})}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Nom *</label>
                  <input 
                    type="text" 
                    value={newMemberData.lastName}
                    onChange={(e) => setNewMemberData({...newMemberData, lastName: e.target.value})}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input 
                    type="email" 
                    value={newMemberData.email}
                    onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Nom d'utilisateur *</label>
                  <input 
                    type="text" 
                    value={newMemberData.username}
                    onChange={(e) => setNewMemberData({...newMemberData, username: e.target.value})}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Type d'adhésion</label>
                  <select 
                    value={newMemberData.membershipType}
                    onChange={(e) => setNewMemberData({...newMemberData, membershipType: e.target.value})}
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Durée (mois)</label>
                  <select 
                    value={newMemberData.duration}
                    onChange={(e) => {
                      const duration = parseInt(e.target.value);
                      let amount = 25;
                      if (duration === 6) amount = 15;
                      else if (duration === 24) amount = 45;
                      else if (duration === 36) amount = 65;
                      
                      setNewMemberData({
                        ...newMemberData, 
                        duration: duration,
                        amount: amount
                      });
                    }}
                  >
                    <option value={6}>6 mois (15€)</option>
                    <option value={12}>1 an (25€)</option>
                    <option value={24}>2 ans (45€)</option>
                    <option value={36}>3 ans (65€)</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Montant (€)</label>
                  <input 
                    type="number" 
                    value={newMemberData.amount}
                    onChange={(e) => setNewMemberData({...newMemberData, amount: parseFloat(e.target.value)})}
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div className={styles.formNote}>
                  <p><strong>Note:</strong> Le mot de passe par défaut sera "default123". L'utilisateur pourra le changer lors de sa première connexion.</p>
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button onClick={() => setShowAddMemberModal(false)}>Annuler</button>
                <button 
                  onClick={handleAddMember} 
                  className={styles.confirmButton}
                  disabled={addMemberLoading || !newMemberData.firstName || !newMemberData.lastName || !newMemberData.email || !newMemberData.username}
                >
                  {addMemberLoading ? 'Ajout en cours...' : 'Ajouter le membre'}
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
