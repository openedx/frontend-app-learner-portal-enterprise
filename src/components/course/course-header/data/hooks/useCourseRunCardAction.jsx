import { Stack, Button } from '@edx/paragon';

import StatefulEnroll from '../../../../stateful-enroll';
import { COURSE_MODES_MAP } from '../../../data/constants';
import ToExecutiveEducation2UEnrollment from '../../../enrollment/components/ToExecutiveEducation2UEnrollment';
import { NavigateToCourseware } from '../../course-run-actions';
import RedemptionStatusText from '../../RedemptionStatusText';
import useRedemptionStatus from './useRedemptionStatus';

/**
 * Checks whether the user's existing enrollment should be upgraded based on its mode and whether
 * there is a redeemable subsidy access policy applicable to the course.
 * @param {object} args
 * @param {object} args.userEnrollment The user's existing enrollment, with a ``mode`` property.
 * @param {object} args.subsidyAccessPolicy A redeemable subsidy access policy applicable to the course.
 * @returns True if the user's enrollment should be upgraded, false otherwise.
 */
const checkUserEnrollmentUpgradeEligibility = ({
  userEnrollment,
  subsidyAccessPolicy,
}) => {
  const isAuditEnrollment = userEnrollment.mode === COURSE_MODES_MAP.AUDIT;
  const canUpgrade = !!subsidyAccessPolicy;
  return isAuditEnrollment && canUpgrade;
};

/**
 * Returns the appropriate action to render for a course run card, based on the user's enrollment.
 * @param {object} args
 * @param {boolean} args.isUserEnrolled Whether the user is already enrolled in the course run.
 * @param {object} args.userEnrollment The user's enrollment in the course run, if any.
 * @param {string} args.courseRunUrl The course run url to navigate to courseware.
 * @param {string} args.externalCourseEnrollmentUrl The url to navigate to the course enrollment page
 * @param {string} args.contentKey The course run key.
 * @param {string} args.subsidyAccessPolicy The redeemable subsidy access policy applicable to the course, if any.
 * @param {boolean} args.userCanRequestSubsidyForCourse, Whether the user can request a subsidy for the course.
 *
 * @returns A JSX element to render as the CTA for the course run.
 */
const useCourseRunCardAction = ({
  isUserEnrolled,
  userEnrollment,
  courseRunUrl,
  externalCourseEnrollmentUrl,
  contentKey,
  subsidyAccessPolicy,
  userCanRequestSubsidyForCourse,
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
      subsidyAccessPolicy,
    });
    return (
      <Stack gap={2}>
        <NavigateToCourseware
          shouldUpgradeUserEnrollment={shouldUpgradeUserEnrollment}
          contentKey={contentKey}
          courseRunUrl={courseRunUrl}
          subsidyAccessPolicy={subsidyAccessPolicy}
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

  if (userCanRequestSubsidyForCourse) {
    // User can request a subsidy for the course, but is not enrolled so
    // hide the "Enroll" CTA in favor of the "Request enrollment" CTA below
    // the course run cards.
    return null;
  }

  if (!subsidyAccessPolicy) {
    return <Button data-testid="disabled-enroll-missing-subsidy-access-policy" disabled block>Enroll</Button>;
  }

  if (externalCourseEnrollmentUrl) {
    return (
      <ToExecutiveEducation2UEnrollment enrollmentUrl={externalCourseEnrollmentUrl} />
    );
  }

  return (
    <Stack gap={2}>
      <StatefulEnroll
        subsidyAccessPolicy={subsidyAccessPolicy}
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
