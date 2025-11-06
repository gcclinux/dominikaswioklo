import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Footer.css';

export default function Footer() {
  const { language } = useLanguage();

  const text = {
    en: {
      privacy: 'Privacy Policy',
      rights: 'All rights reserved'
    },
    pl: {
      privacy: 'Polityka Prywatności',
      rights: 'Wszelkie prawa zastrzeżone'
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <Link to="/privacy" className="footer-link">{text[language].privacy}</Link>
        <span className="footer-separator">•</span>
        <span>© {new Date().getFullYear()} {text[language].rights}</span>
      </div>
    </footer>
  );
}
