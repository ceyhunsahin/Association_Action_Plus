// src/components/pages/ErrorPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold">404 - Page non trouvée</h1>
      <p className="mt-4 text-lg">La page que vous recherchez n'existe pas.</p>
      <Link to="/" className="text-blue-600 hover:underline">
        Retour à l'accueil
      </Link>
    </div>
  );
};

export default ErrorPage;