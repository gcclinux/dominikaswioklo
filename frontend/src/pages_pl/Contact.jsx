import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Wiadomość wysłana pomyślnie!' });
        e.target.reset();
      } else {
        setSubmitStatus({ type: 'error', message: 'Nie udało się wysłać wiadomości. Spróbuj ponownie.' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Nie udało się wysłać wiadomości. Spróbuj ponownie.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Kontakt</h1>
        <p>Chętnie odpowiem na wszelkie pytania i umówię dogodny termin spotkania</p>
      </div>
      
      <div className="container">
        <div className="contact-content">
          <div className="contact-info-section">
            <h2>Dane Kontaktowe</h2>
            <div className="contact-item">
              <i className="icon">📞</i>
              <div>
                <strong>Telefon</strong>
                <p><a href="tel:+441234567890">+44 123 456 7890</a></p>
              </div>
            </div>
            <div className="contact-item">
              <i className="icon">📍</i>
              <div>
                <strong>Adres</strong>
                <p>Holyrood Park, Edinburgh EH8 8AZ, UK</p>
              </div>
            </div>
            <div className="contact-item">
              <i className="icon">✉️</i>
              <div>
                <strong>Email</strong>
                <p><a href="mailto:contact@example.co.uk">contact@example.co.uk</a></p>
              </div>
            </div>
          </div>

          <div className="map-section">
            <h2>Jak Do Nas Trafić?</h2>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30074.479145358557!2d-3.1638600321501853!3d55.926853731858486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4887b87bb120ccb9%3A0xe723d1fdc5c0163!2sHolyrood%20Park!5e0!3m2!1sen!2suk!4v1764667881953!5m2!1sen!2suk" 
              className="map-iframe" 
              allowFullScreen 
              title="Mapa do Holyrood Park"
            ></iframe>
          </div>

          <div className="contact-form-section">
            <h2>Wyślij Wiadomość</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" name="name" placeholder="Twoje imię i nazwisko" required />
              <input type="email" name="email" placeholder="Twój adres e-mail" required />
              <textarea name="message" rows="5" placeholder="Twoja wiadomość" required></textarea>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Wysyłanie...' : 'Wyślij Wiadomość'}
              </button>
              {submitStatus && <p className={`submit-status ${submitStatus.type}`}>{submitStatus.message}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
