import React from 'react';
import styles from './LegalPages.module.css';

const Confidentialite = () => {
  return (
    <div className={styles.legalContainer}>
      <h1 className={styles.legalTitle}>Politique de Confidentialité</h1>
      
      <div className={styles.legalContent}>
        <section className={styles.legalSection}>
          <h2>1. Collecte des informations</h2>
          <p>
            Nous recueillons des informations lorsque vous vous inscrivez sur notre site, 
            lorsque vous vous connectez à votre compte, participez à un événement, 
            ou remplissez un formulaire. Les informations recueillies incluent votre nom, 
            adresse e-mail, numéro de téléphone, et éventuellement des informations démographiques.
          </p>
        </section>
        
        <section className={styles.legalSection}>
          <h2>2. Utilisation des informations</h2>
          <p>
            Toutes les informations que nous recueillons auprès de vous peuvent être utilisées pour :
          </p>
          <ul>
            <li>Personnaliser votre expérience et répondre à vos besoins individuels</li>
            <li>Améliorer notre site Web</li>
            <li>Améliorer le service client et vos besoins de prise en charge</li>
            <li>Vous contacter par e-mail</li>
            <li>Administrer un concours, une promotion, ou une enquête</li>
          </ul>
        </section>
        
        <section className={styles.legalSection}>
          <h2>3. Protection des informations</h2>
          <p>
            Nous mettons en œuvre une variété de mesures de sécurité pour préserver 
            la sécurité de vos informations personnelles. Nous utilisons un cryptage 
            à la pointe de la technologie pour protéger les informations sensibles 
            transmises en ligne. Nous protégeons également vos informations hors ligne.
          </p>
        </section>
        
        <section className={styles.legalSection}>
          <h2>4. Cookies</h2>
          <p>
            Notre site Web utilise des cookies pour améliorer l'accès à notre site 
            et identifier les visiteurs réguliers. En outre, nos cookies améliorent 
            l'expérience d'utilisateur grâce au suivi et au ciblage de ses intérêts. 
            Cependant, cette utilisation des cookies n'est en aucune façon liée à des 
            informations personnelles identifiables sur notre site.
          </p>
        </section>
        
        <section className={styles.legalSection}>
          <h2>5. Se désabonner</h2>
          <p>
            Nous utilisons l'adresse e-mail que vous fournissez pour vous envoyer des 
            informations et mises à jour relatives à votre compte, des nouvelles de 
            l'association, des informations sur des produits liés, etc. Si à n'importe 
            quel moment vous souhaitez vous désinscrire et ne plus recevoir d'e-mails, 
            des instructions de désabonnement détaillées sont incluses en bas de chaque e-mail.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Confidentialite; 