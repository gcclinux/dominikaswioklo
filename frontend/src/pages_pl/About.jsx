import './About.css';

export default function About() {
  return (
    <div className="about-page">
      <div className="about-header">
        <h1>O Mnie</h1>
        <p>Pomagam dzieciom odkrywać ich potencjał poprzez troskliwą opiekę</p>
      </div>
      
      <div className="container">
        <div className="about-content">
          <div className="about-intro">
            <h2>O EasyScheduler</h2>
            <p>EasyScheduler to nowoczesne rozwiązanie do planowania wizyt, zaprojektowane, aby pomóc profesjonalistom efektywnie zarządzać rezerwacjami. Skonfiguruj tę sekcję w panelu administracyjnym, aby opisać swoją praktykę lub firmę.</p>
          </div>

          <div className="about-section">
            <h3>Moje Podejście</h3>
            <p>Zafascynowana fizjoterapią, w pracy z dziećmi staram się, by każdy mały pacjent uczył się trochę anatomii i funkcjonowania ciała w praktyce. W gabinecie najważniejsza jest dla mnie relacja z dzieckiem – to dzięki niej każdy maluch czuje się bezpiecznie i otwarty na wspólną przygodę z terapią.</p>
          </div>

          <div className="about-section">
            <h3>Specjalizacja i Metody</h3>
            <p>Korzystam z szerokiego wachlarza metod, m.in.:</p>
            <ul>
              <li>Terapia Integracji Sensorycznej (FITS)</li>
              <li>Terapia Ręki</li>
              <li>Terapia Manualna w Pediatrii</li>
              <li>Zoga Therapy</li>
              <li>Kinesiotaping</li>
              <li>Terapia NDT Bobath (w trakcie szkolenia)</li>
            </ul>
            <p>Stale poszerzam swoje kwalifikacje, aby zapewnić najlepszą możliwą opiekę moim małym pacjentom.</p>
          </div>

          <div className="about-section personal">
            <h3>Prywatnie</h3>
            <p>Mama trzyletniej córki, opiekunka kota i miłośniczka roweru.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
