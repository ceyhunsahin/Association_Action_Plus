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
        story.extend(self.creer_en_tete())
        story.append(Spacer(1, 10))
        
        # Titre principal
        story.append(Paragraph("FACTURE D'ADHÉSION", self.styles['TitrePrincipal']))
        story.append(Spacer(1, 10))
        
        # Informations de la facture
        story.extend(self.creer_informations_facture(payment_data))
        story.append(Spacer(1, 10))
        
        # Informations du membre
        story.extend(self.creer_informations_membre(user_data))
        story.append(Spacer(1, 10))
        
        # Détails de l'adhésion
        story.extend(self.creer_details_adhesion(membership_data, payment_data))
        story.append(Spacer(1, 15))
        
        # Tableau des services
        story.extend(self.creer_tableau_services(payment_data))
        story.append(Spacer(1, 15))
        
        # Total et conditions
        story.extend(self.creer_total_et_conditions(payment_data))
        story.append(Spacer(1, 15))
        
        # Pied de page
        story.extend(self.creer_pied_de_page())
        
        # Générer le PDF
        doc.build(story)
        return output_path

    def generer_recu_don(self, donation_data, output_path):
        """Génère un reçu PDF pour un don"""
        doc = SimpleDocTemplate(output_path, pagesize=A4)
        story = []

        story.extend(self.creer_en_tete())
        story.append(Spacer(1, 10))

        story.append(Paragraph("RECU DE DON", self.styles['TitrePrincipal']))
        story.append(Spacer(1, 10))

        story.extend(self.creer_informations_facture({
            "id": donation_data.get("id"),
            "payment_date": donation_data.get("transaction_date") or donation_data.get("created_at")
        }))
        story.append(Spacer(1, 10))

        story.extend(self.creer_informations_membre({
            "firstName": donation_data.get("donor_name", ""),
            "lastName": "",
            "email": donation_data.get("donor_email", "")
        }))
        story.append(Spacer(1, 10))

        details = [
            ["Montant du don", f"{donation_data.get('amount', '')} {donation_data.get('currency', 'EUR')}"],
            ["Methode de paiement", donation_data.get("payment_method", "")],
            ["Transaction", donation_data.get("transaction_id", "")],
            ["Date", donation_data.get("transaction_date") or donation_data.get("created_at", "")]
        ]
        table = Table(details, colWidths=[7*cm, 9*cm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 11),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(table)
        story.append(Spacer(1, 15))

        story.extend(self.creer_pied_de_page())

        doc.build(story)
        return output_path

    def creer_en_tete(self):
        """Crée l'en-tête avec le logo et les informations de l'association"""
        elements = []
        
        # Titre de l'association
        elements.append(Paragraph("ACTION PLUS", self.styles['SousTitre']))
        elements.append(Spacer(1, 5))
        
        # Informations de l'association
        info_association = [
            "3A rue des Jardiniers, 57000 METZ, France",
            "Tél: +33 3 87 56 75 00 | Email: contact@actionplusmetz.org",
            "N° d'enregistrement: AA2025MET000109 | Association loi 1901"
        ]
        
        for info in info_association:
            elements.append(Paragraph(info, self.styles['TexteNormal']))
        
        return elements

    def creer_informations_facture(self, payment_data):
        """Crée les informations de la facture"""
        elements = []
        
        # Style pour les informations de facture (aligné à droite)
        facture_style = ParagraphStyle(
            name='FactureInfo',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=8,
            alignment=TA_RIGHT
        )
        
        # Numéro de facture et date (yanyana)
        facture_info = [
            f"<b>N° Facture:</b> FAC-{payment_data.get('id', '001')} | <b>Date:</b> {datetime.now().strftime('%d/%m/%Y')} | <b>Paiement:</b> Carte bancaire"
        ]
        
        for info in facture_info:
            elements.append(Paragraph(info, facture_style))
        
        return elements

    def creer_informations_membre(self, user_data):
        """Crée les informations du membre"""
        elements = []
        
        elements.append(Paragraph("INFORMATIONS DU MEMBRE", self.styles['SousTitre']))
        elements.append(Spacer(1, 5))
        
        # Style pour les informations du membre (aligné à gauche)
        membre_style = ParagraphStyle(
            name='MembreInfo',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=8,
            alignment=TA_LEFT
        )
        
        membre_info = [
            f"<b>Membre:</b> {user_data.get('firstName', '')} {user_data.get('lastName', '')} | <b>Email:</b> {user_data.get('email', '')}",
            f"<b>N° Membre:</b> {user_data.get('id', '')}A{datetime.now().year} | <b>Date:</b> {datetime.now().strftime('%d/%m/%Y')}"
        ]
        
        for info in membre_info:
            elements.append(Paragraph(info, membre_style))
        
        return elements

    def creer_details_adhesion(self, membership_data, payment_data):
        """Crée les détails de l'adhésion"""
        elements = []
        
        elements.append(Paragraph("DÉTAILS DE L'ADHÉSION", self.styles['SousTitre']))
        elements.append(Spacer(1, 5))
        
        # Style pour les détails d'adhésion (aligné à gauche)
        adhesion_style = ParagraphStyle(
            name='AdhesionInfo',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=8,
            alignment=TA_LEFT
        )
        
        # Tarihleri düzgün formata çevir
        start_date = membership_data.get('start_date', '')
        end_date = membership_data.get('end_date', '')
        
        try:
            if start_date and 'T' in start_date:
                start_date = start_date.split('T')[0]
                start_date = datetime.strptime(start_date, '%Y-%m-%d').strftime('%d/%m/%Y')
        except:
            start_date = datetime.now().strftime('%d/%m/%Y')
            
        try:
            if end_date and 'T' in end_date:
                end_date = end_date.split('T')[0]
                end_date = datetime.strptime(end_date, '%Y-%m-%d').strftime('%d/%m/%Y')
        except:
            end_date = 'N/A'
        
        adhesion_info = [
            f"<b>Type:</b> {payment_data.get('plan_type', 'Standard')} | <b>Durée:</b> {payment_data.get('duration_months', 12)} mois | <b>Statut:</b> Actif",
            f"<b>Début:</b> {start_date} | <b>Fin:</b> {end_date}"
        ]
        
        for info in adhesion_info:
            elements.append(Paragraph(info, adhesion_style))
        
        return elements

    def creer_tableau_services(self, payment_data):
        """Crée le tableau des services"""
        elements = []
        
        elements.append(Paragraph("DÉTAIL DES SERVICES", self.styles['SousTitre']))
        elements.append(Spacer(1, 5))
        
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
        elements.append(Spacer(1, 10))
        
        # Conditions
        elements.append(Paragraph("CONDITIONS", self.styles['SousTitre']))
        elements.append(Spacer(1, 5))
        
        # Style pour les conditions (aligné à gauche)
        condition_style = ParagraphStyle(
            name='ConditionInfo',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            alignment=TA_LEFT,
            leftIndent=20
        )
        
        conditions = [
            "• Payable immédiatement | Aucun remboursement | Valable pour la durée indiquée | Retard: frais 5% | Action Plus se réserve le droit de modifier les conditions"
        ]
        
        for condition in conditions:
            elements.append(Paragraph(condition, condition_style))
        
        return elements

    def creer_pied_de_page(self):
        """Crée le pied de page avec signature"""
        elements = []
        
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("Merci pour votre confiance !", self.styles['TexteNormal']))
        elements.append(Spacer(1, 10))
        
        # Signature
        elements.append(Paragraph("Signature du Président:", self.styles['TexteNormal']))
        elements.append(Spacer(1, 15))
        elements.append(Paragraph("_________________________", self.styles['TexteNormal']))
        elements.append(Paragraph("Monsieur CENGIZ BASBUNAR - Président d'Action Plus", self.styles['TexteNormal']))
        
        elements.append(Spacer(1, 5))
        elements.append(Paragraph("Action Plus - Promouvoir le dialogue interculturel, la diversité et la solidarité", self.styles['TexteNormal']))
        
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

def generer_recu_don_utilisateur(donation_data, output_dir="factures"):
    """Fonction utilitaire pour générer un reçu de don"""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    filename = f"recu_don_{donation_data.get('id', 'don')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    output_path = os.path.join(output_dir, filename)
    generateur = GenerateurFacture()
    generateur.generer_recu_don(donation_data, output_path)
    return output_path
