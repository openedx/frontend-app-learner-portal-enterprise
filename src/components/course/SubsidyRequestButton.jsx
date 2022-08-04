import React, {
  useContext, useMemo, useState, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { StatefulButton } from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useHistory } from 'react-router-dom';

import { SubsidyRequestsContext, SUBSIDY_TYPE } from '../enterprise-subsidy-requests';
import { CourseContext } from './CourseContextProvider';
import { useUserHasSubsidyRequestForCourse } from './data/hooks';
import { findUserEnrollmentForCourseRun } from './data/utils';
import { ToastsContext } from '../Toasts';
import { postLicenseRequest, postCouponCodeRequest } from '../enterprise-subsidy-requests/data/service';

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

function SubsidyRequestButton({ enterpriseSlug }) {
  const history = useHistory();
  const { addToast } = useContext(ToastsContext);
  const [loadingRequest, setLoadingRequest] = useState(false);

  const {
    subsidyRequestConfiguration,
    refreshSubsidyRequests,
  } = useContext(SubsidyRequestsContext);

  const { state, subsidyRequestCatalogsApplicableToCourse } = useContext(CourseContext);

  const { course, userEnrollments } = state;
  const {
    key: courseKey,
    courseRunKeys,
  } = course;

  const { userSubsidyApplicableToCourse } = state;

  /**
   * Check every course run to see if user is enrolled in any of them
   */
  const isUserEnrolled = useMemo(
    () => {
      if (courseRunKeys) {
        const enrollments = courseRunKeys.filter(
          (key) => findUserEnrollmentForCourseRun({ userEnrollments, key }),
        );
        return enrollments.length > 0;
      }
      return false;
    },
    [courseRunKeys, userEnrollments],
  );

  const userHasSubsidyRequest = useUserHasSubsidyRequestForCourse(courseKey);

  const requestSubsidy = useCallback(async (key) => {
    switch (subsidyRequestConfiguration.subsidyType) {
      case SUBSIDY_TYPE.LICENSE:
        return postLicenseRequest(subsidyRequestConfiguration.enterpriseCustomerUuid, key);
      case SUBSIDY_TYPE.COUPON:
        return postCouponCodeRequest(subsidyRequestConfiguration.enterpriseCustomerUuid, key);
      default:
        throw new Error('Subsidy request configuration not set');
    }
  }, [subsidyRequestConfiguration]);

  /**
   * Show subsidy request button if:
   *  - subsidy requests is enabled
   *    - user has a subsidy request for course
   *      OR
   *    - course is in catalog
   *    - user not already enrolled in crouse
   *    - user has no subsidy for course
   */
  const hasSubsidyRequestsEnabled = subsidyRequestConfiguration?.subsidyRequestsEnabled;
  const showSubsidyRequestButton = hasSubsidyRequestsEnabled && (
    userHasSubsidyRequest || (
      subsidyRequestCatalogsApplicableToCourse.size > 0 && !isUserEnrolled && !userSubsidyApplicableToCourse
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
      await requestSubsidy(courseKey);
      setLoadingRequest(false);
      addToast('Request for course submitted');
      refreshSubsidyRequests();
      history.push(`/${enterpriseSlug}`);
    } catch (error) {
      logError(error);
      setLoadingRequest(false);
    }
  };

  return (
    <StatefulButton {...props} state={getButtonState()} onClick={handleRequestButtonClick} />
  );
}

SubsidyRequestButton.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

export default SubsidyRequestButton;
