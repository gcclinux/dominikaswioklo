import Modal from '../Modal';
import CustomerLimitsEditorMobile from '../CustomerLimitsEditorMobile';

function CustomerLimitsModalMobile({ isOpen, onClose, settings, onSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📊 Booking Limits" maxWidth="100%">
      {settings && (
        <CustomerLimitsEditorMobile
          maxApp={settings.maxApp}
          maxAppWeek={settings.maxAppWeek}
          onSave={onSave}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}

export default CustomerLimitsModalMobile;
