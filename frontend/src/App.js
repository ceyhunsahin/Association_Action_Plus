import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/common/ScrollToTop';

// Sayfalar
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
import AdminLayout from './components/Layout/AdminLayout';
import AdminDashboard from './components/pages/admin/AdminDashboard';
import AdminEvents from './components/pages/admin/AdminEvents';
import AdminMessages from './components/pages/admin/AdminMessages';
import AdminUsers from './components/pages/admin/AdminUsers';
import AdminSettings from './components/pages/admin/AdminSettings';
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
  const homePage = (
    <Layout>
      <HomePage />
    </Layout>
  );

  // Admin sayfaları: sadece admin + public navbar yerine sidebar layout
  const adminRoute = (element) => (
    <ProtectedRoute adminOnly={true}>
      <AdminLayout>{element}</AdminLayout>
    </ProtectedRoute>
  );

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={homePage} />
          <Route path="/tr" element={homePage} />
          <Route path="/tr/*" element={homePage} />
          <Route
            path="/about"
            element={
              <Layout>
                <About />
              </Layout>
            }
          />
          <Route
            path="/login"
            element={
              <Layout>
                <LoginForm />
              </Layout>
            }
          />
          <Route
            path="/register"
            element={
              <Layout>
                <RegisterForm />
              </Layout>
            }
          />
          <Route
            path="/events"
            element={
              <Layout>
                <Events />
              </Layout>
            }
          />
          <Route
            path="/events/:slug"
            element={
              <Layout>
                <EventDetail />
              </Layout>
            }
          />

          {/* Admin route for creating events */}
          <Route
            path="/events/create"
            element={adminRoute(<CreateEvent />)}
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Yasal sayfalar */}
          <Route
            path="/confidentialite"
            element={
              <Layout>
                <Confidentialite />
              </Layout>
            }
          />
          <Route
            path="/conditions"
            element={
              <Layout>
                <Conditions />
              </Layout>
            }
          />
          <Route
            path="/mentions-legales"
            element={
              <Layout>
                <MentionsLegales />
              </Layout>
            }
          />

          {/* Contact sayfası */}
          <Route
            path="/contact"
            element={
              <Layout>
                <Contact />
              </Layout>
            }
          />

          {/* Donation sayfası */}
          <Route
            path="/donate"
            element={
              <Layout>
                <DonatePage />
              </Layout>
            }
          />

          {/* Forgot Password sayfası */}
          <Route
            path="/forgot-password"
            element={
              <Layout>
                <ForgotPassword />
              </Layout>
            }
          />

          {/* Edit Event sayfası */}
          <Route
            path="/events/edit/:slug"
            element={adminRoute(<EditEvent />)}
          />

          {/* ===== Admin Panel (sidebar layout) ===== */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={adminRoute(<AdminDashboard />)} />
          <Route path="/admin/events" element={adminRoute(<AdminEvents />)} />
          <Route path="/admin/profile" element={adminRoute(<ProfilePage />)} />
          <Route path="/admin/messages" element={adminRoute(<AdminMessages />)} />
          <Route path="/admin/users" element={adminRoute(<AdminUsers />)} />
          <Route path="/admin/settings" element={adminRoute(<AdminSettings />)} />

          {/* Admin Membership Management sayfası */}
          <Route
            path="/admin/memberships"
            element={adminRoute(<AdminMembershipManagement />)}
          />

          {/* Admin Donations sayfası */}
          <Route
            path="/admin/donations"
            element={adminRoute(<AdminDonations />)}
          />

          {/* 404 sayfası */}
          <Route
            path="*"
            element={
              <Layout>
                <NotFoundPage />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
