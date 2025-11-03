import Modal from '../Modal';
import AppointmentTypesEditor from '../AppointmentTypesEditor';

function AppointmentDetailsModalDesktop({ isOpen, onClose, appointmentTypes, currency, onSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📋 Appointment Details" maxWidth="715px">
      <AppointmentTypesEditor
        appointmentTypes={appointmentTypes}
        currency={currency}
        onSave={onSave}
        onCancel={onClose}
      />
    </Modal>
  );
}

export default AppointmentDetailsModalDesktop;
