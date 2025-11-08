import Modal from '../Modal';
import NumberSettingEditor from '../NumberSettingEditor';
import { useAdminTranslation } from '../../utils/useAdminTranslation';

function DisplayAvailabilityModalDesktop({ isOpen, onClose, settings, onSave }) {
  const { t } = useAdminTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('displayAvailability.modalTitleDesktop')} maxWidth="650px">
      {settings && (
        <NumberSettingEditor
          currentValue={settings.displayAvailability}
          onSave={onSave}
          onCancel={onClose}
          min={1}
          max={52}
          step={1}
          label={t('displayAvailability.weeksAheadLabel')}
          recommendedRange={t('displayAvailability.recommendedRange') + ': 1-8'}
          helpText={t('displayAvailability.helpText')}
          previewText={(value) => value === 1 ? t('displayAvailability.previewSingleWeek') : t('displayAvailability.previewMultiWeeks', { weeks: value })}
        />
      )}
    </Modal>
  );
}

export default DisplayAvailabilityModalDesktop;
