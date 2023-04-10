import { useState } from 'react';
import { Stack } from '@edx/paragon';

import StatefulEnroll from '../../../../stateful-enroll';
import { COURSE_MODES_MAP } from '../../../data/constants';
import { NavigateToCourseware } from '../../course-run-actions';
import RedemptionStatusText from '../../RedemptionStatusText';

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
  const [hasRedemptionSuccess, setHasRedemptionSuccess] = useState(false);
  const [hasRedemptionError, setHasRedemptionError] = useState(false);

  const handleRedeemClick = () => {
    setHasRedemptionSuccess(false);
    setHasRedemptionError(false);
  };

  const handleRedeemSuccess = (transaction) => {
    setHasRedemptionSuccess(true);
    setHasRedemptionError(false);
    const { coursewareUrl } = transaction;
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
    return (
      <Stack gap={2}>
        <NavigateToCourseware
          shouldUpgradeUserEnrollment={shouldUpgradeUserEnrollment}
          contentKey={contentKey}
          courseRunUrl={courseRunUrl}
          userSubsidyApplicableToCourse={userSubsidyApplicableToCourse}
          onUpgradeClick={handleRedeemClick}
          onUpgradeSuccess={handleRedeemSuccess}
          onUpgradeError={handleRedeemError}
        />
        <RedemptionStatusText
          hasRedemptionSuccess={hasRedemptionSuccess}
          hasRedemptionError={hasRedemptionError}
          isUpgrading={shouldUpgradeUserEnrollment}
        />
      </Stack>
    );
  }

  // TODO: pass redeemable access policy (if any) so it knows which policy to redeem
  const enrollHelperTextId = 'course-run-card-enroll-helper-text';
  return (
    <Stack gap={2}>
      <StatefulEnroll
        contentKey={contentKey}
        onClick={handleRedeemClick}
        onSuccess={handleRedeemSuccess}
        onError={handleRedeemError}
        aria-describedby={enrollHelperTextId}
      />
      <RedemptionStatusText
        id={enrollHelperTextId}
        hasRedemptionSuccess={hasRedemptionSuccess}
        hasRedemptionError={hasRedemptionError}
      />
    </Stack>
  );
};

export default useCourseRunCardAction;
