from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import os

class GenerateurFacture:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_styles()
    
    def setup_styles(self):
        """Styles personnalisés pour la facture"""
        # Style pour le titre principal
        self.styles.add(ParagraphStyle(
            name='TitrePrincipal',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        # Style pour les sous-titres
        self.styles.add(ParagraphStyle(
            name='SousTitre',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            textColor=colors.darkblue
        ))
        
        # Style pour le texte normal
        self.styles.add(ParagraphStyle(
            name='TexteNormal',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=12
        ))
        
        # Style pour les informations importantes
        self.styles.add(ParagraphStyle(
            name='InfoImportante',
            parent=self.styles['Normal'],
            fontSize=14,
            spaceAfter=15,
            textColor=colors.darkgreen,
            fontName='Helvetica-Bold'
        ))

    def generer_facture_adhésion(self, user_data, membership_data, payment_data, output_path):
        """Génère une facture PDF pour l'adhésion"""
        
        # Créer le document PDF
        doc = SimpleDocTemplate(output_path, pagesize=A4)
        story = []
        
        # En-tête avec logo et informations de l'association
        story.append(self.creer_en_tete())
        story.append(Spacer(1, 20))
        
        # Titre principal
        story.append(Paragraph("FACTURE D'ADHÉSION", self.styles['TitrePrincipal']))
        story.append(Spacer(1, 20))
        
        # Informations de la facture
        story.append(self.creer_informations_facture(payment_data))
        story.append(Spacer(1, 20))
        
        # Informations du membre
        story.append(self.creer_informations_membre(user_data))
        story.append(Spacer(1, 20))
        
        # Détails de l'adhésion
        story.append(self.creer_details_adhesion(membership_data, payment_data))
        story.append(Spacer(1, 30))
        
        # Tableau des services
        story.append(self.creer_tableau_services(payment_data))
        story.append(Spacer(1, 30))
        
        # Total et conditions
        story.append(self.creer_total_et_conditions(payment_data))
        story.append(Spacer(1, 30))
        
        # Pied de page
        story.append(self.creer_pied_de_page())
        
        # Générer le PDF
        doc.build(story)
        return output_path

    def creer_en_tete(self):
        """Crée l'en-tête avec le logo et les informations de l'association"""
        elements = []
        
        # Titre de l'association
        elements.append(Paragraph("ASSOCIATION CULTURELLE FRANCO-TURQUE", self.styles['SousTitre']))
        elements.append(Spacer(1, 10))
        
        # Informations de l'association
        info_association = [
            "123 Rue de la Culture",
            "75001 Paris, France",
            "Téléphone: +33 1 23 45 67 89",
            "Email: contact@association-culturelle.fr",
            "SIRET: 123 456 789 00012",
            "Association loi 1901"
        ]
        
        for info in info_association:
            elements.append(Paragraph(info, self.styles['TexteNormal']))
        
        return elements

    def creer_informations_facture(self, payment_data):
        """Crée les informations de la facture"""
        elements = []
        
        # Numéro de facture et date
        facture_info = [
            f"<b>Numéro de facture:</b> FAC-{payment_data.get('id', '001')}",
            f"<b>Date de facturation:</b> {datetime.now().strftime('%d/%m/%Y')}",
            f"<b>Date d'échéance:</b> {datetime.now().strftime('%d/%m/%Y')}",
            f"<b>Méthode de paiement:</b> Carte bancaire"
        ]
        
        for info in facture_info:
            elements.append(Paragraph(info, self.styles['TexteNormal']))
        
        return elements

    def creer_informations_membre(self, user_data):
        """Crée les informations du membre"""
        elements = []
        
        elements.append(Paragraph("INFORMATIONS DU MEMBRE", self.styles['SousTitre']))
        elements.append(Spacer(1, 10))
        
        membre_info = [
            f"<b>Nom complet:</b> {user_data.get('firstName', '')} {user_data.get('lastName', '')}",
            f"<b>Email:</b> {user_data.get('email', '')}",
            f"<b>Numéro de membre:</b> {user_data.get('id', '')}A{datetime.now().year}",
            f"<b>Date d'adhésion:</b> {datetime.now().strftime('%d/%m/%Y')}"
        ]
        
        for info in membre_info:
            elements.append(Paragraph(info, self.styles['TexteNormal']))
        
        return elements

    def creer_details_adhesion(self, membership_data, payment_data):
        """Crée les détails de l'adhésion"""
        elements = []
        
        elements.append(Paragraph("DÉTAILS DE L'ADHÉSION", self.styles['SousTitre']))
        elements.append(Spacer(1, 10))
        
        adhesion_info = [
            f"<b>Type d'adhésion:</b> {payment_data.get('plan_type', 'Standard')}",
            f"<b>Durée:</b> {payment_data.get('duration_months', 12)} mois",
            f"<b>Date de début:</b> {membership_data.get('start_date', datetime.now().strftime('%d/%m/%Y'))}",
            f"<b>Date de fin:</b> {membership_data.get('end_date', 'N/A')}",
            f"<b>Statut:</b> Actif"
        ]
        
        for info in adhesion_info:
            elements.append(Paragraph(info, self.styles['TexteNormal']))
        
        return elements

    def creer_tableau_services(self, payment_data):
        """Crée le tableau des services"""
        elements = []
        
        elements.append(Paragraph("DÉTAIL DES SERVICES", self.styles['SousTitre']))
        elements.append(Spacer(1, 10))
        
        # Données du tableau
        data = [
            ['Description', 'Durée', 'Prix unitaire', 'Total'],
            [
                f"Adhésion {payment_data.get('plan_type', 'Standard')}",
                f"{payment_data.get('duration_months', 12)} mois",
                f"{payment_data.get('amount', 0):.2f} €",
                f"{payment_data.get('amount', 0):.2f} €"
            ]
        ]
        
        # Créer le tableau
        table = Table(data, colWidths=[200, 80, 100, 100])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        return elements

    def creer_total_et_conditions(self, payment_data):
        """Crée le total et les conditions"""
        elements = []
        
        # Total
        total = payment_data.get('amount', 0)
        elements.append(Paragraph(f"<b>TOTAL TTC:</b> {total:.2f} €", self.styles['InfoImportante']))
        elements.append(Spacer(1, 20))
        
        # Conditions
        elements.append(Paragraph("CONDITIONS", self.styles['SousTitre']))
        elements.append(Spacer(1, 10))
        
        conditions = [
            "• Cette facture est payable immédiatement",
            "• L'adhésion est valable pour la durée indiquée",
            "• Aucun remboursement ne sera effectué",
            "• L'association se réserve le droit de modifier les conditions",
            "• En cas de retard de paiement, des frais de 5% seront appliqués"
        ]
        
        for condition in conditions:
            elements.append(Paragraph(condition, self.styles['TexteNormal']))
        
        return elements

    def creer_pied_de_page(self):
        """Crée le pied de page"""
        elements = []
        
        elements.append(Spacer(1, 30))
        elements.append(Paragraph("Merci pour votre confiance !", self.styles['TexteNormal']))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("Association Culturelle Franco-Turque", self.styles['TexteNormal']))
        elements.append(Paragraph("Promouvoir la culture et l'amitié entre nos deux pays", self.styles['TexteNormal']))
        
        return elements

# Fonction utilitaire pour générer une facture
def generer_facture_utilisateur(user_data, membership_data, payment_data, output_dir="factures"):
    """Fonction utilitaire pour générer une facture"""
    
    # Créer le dossier de sortie s'il n'existe pas
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Nom du fichier
    filename = f"facture_adhésion_{user_data.get('id', 'user')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    output_path = os.path.join(output_dir, filename)
    
    # Générer la facture
    generateur = GenerateurFacture()
    generateur.generer_facture_adhésion(user_data, membership_data, payment_data, output_path)
    
    return output_path 