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
      title: "Terapia NDT Bobath",
      duration: "50 minut",
      price: "150 zł",
      description: "Terapia neurodewelopmentalna wspierająca rozwój motoryczny dzieci.",
      features: ["Indywidualny plan terapii", "Wsparcie rozwoju", "Techniki oparte na dowodach"]
    },
    {
      title: "Fizjoterapia",
      duration: "50 minut",
      price: "150 zł",
      description: "Kompleksowa fizjoterapia dostosowana do potrzeb dziecka.",
      features: ["Ocena funkcjonalna", "Ćwiczenia terapeutyczne", "Wsparcie rozwoju"]
    },
    {
      title: "Terapia Wad Postawy",
      duration: "50 minut",
      price: "150 zł",
      description: "Korekcja i terapia wad postawy u dzieci.",
      features: ["Analiza postawy", "Ćwiczenia korekcyjne", "Edukacja rodziców"]
    },
    {
      title: "Terapia Integracji Sensorycznej",
      duration: "50 minut",
      price: "150 zł",
      description: "Wsparcie dzieci w odkrywaniu świata zmysłów i pokonywaniu codziennych trudności.",
      features: ["Diagnoza sensoryczna", "Terapia SI", "Wsparcie rozwoju"]
    },
    {
      title: "Terapia Ręki",
      duration: "50 minut",
      price: "150 zł",
      description: "Specjalistyczna terapia usprawniająca funkcje ręki.",
      features: ["Ćwiczenia precyzji", "Rozwój motoryki małej", "Funkcjonalne podejście"]
    },
    {
      title: "Kinesiotaping",
      duration: "30 minut",
      price: "80 zł",
      description: "Aplikacja taśm kinesiotapingowych wspierających terapię.",
      features: ["Wsparcie mięśni", "Redukcja bólu", "Poprawa funkcji"]
    }
  ];

  return (
    <div className="prices-page">
      <div className="prices-header">
        <h1>Oferta i Cennik</h1>
        <p>Wybierz usługę najlepiej dopasowaną do Twoich potrzeb. Wszystkie wizyty wymagają wcześniejszego umówienia.</p>
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
                    <button className="book-button" onClick={() => setIsModalOpen(true)}>Umów Wizytę</button>
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
          <h3>Płatności i Ubezpieczenia</h3>
          <p>Akceptujemy większość głównych planów ubezpieczeniowych. Skontaktuj się z nami, aby zweryfikować swoje ubezpieczenie. Dostępne opcje płatności prywatnej i ruchoma skala opłat na życzenie.</p>
        </div>
      </div>
      <CalendarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
