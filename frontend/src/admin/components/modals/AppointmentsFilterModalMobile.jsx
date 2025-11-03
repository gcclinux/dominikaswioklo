import Modal from '../Modal';
import AppointmentsFilterEditorMobile from '../AppointmentsFilterEditorMobile';

function AppointmentsFilterModalMobile({ isOpen, onClose, settings, onSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧮 Appointment Filter" maxWidth="100%">
      {settings && (
        <AppointmentsFilterEditorMobile
          pastDays={settings.pastAppointmentsDays}
          futureDays={settings.futureAppointmentsDays}
          onSave={onSave}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}

export default AppointmentsFilterModalMobile;
