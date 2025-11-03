import Modal from '../Modal';
import CustomerLimitsEditor from '../CustomerLimitsEditor';

function CustomerLimitsModalDesktop({ isOpen, onClose, settings, onSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📊 Customer Booking Limits" maxWidth="800px">
      {settings && (
        <CustomerLimitsEditor
          maxApp={settings.maxApp}
          maxAppWeek={settings.maxAppWeek}
          onSave={onSave}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}

export default CustomerLimitsModalDesktop;
