import React from 'react';
import styles from './LegalPages.module.css';

const MentionsLegales = () => {
  return (
    <div className={styles.legalContainer}>
      <h1 className={styles.legalTitle}>Mentions Légales</h1>
      
      <div className={styles.legalContent}>
        <section className={styles.legalSection}>
          <h2>1. Informations légales</h2>
          <p>
            Ce site est édité par l'Association Culturelle, association loi 1901.<br />
            Siège social : [Adresse de l'association]<br />
            Téléphone : [Numéro de téléphone]<br />
            Email : [Adresse email]<br />
            Directeur de la publication : [Nom du directeur]
          </p>
        </section>
        
        <section className={styles.legalSection}>
          <h2>2. Hébergement</h2>
          <p>
            Ce site est hébergé par [Nom de l'hébergeur], [Adresse de l'hébergeur].<br />
            Téléphone : [Numéro de téléphone de l'hébergeur]
          </p>
        </section>
        
        <section className={styles.legalSection}>
          <h2>3. Propriété intellectuelle</h2>
          <p>
            L'ensemble de ce site relève de la législation française et internationale 
            sur le droit d'auteur et la propriété intellectuelle. Tous les droits de 
            reproduction sont réservés, y compris pour les documents téléchargeables 
            et les représentations iconographiques et photographiques.
          </p>
          <p>
            La reproduction de tout ou partie de ce site sur un support électronique 
            quel qu'il soit est formellement interdite sauf autorisation expresse du 
            directeur de la publication.
          </p>
        </section>
        
        <section className={styles.legalSection}>
          <h2>4. Liens hypertextes</h2>
          <p>
            Les liens hypertextes mis en place dans le cadre du présent site internet 
            en direction d'autres ressources présentes sur le réseau Internet ne sauraient 
            engager la responsabilité de l'Association Culturelle.
          </p>
        </section>
        
        <section className={styles.legalSection}>
          <h2>5. Données personnelles</h2>
          <p>
            Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée, 
            vous disposez d'un droit d'accès, de modification, de rectification et de 
            suppression des données vous concernant. Pour exercer ce droit, veuillez nous 
            contacter à l'adresse suivante : [Adresse email de contact].
          </p>
        </section>
      </div>
    </div>
  );
};

export default MentionsLegales; 