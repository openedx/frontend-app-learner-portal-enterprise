import PropTypes from 'prop-types';

import { EnrollButtonCta } from '../common';
import { shouldUpgradeUserEnrollment } from '../../data/utils';
import { useTrackSearchConversionClickHandler } from '../../data/hooks';

/**
 * Renders a hyperlink to the course info url (or enrollment url)
 * Uses the passed in enroll label as the Label shown along with enroll link
 */
const ToCoursewarePage = ({
  enrollLabel, enrollmentUrl, userEnrollment, subscriptionLicense,
}) => {
  const shouldUseEnrollmentUrl = shouldUpgradeUserEnrollment({
    userEnrollment,
    subscriptionLicense,
    enrollmentUrl,
  });
  const landingUrl = shouldUseEnrollmentUrl ? enrollmentUrl : userEnrollment.linkToCourse;
  const handleClick = useTrackSearchConversionClickHandler({
    href: landingUrl,
    eventName: 'edx.ui.enterprise.learner_portal.course.enroll_button.to_courseware.clicked',
  });

  return (
    <EnrollButtonCta
      enrollLabel={enrollLabel}
      href={landingUrl}
      onClick={handleClick}
      block
    />
  );
};

ToCoursewarePage.propTypes = {
  enrollLabel: PropTypes.node.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
  userEnrollment: PropTypes.shape().isRequired,
  subscriptionLicense: PropTypes.shape(),
};

ToCoursewarePage.defaultProps = {
  subscriptionLicense: undefined,
};

export default ToCoursewarePage;
