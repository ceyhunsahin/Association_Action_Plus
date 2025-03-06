import React from 'react';
import styles from './LegalPages.module.css';

const Conditions = () => {
  return (
    <div className={styles.legalContainer}>
      <h1 className={styles.legalTitle}>Conditions d'Utilisation</h1>
      
      <div className={styles.legalContent}>
        <section className={styles.legalSection}>
          <h2>1. Acceptation des conditions</h2>
          <p>
            En accédant à ce site, vous acceptez d'être lié par ces conditions d'utilisation, 
            toutes les lois et règlements applicables, et vous acceptez que vous êtes responsable 
            du respect des lois locales applicables. Si vous n'acceptez pas l'une de ces conditions, 
            il vous est interdit d'utiliser ou d'accéder à ce site.
          </p>
        </section>
        
        <section className={styles.legalSection}>
          <h2>2. Licence d'utilisation</h2>
          <p>
            La permission est accordée de télécharger temporairement une copie des documents 
            (informations ou logiciels) sur le site de l'Association Culturelle pour un 
            visionnement transitoire personnel et non commercial uniquement. Il s'agit de 
            l'octroi d'une licence, non d'un transfert de titre, et sous cette licence, 
            vous ne pouvez pas :
          </p>
          <ul>
            <li>modifier ou copier les documents;</li>
            <li>utiliser les documents à des fins commerciales ou pour une présentation publique;</li>
            <li>tenter de décompiler ou de désosser tout logiciel contenu sur le site de l'Association;</li>
            <li>supprimer tout droit d'auteur ou autres notations de propriété des documents; ou</li>
            <li>transférer les documents à une autre personne ou "miroir" les documents sur un autre serveur.</li>
          </ul>
        </section>
        
        <section className={styles.legalSection}>
          <h2>3. Avis de non-responsabilité</h2>
          <p>
            Les documents sur le site de l'Association Culturelle sont fournis "tels quels". 
            L'Association Culturelle ne donne aucune garantie, expresse ou implicite, et 
            décline et nie par la présente toutes les autres garanties, y compris, sans 
            limitation, les garanties implicites ou les conditions de qualité marchande, 
            d'adéquation à un usage particulier, ou de non-violation de la propriété 
            intellectuelle ou autre violation des droits.
          </p>
        </section>
        
        <section className={styles.legalSection}>
          <h2>4. Limitations</h2>
          <p>
            En aucun cas, l'Association Culturelle ou ses fournisseurs ne seront responsables 
            de tout dommage (y compris, sans limitation, les dommages pour perte de données 
            ou de profit, ou en raison d'une interruption d'activité) découlant de l'utilisation 
            ou de l'incapacité d'utiliser les matériaux sur le site de l'Association, même si 
            l'Association ou un représentant autorisé de l'Association a été informé oralement 
            ou par écrit de la possibilité de tels dommages.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Conditions; 