import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { useIntl, defineMessages } from '@edx/frontend-platform/i18n';

import StatefulEnroll from '../../../../stateful-enroll';
import { COURSE_MODES_MAP, LEARNER_CREDIT_SUBSIDY_TYPE } from '../../../data/constants';

const messages = defineMessages({
  viewCourse: {
    id: 'useCourseRunCardAction.viewCourse',
    defaultMessage: 'View course',
    description: 'Label for button when learner is already enrolled.',
  },
});

const checkUserEnrollmentUpgradeEligibility = ({
  userEnrollment,
  userSubsidyApplicableToCourse,
}) => {
  const isAuditEnrollment = userEnrollment.mode === COURSE_MODES_MAP.AUDIT;
  const canUpgrade = !!userSubsidyApplicableToCourse;
  return !!(isAuditEnrollment && canUpgrade);
};

const BasicNavigateToCourseware = ({ courseRunUrl }) => {
  const intl = useIntl();
  return (
    <Button href={courseRunUrl}>
      {intl.formatMessage(messages.viewCourse)}
    </Button>
  );
};

BasicNavigateToCourseware.propTypes = {
  courseRunUrl: PropTypes.string.isRequired,
};

const UpgradeAndNavigateToCourseware = ({
  userSubsidyApplicableToCourse,
  contentKey,
  courseRunUrl,
}) => {
  const intl = useIntl();

  // When subsidyType === 'learnerCredit', attempt to re-redeem the course.
  // TODO: verify this assumption is correct for EMET APIs.
  if (userSubsidyApplicableToCourse.subsidyType === LEARNER_CREDIT_SUBSIDY_TYPE) {
    return (
      <StatefulEnroll contentKey={contentKey}>
        {intl.formatMessage(messages.viewCourse)}
      </StatefulEnroll>
    );
  }

  // fallback to navigating to courseware without upgrading. there's no supported upgrade path.
  return <BasicNavigateToCourseware courseRunUrl={courseRunUrl} />;
};

UpgradeAndNavigateToCourseware.propTypes = {
  contentKey: PropTypes.string.isRequired,
  courseRunUrl: PropTypes.string.isRequired,
  // TODO: add shape object
  userSubsidyApplicableToCourse: PropTypes.shape().isRequired,
};

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

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const useCourseRunCardAction = ({
  isUserEnrolled,
  userEnrollment,
  courseRunUrl,
  contentKey,
  userSubsidyApplicableToCourse,
}) => {
  if (isUserEnrolled) {
    const shouldUpgradeUserEnrollment = checkUserEnrollmentUpgradeEligibility({
      userEnrollment,
      userSubsidyApplicableToCourse,
    });
    return (
      <NavigateToCourseware
        shouldUpgradeUserEnrollment={shouldUpgradeUserEnrollment}
        contentKey={contentKey}
        courseRunUrl={courseRunUrl}
        userSubsidyApplicableToCourse={userSubsidyApplicableToCourse}
      />
    );
  }

  // TODO: pass redeemable access policy (if any) so it knows which policy to redeem
  return <StatefulEnroll contentKey={contentKey} />;
};

export default useCourseRunCardAction;
