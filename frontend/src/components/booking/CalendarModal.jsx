import { GOOGLE_CALENDAR_CONFIG } from '../../config/calendar';
import './CalendarModal.css';

export default function CalendarModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <iframe 
          src={GOOGLE_CALENDAR_CONFIG.url} 
          className="calendar-iframe"
          title="Book Appointment"
        />
      </div>
    </div>
  );
}
