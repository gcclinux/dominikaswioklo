import Modal from '../Modal';
import AppointmentTypesEditorNew from '../AppointmentTypesEditorNew';
import { useAdminTranslation } from '../../utils/useAdminTranslation';

function AppointmentDetailsModalMobile({ isOpen, onClose }) {
  const { t } = useAdminTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('appointmentTypes.modalTitle')} maxWidth="100%">
      <AppointmentTypesEditorNew onCancel={onClose} />
    </Modal>
  );
}

export default AppointmentDetailsModalMobile;
