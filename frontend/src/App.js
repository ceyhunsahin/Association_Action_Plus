import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/common/ScrollToTop';

// Doğru dosya yollarını kullanarak bileşenleri import edelim
// Dosya adlarını tam olarak dosya sistemindeki gibi yazalım
import Navbar from './components/pages/Navbar';
import HomePage from './components/pages/HomePage';
import About from './components/pages/About'; 
import LoginForm from './components/pages/LoginForm';
import RegisterForm from './components/pages/RegisterForm';
import ProfilePage from './components/pages/ProfilePage';
import Events from './components/pages/Events';
import EventDetail from './components/pages/EventDetail';
import CreateEvent from './components/pages/CreateEvent';
import ProtectedRoute from './components/protectedRoute';
import Layout from './components/Layout/Layout';
import NotFoundPage from './components/pages/notFoundPage';

import Confidentialite from './components/pages/Confidentialite';
import Conditions from './components/pages/Conditions';
import MentionsLegales from './components/pages/MentionsLegales';
import Contact from './components/pages/Contact';
import ForgotPassword from './components/pages/ForgotPassword';
import EditEvent from './components/pages/EditEvent';
import AdminMembershipManagement from './components/pages/AdminMembershipManagement';
import DonatePage from './components/pages/donate';
import AdminDonations from './components/pages/AdminDonations';
import './App.css';

function App() {

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/login" element={<Layout><LoginForm /></Layout>} />
          <Route path="/register" element={<Layout><RegisterForm /></Layout>} />
          <Route path="/events" element={<Layout><Events /></Layout>} />
          <Route path="/events/:id" element={<Layout><EventDetail /></Layout>} />

          
          {/* Admin route for creating events */}
          <Route 
            path="/events/create" 
            element={
              <ProtectedRoute adminOnly={true}>
                <Layout><CreateEvent /></Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout><ProfilePage /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Yasal sayfalar */}
          <Route path="/confidentialite" element={<Layout><Confidentialite /></Layout>} />
          <Route path="/conditions" element={<Layout><Conditions /></Layout>} />
          <Route path="/mentions-legales" element={<Layout><MentionsLegales /></Layout>} />
          
          {/* Contact sayfası */}
          <Route path="/contact" element={<Layout><Contact /></Layout>} />

          {/* Donation sayfası */}
          <Route path="/donate" element={<Layout><DonatePage /></Layout>} />
          
          {/* Forgot Password sayfası */}
          <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
          
          {/* Edit Event sayfası */}
          <Route 
            path="/events/edit/:id" 
            element={
              <ProtectedRoute adminOnly={true}>
                <Layout><EditEvent /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Membership Management sayfası */}
          <Route 
            path="/admin/memberships" 
            element={
              <ProtectedRoute adminOnly={true}>
                <Layout><AdminMembershipManagement /></Layout>
              </ProtectedRoute>
            } 
          />

          {/* Admin Donations sayfası */}
          <Route 
            path="/admin/donations" 
            element={
              <ProtectedRoute adminOnly={true}>
                <Layout><AdminDonations /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* 404 sayfası */}
          <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
