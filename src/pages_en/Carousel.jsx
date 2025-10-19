import { useState } from 'react';
import CalendarModal from '../components/booking/CalendarModal';
import './Carousel.css';

export default function Carousel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % services.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  };
  
  const services = [
    {
      title: "Individual Therapy Session",
      duration: "50 minutes",
      price: "$120",
      description: "One-on-one therapy session focused on your personal goals and challenges. Tailored approach to meet your specific needs.",
      features: ["Personalized treatment plan", "Confidential environment", "Evidence-based techniques"]
    },
    {
      title: "Couples Therapy Session",
      duration: "60 minutes",
      price: "$150",
      description: "Work together to improve communication, resolve conflicts, and strengthen your relationship.",
      features: ["Joint sessions", "Communication strategies", "Conflict resolution tools"]
    },
    {
      title: "Initial Consultation",
      duration: "30 minutes",
      price: "$60",
      description: "Get to know each other and discuss your needs. This session helps determine the best approach for your therapy journey.",
      features: ["Assessment", "Treatment planning", "Questions & answers"]
    },
    {
      title: "Group Therapy Session",
      duration: "90 minutes",
      price: "$50",
      description: "Connect with others facing similar challenges in a supportive group environment led by a professional therapist.",
      features: ["Small groups (6-8 people)", "Peer support", "Shared experiences"]
    },
    {
      title: "Online Therapy Session",
      duration: "50 minutes",
      price: "$100",
      description: "Convenient therapy from the comfort of your home via secure video call. Same quality care, more flexibility.",
      features: ["Video sessions", "Flexible scheduling", "Secure platform"]
    },
    {
      title: "Extended Session",
      duration: "90 minutes",
      price: "$180",
      description: "Longer session for deeper work on complex issues or intensive therapy needs.",
      features: ["Extended time", "Deep dive sessions", "Complex issue resolution"]
    }
  ];

  return (
    <div className="prices-page">
      <div className="prices-header">
        <h1>Our Services & Pricing</h1>
        <p>Choose the service that best fits your needs. All sessions are by appointment only.</p>
      </div>
      
      <div className="container">
        <div className="carousel-container">
          <button className="carousel-btn prev" onClick={prevSlide}>‹</button>
          
          <div className="carousel-wrapper">
            <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {services.map((service, index) => (
                <div key={index} className="carousel-slide">
                  <div className="price-card">
                    <div className="price-card-header">
                      <h3>{service.title}</h3>
                      <span className="duration">{service.duration}</span>
                    </div>
                    <div className="price-amount">{service.price}</div>
                    <p className="price-description">{service.description}</p>
                    <ul className="price-features">
                      {service.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                    <button className="book-button" onClick={() => setIsModalOpen(true)}>Book Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button className="carousel-btn next" onClick={nextSlide}>›</button>
        </div>
        
        <div className="carousel-dots">
          {services.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
        
        <div className="pricing-note">
          <h3>Payment & Insurance</h3>
          <p>We accept most major insurance plans. Please contact us to verify your coverage. Self-pay options and sliding scale fees available upon request.</p>
        </div>
      </div>
      <CalendarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
