import Modal from '../Modal';
import AppointmentTypesEditorNew from '../AppointmentTypesEditorNew';
import { useAdminTranslation } from '../../utils/useAdminTranslation';

function AppointmentDetailsModalDesktop({ isOpen, onClose }) {
  const { t } = useAdminTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('appointmentTypes.modalTitle')} maxWidth="950px">
      <AppointmentTypesEditorNew onCancel={onClose} />
    </Modal>
  );
}

export default AppointmentDetailsModalDesktop;
