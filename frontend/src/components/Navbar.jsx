import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API } from '../config/api';
import './Navbar.css';

export default function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const [siteTitle, setSiteTitle] = useState('Loading...');

  useEffect(() => {
    fetchSiteTitle();
  }, []);

  const fetchSiteTitle = async () => {
    try {
      const response = await fetch(`${API}/settings`);
      const data = await response.json();
      if (data.success && data.data.headerMessage) {
        setSiteTitle(data.data.headerMessage);
      }
    } catch (error) {
      console.error('Error fetching site title:', error);
      setSiteTitle('EasyScheduler');
    }
  };
  
  const text = {
    en: {
      home: 'Home',
      prices: 'Prices',
      about: 'About',
      contact: 'Contact',
      appointment: 'Book Appointment'
    },
    pl: {
      home: 'Strona Główna',
      prices: 'Cennik',
      about: 'O Mnie',
      contact: 'Kontakt',
      appointment: 'Umów Wizytę'
    }
  };
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">{siteTitle}</Link>
        <ul className="nav-menu">
          <li><Link to="/">{text[language].home}</Link></li>
          <li><Link to="/prices">{text[language].prices}</Link></li>
          <li><Link to="/about">{text[language].about}</Link></li>
          <li><Link to="/contact">{text[language].contact}</Link></li>
          <li><Link to="/prices" className="nav-cta">{text[language].appointment}</Link></li>
          <li className="lang-switcher">
            <button 
              onClick={() => toggleLanguage('en')} 
              className={language === 'en' ? 'active' : ''}
            >
              EN
            </button>
            <span>|</span>
            <button 
              onClick={() => toggleLanguage('pl')} 
              className={language === 'pl' ? 'active' : ''}
            >
             PL
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
