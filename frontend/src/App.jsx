import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import HomeEN from './pages_en/Home';
import PricesEN from './pages_en/Prices';
import AboutEN from './pages_en/About';
import ContactEN from './pages_en/Contact';
import AppointmentEN from './pages_en/Appointment';
import HomePL from './pages_pl/Home';
import PricesPL from './pages_pl/Prices';
import AboutPL from './pages_pl/About';
import ContactPL from './pages_pl/Contact';
import AppointmentPL from './pages_pl/Appointment';
import AdminApp from './admin/AdminApp';
import WeeklyScheduler from './components/WeeklyScheduler';
import { useState, useEffect } from 'react';
import { API } from './config/api';

function SchedulerPage() {
  const [appointmentType, setAppointmentType] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const appTag = params.get('appTag');
    
    if (appTag) {
      fetchAppointmentType(appTag);
    }
  }, []);

  const fetchAppointmentType = async (tag) => {
    try {
      const response = await fetch(`${API}/appointment-types`);
      const data = await response.json();
      if (data.success && data.data.types) {
        const type = data.data.types.find(t => t.appTag === tag);
        if (type) {
          setAppointmentType({
            name: type.appName,
            tag: type.appTag,
            price: type.appPrice,
            currency: data.data.currency
          });
        }
      }
    } catch (error) {
      console.error('Error fetching appointment type:', error);
    }
  };

  return <WeeklyScheduler appointmentType={appointmentType} />;
}

function AppContent() {
  const { language } = useLanguage();
  
  const Home = language === 'en' ? HomeEN : HomePL;
  const Prices = language === 'en' ? PricesEN : PricesPL;
  const About = language === 'en' ? AboutEN : AboutPL;
  const Contact = language === 'en' ? ContactEN : ContactPL;
  const Appointment = language === 'en' ? AppointmentEN : AppointmentPL;
  
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/easyscheduler" element={<SchedulerPage />} />
      <Route path="/" element={<Home />} />
      <Route path="/prices" element={<Prices />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/appointment" element={<Appointment />} />
    </Routes>
  );
}

function MainLayout() {
  return (
    <>
      <Navbar />
      <AppContent />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/easyscheduler" element={<SchedulerPage />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}
