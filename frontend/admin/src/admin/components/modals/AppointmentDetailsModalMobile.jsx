import Modal from '../Modal';
import AppointmentTypesEditorMobile from '../AppointmentTypesEditorMobile';

function AppointmentDetailsModalMobile({ isOpen, onClose, appointmentTypes, currency, onSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📋 Appointment Details" maxWidth="100%">
      <AppointmentTypesEditorMobile
        appointmentTypes={appointmentTypes}
        currency={currency}
        onSave={onSave}
        onCancel={onClose}
      />
    </Modal>
  );
}

export default AppointmentDetailsModalMobile;
