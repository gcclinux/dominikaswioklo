import Modal from '../Modal';
import HomeDetailsEditor from '../HomeDetailsEditor';
import { useAdminTranslation } from '../../utils/useAdminTranslation';

function HomeDetailsModalMobile({ isOpen, onClose }) {
  const { t } = useAdminTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('homeDetails.modalTitle')} maxWidth="100%" closeOnOverlayClick={false}>
      <HomeDetailsEditor onCancel={onClose} />
    </Modal>
  );
}

export default HomeDetailsModalMobile;
