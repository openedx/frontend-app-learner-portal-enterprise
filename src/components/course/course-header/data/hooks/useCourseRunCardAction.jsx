import { Stack, Button } from '@openedx/paragon';

import { useContext } from 'react';
import StatefulEnroll from '../../../../stateful-enroll';
import ToExecutiveEducation2UEnrollment from '../../../enrollment/components/ToExecutiveEducation2UEnrollment';
import { NavigateToCourseware } from '../../course-run-actions';
import RedemptionStatusText from '../../RedemptionStatusText';
import useRedemptionStatus from './useRedemptionStatus';
import { ToastsContext } from '../../../../Toasts';
import { COURSE_MODES_MAP } from '../../../../app/data';
import {
  EVENT_NAMES,
  useUserSubsidyApplicableToCourse,
  useUserHasLearnerCreditRequestForCourse,
  useUserHasSubsidyRequestForCourse,
} from '../../../data';

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
  userCanRequestSubsidyForCourse,
  course,
}) => {
  const { userSubsidyApplicableToCourse } = useUserSubsidyApplicableToCourse();
  const userHasSubsidyRequestForCourse = useUserHasSubsidyRequestForCourse(course.key);
  const userHasLearnerCreditRequest = useUserHasLearnerCreditRequestForCourse(course.key, ['requested']);
  const {
    redemptionStatus,
    handleRedeemClick,
    handleRedeemSuccess,
    handleRedeemError,
  } = useRedemptionStatus();

  const toasts = useContext(ToastsContext);

  const handleRedemptionSuccess = (transaction) => {
    if (!isUserEnrolled && !externalCourseEnrollmentUrl) {
      toasts?.addToast(`You enrolled in ${course.title}.`);
    }
    handleRedeemSuccess(transaction);
  };

  if (isUserEnrolled) {
    const shouldUpgradeUserEnrollment = checkUserEnrollmentUpgradeEligibility({
      userEnrollment,
      subsidyAccessPolicy: userSubsidyApplicableToCourse,
    });
    return (
      <Stack gap={2}>
        <NavigateToCourseware
          shouldUpgradeUserEnrollment={shouldUpgradeUserEnrollment}
          contentKey={contentKey}
          courseRunUrl={courseRunUrl}
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

  if (
    (userCanRequestSubsidyForCourse && !userSubsidyApplicableToCourse)
    || userHasLearnerCreditRequest || userHasSubsidyRequestForCourse
  ) {
    // User can request a subsidy for the course, but is not enrolled so
    // hide the "Enroll" CTA in favor of the "Request enrollment" CTA below
    // the course run cards.
    return null;
  }

  if (!userSubsidyApplicableToCourse) {
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
        contentKey={contentKey}
        onClick={handleRedeemClick}
        onSuccess={handleRedemptionSuccess}
        onError={handleRedeemError}
        options={{
          trackSearchConversionEventName: EVENT_NAMES.sucessfulEnrollment,
        }}
      />
      <RedemptionStatusText redemptionStatus={redemptionStatus} />
    </Stack>
  );
};

export default useCourseRunCardAction;
