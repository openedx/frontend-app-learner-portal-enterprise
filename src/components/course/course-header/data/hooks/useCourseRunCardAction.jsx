import { useEffect, useState } from 'react';
import { Stack } from '@edx/paragon';
import { useIntl, defineMessages } from '@edx/frontend-platform/i18n';

import StatefulEnroll from '../../../../stateful-enroll';
import { COURSE_MODES_MAP } from '../../../data/constants';
import { NavigateToCourseware } from '../../course-run-actions';

const messages = defineMessages({
  errorHelperText: {
    id: 'useCourseRunCardAction.error.helperText',
    defaultMessage: 'An error occurred while processing your enrollment.',
    description: 'Helper text providing additional context for the error button label.',
  },
  successHelperText: {
    id: 'useCourseRunCardAction.success.helperText',
    defaultMessage: 'You were successfully enrolled. Redirecting to your course.',
    description: 'Helper text providing additional context for the success button label.',
  },
});

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const checkUserEnrollmentUpgradeEligibility = ({
  userEnrollment,
  userSubsidyApplicableToCourse,
}) => {
  const isAuditEnrollment = userEnrollment.mode === COURSE_MODES_MAP.AUDIT;
  const canUpgrade = !!userSubsidyApplicableToCourse;
  return !!(isAuditEnrollment && canUpgrade);
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
  const intl = useIntl();
  const [hasRedemptionSuccess, setHasRedemptionSuccess] = useState(false);
  const [hasRedemptionError, setHasRedemptionError] = useState(false);

  useEffect(() => {
    const cleanupOnUnmount = () => {
      setHasRedemptionSuccess(false);
      setHasRedemptionError(false);
    };
    return cleanupOnUnmount;
  }, []);

  const handleRedeemClick = () => {
    setHasRedemptionSuccess(false);
    setHasRedemptionError(false);
  };

  const handleRedeemSuccess = (transaction) => {
    setHasRedemptionSuccess(true);
    setHasRedemptionError(false);
    const { coursewareUrl } = transaction;
    console.log(`[EMET] Successfully enrolled. Redirecting to courseware URL (${coursewareUrl})!`);
    window.location.href = coursewareUrl;
  };

  const handleRedeemError = () => {
    setHasRedemptionSuccess(false);
    setHasRedemptionError(true);
  };

  if (isUserEnrolled) {
    const shouldUpgradeUserEnrollment = checkUserEnrollmentUpgradeEligibility({
      userEnrollment,
      userSubsidyApplicableToCourse,
    });
    console.log('shouldUpgradeUserEnrollment', shouldUpgradeUserEnrollment);
    return (
      <NavigateToCourseware
        shouldUpgradeUserEnrollment={shouldUpgradeUserEnrollment}
        contentKey={contentKey}
        courseRunUrl={courseRunUrl}
        userSubsidyApplicableToCourse={userSubsidyApplicableToCourse}
        onUpgradeClick={handleRedeemClick}
        onUpgradeSuccess={handleRedeemSuccess}
        onUpgradeError={handleRedeemError}
      />
    );
  }

  // TODO: pass redeemable access policy (if any) so it knows which policy to redeem
  return (
    <Stack gap={2}>
      <StatefulEnroll
        contentKey={contentKey}
        onClick={handleRedeemClick}
        onSuccess={handleRedeemSuccess}
        onError={handleRedeemError}
      />
      {hasRedemptionSuccess && (
        <div className="small text-gray">
          {intl.formatMessage(messages.successHelperText)}
        </div>
      )}
      {hasRedemptionError && (
        <div className="small text-danger">
          {intl.formatMessage(messages.errorHelperText)}
        </div>
      )}
    </Stack>
  );
};

export default useCourseRunCardAction;
