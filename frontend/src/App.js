import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/common/ScrollToTop';
import Footer from './components/pages/Footer';

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
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout/Layout';
import NotFoundPage from './components/pages/notFoundPage';
import Donate from './components/pages/donate';
import Confidentialite from './components/pages/Confidentialite';
import Conditions from './components/pages/Conditions';
import MentionsLegales from './components/pages/MentionsLegales';
import Contact from './components/pages/Contact';
import ForgotPassword from './components/pages/ForgotPassword';
import EditEvent from './components/pages/EditEvent';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/donate" element={<Donate />} />  {/* Bağış sayfası rotası */}
            
            {/* Admin route for creating events */}
            <Route 
              path="/events/create" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <CreateEvent />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Yasal sayfalar */}
            <Route path="/confidentialite" element={<Confidentialite />} />
            <Route path="/conditions" element={<Conditions />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            
            {/* Contact sayfası */}
            <Route path="/contact" element={<Contact />} />
            
            {/* Forgot Password sayfası */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Edit Event sayfası */}
            <Route 
              path="/events/edit/:id" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <EditEvent />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 sayfası */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;