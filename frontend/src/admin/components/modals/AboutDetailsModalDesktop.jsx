import Modal from '../Modal';
import AboutDetailsEditor from '../AboutDetailsEditor';
import { useAdminTranslation } from '../../utils/useAdminTranslation';

function AboutDetailsModalDesktop({ isOpen, onClose }) {
  const { t } = useAdminTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('aboutDetails.modalTitle')} maxWidth="900px" closeOnOverlayClick={false}>
      <AboutDetailsEditor onCancel={onClose} />
    </Modal>
  );
}

export default AboutDetailsModalDesktop;
