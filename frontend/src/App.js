import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Sayfaları import et
import HomePage from './components/pages/HomePage';
import About from './components/pages/About';
import Events from './components/pages/Events';
import EventDetail from './components/pages/EventDetail';
import LoginForm from './components/pages/LoginForm';
import RegisterForm from './components/pages/RegisterForm';
import ProfilePage from './components/pages/ProfilePage';
import EventCreate from './components/pages/CreateEvent';
import Layout from './components/Layout/Layout';
import ErrorPage from './components/pages/ErrorPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/create-event" element={<EventCreate />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;