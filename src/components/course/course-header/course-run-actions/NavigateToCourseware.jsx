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
}) => {
  if (shouldUpgradeUserEnrollment) {
    return (
      <UpgradeAndNavigateToCourseware
        userSubsidyApplicableToCourse={userSubsidyApplicableToCourse}
        contentKey={contentKey}
        courseRunUrl={courseRunUrl}
      />
    );
  }

  return <BasicNavigateToCourseware courseRunUrl={courseRunUrl} />;
};

NavigateToCourseware.propTypes = {
  contentKey: PropTypes.string.isRequired,
  courseRunUrl: PropTypes.string.isRequired,
  shouldUpgradeUserEnrollment: PropTypes.bool.isRequired,
  // TODO: add shape object
  userSubsidyApplicableToCourse: PropTypes.shape().isRequired,
};

export default NavigateToCourseware;
