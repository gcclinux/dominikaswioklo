import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './CookieBanner.css';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const text = {
    en: {
      message: 'We use essential cookies to maintain your session and preferences. No tracking cookies are used.',
      privacy: 'Privacy Policy',
      accept: 'Accept'
    },
    pl: {
      message: 'Używamy niezbędnych plików cookie do utrzymania sesji i preferencji. Nie używamy plików śledzących.',
      privacy: 'Polityka Prywatności',
      accept: 'Akceptuj'
    }
  };

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p>{text[language].message}</p>
        <Link to="/privacy" className="cookie-link">{text[language].privacy}</Link>
      </div>
      <button onClick={handleAccept} className="cookie-accept">
        {text[language].accept}
      </button>
    </div>
  );
}
