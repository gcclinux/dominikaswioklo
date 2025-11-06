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
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>When you book an appointment through our website, we collect:</p>
          <ul>
            <li>Name (first and last name)</li>
            <li>Email address</li>
            <li>Phone number (optional)</li>
            <li>Appointment date and time</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use your personal information solely for:</p>
          <ul>
            <li>Managing and confirming your appointments</li>
            <li>Sending appointment reminders</li>
            <li>Communicating about appointment changes or cancellations</li>
            <li>Responding to your inquiries</li>
          </ul>
        </section>

        <section>
          <h2>3. Data Storage</h2>
          <p>Your data is stored securely in our database and is only accessible to authorized personnel. We retain your information for the duration of your appointment and for a reasonable period afterward for record-keeping purposes.</p>
        </section>

        <section>
          <h2>4. Your Rights</h2>
          <p>Under GDPR and data protection laws, you have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Deletion</h2>
          <p>You can request deletion of your personal data at any time by:</p>
          <ul>
            <li>Sending an email to the contact address provided on our Contact page</li>
            <li>Using the cancellation link in your appointment confirmation email</li>
          </ul>
          <p>We will process your request within 30 days.</p>
        </section>

        <section>
          <h2>6. Cookies</h2>
          <p>We use essential cookies to maintain your session and language preferences. These cookies are necessary for the website to function properly and do not track your personal information.</p>
        </section>

        <section>
          <h2>7. Data Sharing</h2>
          <p>We do not sell, trade, or share your personal information with third parties. Your data is used exclusively for appointment management.</p>
        </section>

        <section>
          <h2>8. Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
        </section>

        <section>
          <h2>9. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us through the Contact page.</p>
        </section>
      </div>
    </div>
  );
}
