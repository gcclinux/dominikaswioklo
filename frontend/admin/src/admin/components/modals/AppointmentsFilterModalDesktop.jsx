import Modal from '../Modal';
import AppointmentsFilterEditor from '../AppointmentsFilterEditor';

function AppointmentsFilterModalDesktop({ isOpen, onClose, settings, onSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧮 Appointments Filter" maxWidth="600px">
      {settings && (
        <AppointmentsFilterEditor
          pastDays={settings.pastAppointmentsDays}
          futureDays={settings.futureAppointmentsDays}
          onSave={onSave}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}

export default AppointmentsFilterModalDesktop;
