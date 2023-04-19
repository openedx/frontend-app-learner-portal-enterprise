import React from 'react';
import PropTypes from 'prop-types';

import BasicNavigateToCourseware from './BasicNavigateToCourseware';
import UpgradeAndNavigateToCourseware from './UpgradeAndNavigateToCourseware';

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const NavigateToCourseware = ({
  contentKey,
  courseRunUrl,
  shouldUpgradeUserEnrollment,
  userSubsidyApplicableToCourse,
  onUpgradeClick,
  onUpgradeSuccess,
  onUpgradeError,
}) => {
  if (shouldUpgradeUserEnrollment) {
    return (
      <UpgradeAndNavigateToCourseware
        userSubsidyApplicableToCourse={userSubsidyApplicableToCourse}
        contentKey={contentKey}
        courseRunUrl={courseRunUrl}
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
  userSubsidyApplicableToCourse: PropTypes.shape().isRequired,
  onUpgradeClick: PropTypes.func.isRequired,
  onUpgradeSuccess: PropTypes.func.isRequired,
  onUpgradeError: PropTypes.func.isRequired,
};

export default NavigateToCourseware;
