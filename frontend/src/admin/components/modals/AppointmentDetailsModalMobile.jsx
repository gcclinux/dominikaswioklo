import Modal from '../Modal';
import AppointmentTypesEditorNew from '../AppointmentTypesEditorNew';

function AppointmentDetailsModalMobile({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📋 Appointment Details" maxWidth="100%">
      <AppointmentTypesEditorNew onCancel={onClose} />
    </Modal>
  );
}

export default AppointmentDetailsModalMobile;
