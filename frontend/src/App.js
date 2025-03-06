import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Doğru dosya yollarını kullanarak bileşenleri import edelim
// Dosya adlarını tam olarak dosya sistemindeki gibi yazalım
import Navbar from './components/pages/navbar';  // küçük harf 'n'
import HomePage from './components/pages/homePage';
import About from './components/pages/about';
import LoginForm from './components/pages/loginForm';
import RegisterForm from './components/pages/registerForm';
import ProfilePage from './components/pages/profilePage';
import Events from './components/pages/events';
import EventDetail from './components/pages/eventDetail';
import CreateEvent from './components/pages/createEvent';  // küçük harf 'c'
import ProtectedRoute from './components/protectedRoute';  // küçük harf 'p'
import AdminRoute from './components/adminRoute';  // büyük harf 'A'
import Layout from './components/Layout/layout';
import NotFoundPage from './components/pages/notFoundPage';
import Donate from './components/pages/donate';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/donation" element={<Donate />} />  {/* Bağış sayfası rotası */}
            
            {/* Admin route for creating events */}
            <Route 
              path="/events/create" 
              element={
                <AdminRoute>
                  <CreateEvent />
                </AdminRoute>
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
            
            {/* 404 sayfası */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;