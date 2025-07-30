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
            Ce site est édité par l'Association Action Plus, association loi 1901.<br />
            Siège social : 3A rue des Jardiniers, 57000 METZ, France<br />
            Téléphone : +33 3 87 56 75 00<br />
            Email : contact@actionplusmetz.org<br />
            Directeur de la publication : Cengiz Basbunar
          </p>
        </section>
        
        <section className={styles.legalSection}>
          <h2>2. Hébergement</h2>
          <p>
            Ce site est hébergé par [Nom de l'hébergeur], [Adresse de l'hébergeur].<br />
            Téléphone : [Numéro de téléphone de l'hébergeur]<br />
            Site web : https://actionplusmetz.org
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
            engager la responsabilité de l'Association Action Plus.
          </p>
        </section>
        
        <section className={styles.legalSection}>
          <h2>5. Données personnelles</h2>
          <p>
            Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée, 
            vous disposez d'un droit d'accès, de modification, de rectification et de 
            suppression des données vous concernant. Pour exercer ce droit, veuillez nous 
            contacter à l'adresse suivante : contact@actionplusmetz.org
          </p>
        </section>
      </div>
    </div>
  );
};

export default MentionsLegales; 