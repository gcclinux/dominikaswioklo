import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Prices from './pages/Prices';
import About from './pages/About';
import Contact from './pages/Contact';
import Appointment from './pages/Appointment';

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prices" element={<Prices />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/appointment" element={<Appointment />} />
      </Routes>
    </Router>
  );
}
