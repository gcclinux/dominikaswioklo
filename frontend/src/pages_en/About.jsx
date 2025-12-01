import './About.css';

export default function About() {
  return (
    <div className="about-page">
      <div className="about-header">
        <h1>About Me</h1>
        <p>Dedicated to helping children discover their potential through compassionate care</p>
      </div>
      
      <div className="container">
        <div className="about-content">
          <div className="about-intro">
            <h2>About EasyScheduler</h2>
            <p>EasyScheduler is a modern appointment scheduling solution designed to help professionals manage their bookings efficiently. Configure this section in the admin panel to describe your practice or business.</p>
          </div>

          <div className="about-section">
            <h3>My Approach</h3>
            <p>Fascinated by physiotherapy, I strive to help each young patient learn a bit of anatomy and understand how their body works in practice. In my practice, the most important thing is the relationship with the child – it's through this connection that every little one feels safe and open to the therapeutic journey we share together.</p>
          </div>

          <div className="about-section">
            <h3>Expertise & Methods</h3>
            <p>I utilize a wide range of therapeutic methods, including:</p>
            <ul>
              <li>Sensory Integration Therapy (FITS)</li>
              <li>Hand Therapy</li>
              <li>Manual Therapy in Pediatrics</li>
              <li>Zoga Therapy</li>
              <li>Kinesiotaping</li>
              <li>NDT Bobath Therapy (ongoing training)</li>
            </ul>
            <p>I continuously expand my qualifications to provide the best possible care for my young patients.</p>
          </div>

          <div className="about-section personal">
            <h3>Beyond the Clinic</h3>
            <p>Personally, I'm a mother to a three-year-old daughter, a cat guardian, and a cycling enthusiast.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
