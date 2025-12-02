import { useState, useEffect } from 'react';
import './About.css';
import { API } from '../config/api';

// Default/fallback content for each section (Polish)
const defaultSections = {
  header: {
    title: 'O Mnie',
    body: 'Pomagam dzieciom odkrywać ich potencjał poprzez troskliwą opiekę'
  },
  intro: {
    title: 'O EasyScheduler',
    body: 'EasyScheduler to nowoczesne rozwiązanie do planowania wizyt, zaprojektowane, aby pomóc profesjonalistom efektywnie zarządzać rezerwacjami. Skonfiguruj tę sekcję w panelu administracyjnym, aby opisać swoją praktykę lub firmę.'
  },
  approach: {
    title: 'Moje Podejście',
    body: 'Zafascynowana fizjoterapią, w pracy z dziećmi staram się, by każdy mały pacjent uczył się trochę anatomii i funkcjonowania ciała w praktyce. W gabinecie najważniejsza jest dla mnie relacja z dzieckiem – to dzięki niej każdy maluch czuje się bezpiecznie i otwarty na wspólną przygodę z terapią.'
  },
  expertise: {
    title: 'Specjalizacja i Metody',
    body: '<p>Korzystam z szerokiego wachlarza metod, m.in.:</p><ul><li>Terapia Integracji Sensorycznej (FITS)</li><li>Terapia Ręki</li><li>Terapia Manualna w Pediatrii</li><li>Zoga Therapy</li><li>Kinesiotaping</li><li>Terapia NDT Bobath (w trakcie szkolenia)</li></ul><p>Stale poszerzam swoje kwalifikacje, aby zapewnić najlepszą możliwą opiekę moim małym pacjentom.</p>'
  },
  personal: {
    title: 'Prywatnie',
    body: 'Mama trzyletniej córki, opiekunka kota i miłośniczka roweru.'
  }
};

export default function About() {
  const [sections, setSections] = useState(defaultSections);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`${API}/about/default`);
        const data = await response.json();
        
        if (data.success && data.data) {
          // Merge API data with defaults (use API data if available, fallback to defaults)
          const mergedSections = { ...defaultSections };
          Object.keys(data.data).forEach(key => {
            if (data.data[key] && (data.data[key].title || data.data[key].body)) {
              mergedSections[key] = {
                title: data.data[key].title || defaultSections[key]?.title || '',
                body: data.data[key].body || defaultSections[key]?.body || ''
              };
            }
          });
          setSections(mergedSections);
        }
      } catch (error) {
        console.error('Error fetching about sections:', error);
        // Keep default sections on error
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  // Helper to render HTML content safely
  const renderHtml = (html) => {
    return { __html: html };
  };

  if (loading) {
    return (
      <div className="about-page">
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="about-page">
      <div className="about-header">
        <h1>{sections.header.title}</h1>
        <p dangerouslySetInnerHTML={renderHtml(sections.header.body)} />
      </div>
      
      <div className="container">
        <div className="about-content">
          <div className="about-intro">
            <h2>{sections.intro.title}</h2>
            <div dangerouslySetInnerHTML={renderHtml(sections.intro.body)} />
          </div>

          <div className="about-section">
            <h3>{sections.approach.title}</h3>
            <div dangerouslySetInnerHTML={renderHtml(sections.approach.body)} />
          </div>

          <div className="about-section">
            <h3>{sections.expertise.title}</h3>
            <div dangerouslySetInnerHTML={renderHtml(sections.expertise.body)} />
          </div>

          <div className="about-section personal">
            <h3>{sections.personal.title}</h3>
            <div dangerouslySetInnerHTML={renderHtml(sections.personal.body)} />
          </div>
        </div>
      </div>
    </div>
  );
}
