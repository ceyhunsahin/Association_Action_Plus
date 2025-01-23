import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import './App.css';
import Layout from './components/Layout/Layout';
import HomePage from './components/pages/HomePage';
import About from './components/pages/About';
import Events from './components/pages/Events';
import EventDetail, { loader as eventLoader } from './components/pages/EventDetail';
import Gallery from './components/pages/Gallery';
import ProfilePage from './components/pages/ProfilePage';
import RegisterForm from './components/pages/RegisterForm';
import LoginForm from './components/pages/LoginForm';
import ErrorPage from './components/pages/ErrorPage';
import Contact from './components/pages/Contact';
import Counter from './components/pages/Counter';
import EventCreate from './components/pages/CreateEvent';
import { AuthProvider } from './context/AuthContext';

// Router yapılandırması
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<ErrorPage />}>
      <Route index element={<HomePage />} />
      <Route path="about" element={<About />} />
      <Route path="events" element={<Events />} />
      <Route path="events/:id" element={<EventDetail />} loader={eventLoader} errorElement={<ErrorPage />} />
      <Route path="gallery" element={<Gallery />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="register" element={<RegisterForm />} />
      <Route path="login" element={<LoginForm />} />
      <Route path="contact" element={<Contact />} />
      <Route path="counter" element={<Counter />} />
      <Route path="eventcreate" element={<EventCreate />} />
      <Route path="*" element={<ErrorPage />} />
    </Route>
  )
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;