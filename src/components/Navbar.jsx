import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">Mind Therapy</Link>
        <ul className="nav-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/prices">Prices</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/appointment" className="nav-cta">Book Appointment</Link></li>
        </ul>
      </div>
    </nav>
  );
}
