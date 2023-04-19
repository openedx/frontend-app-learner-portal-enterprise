import { Stack } from '@edx/paragon';

import StatefulEnroll from '../../../../stateful-enroll';
import { COURSE_MODES_MAP } from '../../../data/constants';
import { NavigateToCourseware } from '../../course-run-actions';
import RedemptionStatusText from '../../RedemptionStatusText';
import useRedemptionStatus from './useRedemptionStatus';

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
  return isAuditEnrollment && canUpgrade;
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
  const {
    redemptionStatus,
    handleRedeemClick,
    handleRedeemSuccess,
    handleRedeemError,
  } = useRedemptionStatus();

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
          redemptionStatus={redemptionStatus}
          isUpgrading={shouldUpgradeUserEnrollment}
        />
      </Stack>
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
      <RedemptionStatusText redemptionStatus={redemptionStatus} />
    </Stack>
  );
};

export default useCourseRunCardAction;
