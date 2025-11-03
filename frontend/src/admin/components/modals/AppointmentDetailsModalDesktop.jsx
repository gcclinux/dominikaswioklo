import Modal from '../Modal';
import AppointmentTypesEditorNew from '../AppointmentTypesEditorNew';

function AppointmentDetailsModalDesktop({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📋 Appointment Details" maxWidth="950px">
      <AppointmentTypesEditorNew onCancel={onClose} />
    </Modal>
  );
}

export default AppointmentDetailsModalDesktop;
