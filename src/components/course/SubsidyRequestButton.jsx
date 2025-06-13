import {
  useContext, useMemo, useState, useCallback,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { StatefulButton } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';

import {
  useBrowseAndRequestCatalogsApplicableToCourse,
  useUserHasSubsidyRequestForCourse,
  useUserSubsidyApplicableToCourse,
  useUserHasLearnerCreditRequestForCourse,
} from './data/hooks';
import { findUserEnrollmentForCourseRun } from './data/utils';
import { ToastsContext } from '../Toasts';
import { postLicenseRequest, postCouponCodeRequest, postLearnerCreditRequest } from '../enterprise-subsidy-requests/data/service';
import { SUBSIDY_TYPE } from '../../constants';
import {
  queryRequestsContextQueryKey,
  useBrowseAndRequestConfiguration,
  useCourseMetadata,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
} from '../app/data';
import { getCoursePrice } from '../app/data/utils';
const props = {
  labels: {
    loadingApplicableSubsidy: 'Please wait...',
    request: 'Request enrollment',
    pending: 'Requesting...',
    requested: 'Awaiting approval',
  },
  disabledStates: ['loadingApplicableSubsidy', 'pending', 'requested'],
  className: 'mb-4 mt-1',
};

const SubsidyRequestButton = () => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { addToast } = useContext(ToastsContext);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: browseAndRequestConfiguration } = useBrowseAndRequestConfiguration();
  const {
    userSubsidyApplicableToCourse,
    isPending: isPendingUserSubsidyApplicableToCourse,
    canRequestLearnerCredit,
    learnerCreditRequestablePolicy,
  } = useUserSubsidyApplicableToCourse();
  const { data: courseMetadata } = useCourseMetadata();
  const { data: { enterpriseCourseEnrollments: userEnrollments } } = useEnterpriseCourseEnrollments();
  const userHasSubsidyRequest = useUserHasSubsidyRequestForCourse(courseMetadata.key);
  const userHasLearnerCreditRequest = useUserHasLearnerCreditRequestForCourse(courseMetadata.key);
  const subsidyRequestCatalogsApplicableToCourse = useBrowseAndRequestCatalogsApplicableToCourse();

  /**
   * Check every course run to see if user is enrolled in any of them
   */
  const isUserEnrolled = useMemo(
    () => {
      if (courseMetadata.courseRunKeys) {
        const enrollments = courseMetadata.courseRunKeys.filter(
          (key) => findUserEnrollmentForCourseRun({ userEnrollments, key }),
        );
        return enrollments.length > 0;
      }
      return false;
    },
    [courseMetadata.courseRunKeys, userEnrollments],
  );

  const requestSubsidy = useCallback(async (key) => {
    switch (browseAndRequestConfiguration.subsidyType) {
      case SUBSIDY_TYPE.LICENSE:
        return postLicenseRequest(browseAndRequestConfiguration.enterpriseCustomerUuid, key);
      case SUBSIDY_TYPE.COUPON:
        return postCouponCodeRequest(browseAndRequestConfiguration.enterpriseCustomerUuid, key);
      default:
        throw new Error('Subsidy request configuration not set');
    }
  }, [browseAndRequestConfiguration]);

  /**
   * Show subsidy request button if:
   *  - subsidy requests is enabled
   *    - user has a subsidy request for course (for legacy B&R types)
   *      OR
   *    - course is in catalog
   *    - user not already enrolled in course
   *    - user has no subsidy for course
   */
  const hasSubsidyRequestsEnabled = !!browseAndRequestConfiguration?.subsidyRequestsEnabled;
  const showSubsidyRequestButton = hasSubsidyRequestsEnabled && (
    userHasSubsidyRequest || (
      subsidyRequestCatalogsApplicableToCourse.length > 0 && !isUserEnrolled && !userSubsidyApplicableToCourse
    )
  );

  /**
   * Show LCR request button if:
   *  - legacy B&R request button is NOT shown
   *  - user is not enrolled
   *  - user has no applicable subsidy
   *  - user can request LCR (and policy is available)
   *  - user has no ['requested', 'approved', 'errored', 'accepted'] subsidy request
   */
  const showLearnerCreditRequestButton = !showSubsidyRequestButton
  && !userSubsidyApplicableToCourse
  && !isUserEnrolled
  && canRequestLearnerCredit
  && learnerCreditRequestablePolicy
  && !userHasLearnerCreditRequest;

  /*
    * Determine if the component should render at all.
    * It should render if either "request" button should be shown,
    * OR if a request of either type already exists (to show "Awaiting approval").
    */
  if (
    !showSubsidyRequestButton
    && !showLearnerCreditRequestButton
    && !userHasSubsidyRequest
    && !userHasLearnerCreditRequest
  ) {
    return null;
  }

  /**
   * @returns {string} one of `request`, `pending`, or `requested`
   */
  const getButtonState = () => {
    if (isPendingUserSubsidyApplicableToCourse) {
      return 'loadingApplicableSubsidy';
    }
    if (loadingRequest) {
      return 'pending';
    }
    // If a request of either type exists, the state is 'requested'.
    if (userHasSubsidyRequest || userHasLearnerCreditRequest) {
      return 'requested';
    }
    return 'request';
  };

  const handleRequestButtonClick = async () => {
    setLoadingRequest(true);
    try {
      if (showLearnerCreditRequestButton) {
        // Learner Credit B&R: create a LearnerCreditRequest
        const coursePrice = getCoursePrice(courseMetadata);
        await postLearnerCreditRequest(
          enterpriseCustomer.uuid,
          learnerCreditRequestablePolicy.uuid,
          courseMetadata.key,
          coursePrice,
        );
      } else if (showSubsidyRequestButton && !userHasSubsidyRequest) {
        // Existing logic for legacy subsidy types
        await requestSubsidy(courseMetadata.key);
      }
      setLoadingRequest(false);
      addToast(
        intl.formatMessage({
          id: 'enterprise.course.about.page.subsidy.request.submitted.toast.message',
          defaultMessage: 'Request for course submitted',
          description: 'Toast message for when a user submits a request to enroll in a course',
        }),
      );
      const requestsQueryKey = queryRequestsContextQueryKey(enterpriseCustomer.uuid);
      queryClient.invalidateQueries({ queryKey: requestsQueryKey });
    } catch (error) {
      logError(error);
      setLoadingRequest(false);
    }
  };

  return (
    <StatefulButton
      {...props}
      state={getButtonState()}
      onClick={handleRequestButtonClick}
    />
  );
};

export default SubsidyRequestButton;
