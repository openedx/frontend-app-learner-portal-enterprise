import {
  useContext, useMemo, useState, useCallback,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { StatefulButton } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useBrowseAndRequestCatalogsApplicableToCourse, useUserHasSubsidyRequestForCourse, useUserSubsidyApplicableToCourse } from './data/hooks';
import { findUserEnrollmentForCourseRun } from './data/utils';
import { ToastsContext } from '../Toasts';
import { postLicenseRequest, postCouponCodeRequest } from '../enterprise-subsidy-requests/data/service';
import { SUBSIDY_TYPE } from '../../constants';
import {
  queries,
  useBrowseAndRequestConfiguration,
  useCourseMetadata,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
} from '../app/data';

const props = {
  labels: {
    request: 'Request enrollment',
    pending: 'Requesting',
    requested: 'Awaiting approval',
  },
  disabledStates: ['requested'],
  variant: 'primary',
  className: 'mb-4 mt-1',
};

const SubsidyRequestButton = () => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { addToast } = useContext(ToastsContext);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: browseAndRequestConfiguration } = useBrowseAndRequestConfiguration();
  const { userSubsidyApplicableToCourse } = useUserSubsidyApplicableToCourse();
  const subsidyRequestCatalogsApplicableToCourse = useBrowseAndRequestCatalogsApplicableToCourse();
  const { data: courseMetadata } = useCourseMetadata();
  const {
    data: {
      enterpriseCourseEnrollments: userEnrollments,
    },
  } = useEnterpriseCourseEnrollments();

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

  const userHasSubsidyRequest = useUserHasSubsidyRequestForCourse(courseMetadata.key);

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
   *    - user has a subsidy request for course
   *      OR
   *    - course is in catalog
   *    - user not already enrolled in crouse
   *    - user has no subsidy for course
   */
  const hasSubsidyRequestsEnabled = browseAndRequestConfiguration?.subsidyRequestsEnabled;
  const showSubsidyRequestButton = hasSubsidyRequestsEnabled && (
    userHasSubsidyRequest || (
      subsidyRequestCatalogsApplicableToCourse.length > 0 && !isUserEnrolled && !userSubsidyApplicableToCourse
    )
  );

  if (!showSubsidyRequestButton) {
    return null;
  }

  /**
   * @returns {string} one of `request`, `pending`, or `requested`
   */
  const getButtonState = () => {
    if (loadingRequest) {
      return 'pending';
    } if (userHasSubsidyRequest) {
      return 'requested';
    }
    return 'request';
  };

  const handleRequestButtonClick = async () => {
    setLoadingRequest(true);
    try {
      await requestSubsidy(courseMetadata.key);
      setLoadingRequest(false);
      addToast(
        intl.formatMessage({
          id: 'enterprise.course.about.page.subsidy.request.submitted.toast.message',
          defaultMessage: 'Request for course submitted',
          description: 'Toast message for when a user submits a request to enroll in a course',
        }),
      );
      const requestsQueryKey = queries
        .enterprise.enterpriseCustomer(enterpriseCustomer.uuid)
        ._ctx.subsidies._ctx.browseAndRequest._ctx.requests._def;

      queryClient.invalidateQueries({ queryKey: requestsQueryKey });
    } catch (error) {
      logError(error);
      setLoadingRequest(false);
    }
  };

  return (
    <StatefulButton {...props} state={getButtonState()} onClick={handleRequestButtonClick} />
  );
};

export default SubsidyRequestButton;
