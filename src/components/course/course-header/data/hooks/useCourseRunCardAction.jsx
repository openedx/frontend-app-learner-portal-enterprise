import { getConfig } from '@edx/frontend-platform';
import { Stack } from '@edx/paragon';

import StatefulEnroll from '../../../../stateful-enroll';
import { COURSE_MODES_MAP } from '../../../data/constants';
import { NavigateToCourseware } from '../../course-run-actions';
import RedemptionStatusText from '../../RedemptionStatusText';
import useRedemptionStatus from './useRedemptionStatus';

/**
 * Checks whether the user's existing enrollment should be upgraded based on its mode and whether
 * the is a redeemable subsidy applicable to the course.
 * @param {object} args
 * @param {object} args.userEnrollment The user's existing enrollment, with a ``mode`` property.
 * @param {object} args.userSubsidyApplicableToCourse A redeemable subsidy applicable to the course.
 * @returns True if the user's enrollment should be upgraded, false otherwise.
 */
const checkUserEnrollmentUpgradeEligibility = ({
  userEnrollment,
  userSubsidyApplicableToCourse,
}) => {
  const isAutoUpgradeEnabled = !!getConfig().FEATURE_ENABLE_EMET_AUTO_UPGRADE_ENROLLMENT_MODE;
  const isAuditEnrollment = userEnrollment.mode === COURSE_MODES_MAP.AUDIT;
  const canUpgrade = !!userSubsidyApplicableToCourse;
  return isAutoUpgradeEnabled && isAuditEnrollment && canUpgrade;
};

/**
 * Returns the appropriate action to render for a course run card, based on the user's enrollment.
 * @param {object} args
 * @param {boolean} args.isUserEnrolled Whether the user is already enrolled in the course run.
 * @param {object} args.userEnrollment The user's enrollment in the course run, if any.
 * @param {string} args.courseRunUrl The course run url to navigate to courseware.
 * @param {string} args.contentKey The course run key.
 * @param {string} args.userSubsidyApplicableToCourse The redeemable subsidy applicable to the course, if any.
 * @returns A JSX element to render as the CTA for the course run.
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

  // TODO: pass redeemable access policy API url (if any) so it knows which policy to redeem against
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
