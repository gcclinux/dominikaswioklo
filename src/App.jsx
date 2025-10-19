import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import HomeEN from './pages_en/Home';
import PricesEN from './pages_en/Prices';
import CarouselEN from './pages_en/Carousel';
import AboutEN from './pages_en/About';
import ContactEN from './pages_en/Contact';
import AppointmentEN from './pages_en/Appointment';
import HomePL from './pages_pl/Home';
import PricesPL from './pages_pl/Prices';
import CarouselPL from './pages_pl/Carousel';
import AboutPL from './pages_pl/About';
import ContactPL from './pages_pl/Contact';
import AppointmentPL from './pages_pl/Appointment';

function AppContent() {
  const { language } = useLanguage();
  
  const Home = language === 'en' ? HomeEN : HomePL;
  const Prices = language === 'en' ? PricesEN : PricesPL;
  const Carousel = language === 'en' ? CarouselEN : CarouselPL;
  const About = language === 'en' ? AboutEN : AboutPL;
  const Contact = language === 'en' ? ContactEN : ContactPL;
  const Appointment = language === 'en' ? AppointmentEN : AppointmentPL;
  
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prices" element={<Prices />} />
        <Route path="/carousel" element={<Carousel />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/appointment" element={<Appointment />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}
