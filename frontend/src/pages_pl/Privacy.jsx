import { useState, useEffect } from 'react';
import { API } from '../config/api';
import './Privacy.css';

export default function Privacy() {
  const [theme, setTheme] = useState('purple');

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await fetch(`${API}/settings`);
        const data = await response.json();
        if (data.success && data.data.theme) {
          setTheme(data.data.theme);
        }
      } catch (error) {
        console.error('Error fetching theme:', error);
      }
    };
    fetchTheme();
  }, []);

  return (
    <div className="privacy-page" data-theme={theme}>
      <div className="privacy-container">
        <h1>Polityka Prywatności</h1>
        <p className="last-updated">Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <section>
          <h2>1. Informacje, które zbieramy</h2>
          <p>Podczas rezerwacji wizyty przez naszą stronę internetową zbieramy:</p>
          <ul>
            <li>Imię i nazwisko</li>
            <li>Adres e-mail</li>
            <li>Numer telefonu (opcjonalnie)</li>
            <li>Data i godzina wizyty</li>
          </ul>
        </section>

        <section>
          <h2>2. Jak wykorzystujemy Twoje dane</h2>
          <p>Wykorzystujemy Twoje dane osobowe wyłącznie w celu:</p>
          <ul>
            <li>Zarządzania i potwierdzania wizyt</li>
            <li>Wysyłania przypomnień o wizytach</li>
            <li>Komunikacji dotyczącej zmian lub odwołań wizyt</li>
            <li>Odpowiadania na Twoje zapytania</li>
          </ul>
        </section>

        <section>
          <h2>3. Przechowywanie danych</h2>
          <p>Twoje dane są bezpiecznie przechowywane w naszej bazie danych i są dostępne tylko dla upoważnionego personelu. Przechowujemy Twoje informacje przez czas trwania wizyty oraz przez rozsądny okres po jej zakończeniu w celach ewidencyjnych.</p>
        </section>

        <section>
          <h2>4. Twoje prawa</h2>
          <p>Zgodnie z RODO i przepisami o ochronie danych masz prawo do:</p>
          <ul>
            <li>Dostępu do swoich danych osobowych</li>
            <li>Poprawiania nieprawidłowych danych</li>
            <li>Żądania usunięcia swoich danych</li>
            <li>Sprzeciwu wobec przetwarzania danych</li>
            <li>Przenoszenia danych</li>
          </ul>
        </section>

        <section>
          <h2>5. Usuwanie danych</h2>
          <p>Możesz w każdej chwili zażądać usunięcia swoich danych osobowych poprzez:</p>
          <ul>
            <li>Wysłanie wiadomości e-mail na adres podany na stronie Kontakt</li>
            <li>Użycie linku do anulowania w e-mailu potwierdzającym wizytę</li>
          </ul>
          <p>Przetworzenie Twojego żądania nastąpi w ciągu 30 dni.</p>
        </section>

        <section>
          <h2>6. Pliki cookie</h2>
          <p>Używamy niezbędnych plików cookie do utrzymania sesji i preferencji językowych. Te pliki cookie są konieczne do prawidłowego działania strony i nie śledzą Twoich danych osobowych.</p>
        </section>

        <section>
          <h2>7. Udostępnianie danych</h2>
          <p>Nie sprzedajemy, nie wymieniamy ani nie udostępniamy Twoich danych osobowych stronom trzecim. Twoje dane są wykorzystywane wyłącznie do zarządzania wizytami.</p>
        </section>

        <section>
          <h2>8. Bezpieczeństwo</h2>
          <p>Wdrażamy odpowiednie środki techniczne i organizacyjne w celu ochrony Twoich danych osobowych przed nieuprawnionym dostępem, zmianą, ujawnieniem lub zniszczeniem.</p>
        </section>

        <section>
          <h2>9. Kontakt</h2>
          <p>Jeśli masz pytania dotyczące niniejszej Polityki Prywatności lub chcesz skorzystać ze swoich praw dotyczących danych, skontaktuj się z nami za pośrednictwem strony Kontakt.</p>
        </section>
      </div>
    </div>
  );
}
