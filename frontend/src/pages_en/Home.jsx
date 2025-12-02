import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { API } from '../config/api';

// Default/fallback content for each section
const defaultSections = {
  hero: {
    title: 'Professional Therapy Services',
    body: 'Supporting your mental health journey with compassionate, evidence-based care'
  },
  servicesHeading: {
    title: 'Our Services',
    body: ''
  },
  serviceIndividual: {
    title: 'Individual Therapy',
    body: 'One-on-one sessions tailored to your personal needs and goals'
  },
  serviceCouples: {
    title: 'Couples Therapy',
    body: 'Strengthen your relationship through guided communication and understanding'
  },
  serviceGroup: {
    title: 'Group Sessions',
    body: 'Connect with others facing similar challenges in a supportive environment'
  },
  whyChooseUs: {
    title: 'Why Choose Us',
    body: 'We provide a safe, confidential space where you can explore your thoughts and feelings. Our approach combines proven therapeutic techniques with genuine care and understanding.'
  }
};

export default function Home() {
  const [sections, setSections] = useState(defaultSections);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`${API}/homecontent`);
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
        console.error('Error fetching home sections:', error);
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
      <div className="home">
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 dangerouslySetInnerHTML={renderHtml(sections.hero.title)} />
          <p dangerouslySetInnerHTML={renderHtml(sections.hero.body)} />
        </div>
      </section>

      <section className="services-preview">
        <div className="container">
          <h2 dangerouslySetInnerHTML={renderHtml(sections.servicesHeading.title)} />
          <div className="services-grid">
            <div className="service-card">
              <h3 dangerouslySetInnerHTML={renderHtml(sections.serviceIndividual.title)} />
              <p dangerouslySetInnerHTML={renderHtml(sections.serviceIndividual.body)} />
            </div>
            <div className="service-card">
              <h3 dangerouslySetInnerHTML={renderHtml(sections.serviceCouples.title)} />
              <p dangerouslySetInnerHTML={renderHtml(sections.serviceCouples.body)} />
            </div>
            <div className="service-card">
              <h3 dangerouslySetInnerHTML={renderHtml(sections.serviceGroup.title)} />
              <p dangerouslySetInnerHTML={renderHtml(sections.serviceGroup.body)} />
            </div>
          </div>
          <Link to="/prices" className="view-prices">View All Services & Prices →</Link>
        </div>
      </section>

      <section className="about-preview">
        <div className="container">
          <h2 dangerouslySetInnerHTML={renderHtml(sections.whyChooseUs.title)} />
          <div dangerouslySetInnerHTML={renderHtml(sections.whyChooseUs.body)} />
          <Link to="/about" className="learn-more">Learn More About Our Approach →</Link>
        </div>
      </section>
    </div>
  );
}
