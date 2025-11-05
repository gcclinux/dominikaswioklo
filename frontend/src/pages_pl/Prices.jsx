import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../config/api';
import './Prices.css';

export default function Prices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointmentTypes();
  }, []);

  const fetchAppointmentTypes = async () => {
    try {
      const response = await fetch(`${API}/appointment-types?language=pl`);
      const data = await response.json();
      if (data.success) {
        const types = data.data.types.map(type => ({
          title: type.appName,
          duration: `${type.appDuration} minut`,
          price: type.appPrice ? `${type.appPrice} ${type.appCurrency}` : 'Skontaktuj się w sprawie ceny',
          description: type.appDescription || '',
          features: type.appFeatures ? type.appFeatures.split('\n').filter(f => f.trim()) : [],
          appTag: type.appTag
        }));
        setServices(types);
      }
    } catch (error) {
      console.error('Error fetching appointment types:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="prices-page">
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Ładowanie usług...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prices-page">
      <div className="prices-header">
        <h1>Oferta i Cennik</h1>
        <p>Wybierz usługę najlepiej dopasowaną do Twoich potrzeb. Wszystkie wizyty wymagają wcześniejszego umówienia.</p>
      </div>
      
      <div className="container">
        <div className="prices-grid">
          {services.map((service, index) => (
            <div key={index} className="price-card">
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
              <button className="book-button" onClick={() => navigate(`/easyscheduler${service.appTag ? `?appTag=${service.appTag}` : ''}`)}>Umów Wizytę</button>
            </div>
          ))}
        </div>
        
        <div className="pricing-note">
          <h3>Płatności i Ubezpieczenia</h3>
          <p>Akceptujemy większość głównych planów ubezpieczeniowych. Skontaktuj się z nami, aby zweryfikować swoje ubezpieczenie. Dostępne opcje płatności prywatnej i ruchoma skala opłat na życzenie.</p>
        </div>
      </div>

    </div>
  );
}
