import { useState, useEffect } from 'react';
import './About.css';
import { API } from '../config/api';

// Default/fallback content for each section
const defaultSections = {
  header: {
    title: 'About Me',
    body: 'Dedicated to helping children discover their potential through compassionate care'
  },
  intro: {
    title: 'About EasyScheduler',
    body: 'EasyScheduler is a modern appointment scheduling solution designed to help professionals manage their bookings efficiently. Configure this section in the admin panel to describe your practice or business.'
  },
  approach: {
    title: 'My Approach',
    body: 'Fascinated by physiotherapy, I strive to help each young patient learn a bit of anatomy and understand how their body works in practice. In my practice, the most important thing is the relationship with the child – it\'s through this connection that every little one feels safe and open to the therapeutic journey we share together.'
  },
  expertise: {
    title: 'Expertise & Methods',
    body: '<p>I utilize a wide range of therapeutic methods, including:</p><ul><li>Sensory Integration Therapy (FITS)</li><li>Hand Therapy</li><li>Manual Therapy in Pediatrics</li><li>Zoga Therapy</li><li>Kinesiotaping</li><li>NDT Bobath Therapy (ongoing training)</li></ul><p>I continuously expand my qualifications to provide the best possible care for my young patients.</p>'
  },
  personal: {
    title: 'Beyond the Clinic',
    body: 'Personally, I\'m a mother to a three-year-old daughter, a cat guardian, and a cycling enthusiast.'
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
          <p>Loading...</p>
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
