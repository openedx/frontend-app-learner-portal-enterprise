import PropTypes from 'prop-types';

import BasicNavigateToCourseware from './BasicNavigateToCourseware';
import UpgradeAndNavigateToCourseware from './UpgradeAndNavigateToCourseware';

/**
 * Determines whether the user should be prompted to upgrade their
 * enrollment or simply navigate to the courseware.
 */
const NavigateToCourseware = ({
  contentKey,
  courseRunUrl,
  shouldUpgradeUserEnrollment,
  onUpgradeClick,
  onUpgradeSuccess,
  onUpgradeError,
}) => {
  if (shouldUpgradeUserEnrollment) {
    return (
      <UpgradeAndNavigateToCourseware
        contentKey={contentKey}
        onUpgradeClick={onUpgradeClick}
        onUpgradeSuccess={onUpgradeSuccess}
        onUpgradeError={onUpgradeError}
      />
    );
  }

  return <BasicNavigateToCourseware courseRunUrl={courseRunUrl} />;
};

NavigateToCourseware.propTypes = {
  contentKey: PropTypes.string.isRequired,
  courseRunUrl: PropTypes.string.isRequired,
  shouldUpgradeUserEnrollment: PropTypes.bool.isRequired,
  onUpgradeClick: PropTypes.func.isRequired,
  onUpgradeSuccess: PropTypes.func.isRequired,
  onUpgradeError: PropTypes.func.isRequired,
};

export default NavigateToCourseware;
