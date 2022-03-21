import React, {
  useContext, useMemo, useState, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { StatefulButton } from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useHistory } from 'react-router-dom';

import { SubsidyRequestsContext, SUBSIDY_TYPE } from '../enterprise-subsidy-requests';
import { CourseContext } from './CourseContextProvider';
import { findUserEnrollmentForCourseRun } from './data/utils';
import { ToastsContext } from '../Toasts';
import { useUserHasSubsidyRequestForCourse } from '../enterprise-subsidy-requests/data/hooks';
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

const SubsidyRequestButton = ({ enterpriseSlug }) => {
  const history = useHistory();
  const { addToast } = useContext(ToastsContext);
  const [loadingRequest, setLoadingRequest] = useState(false);

  const {
    subsidyRequestConfiguration,
    refreshSubsidyRequests,
  } = useContext(SubsidyRequestsContext);

  const { state } = useContext(CourseContext);

  const { course, catalog, userEnrollments } = state;
  const {
    key: courseKey,
    courseRunKeys,
    userSubsidyApplicableToCourse,
  } = course;

  const isCourseInCatalog = catalog.containsContentItems;

  /**
   * Check every course run to see if user is enrolled in any of them
   */
  const isUserEnrolled = useMemo(
    () => {
      if (courseRunKeys) {
        const enrollments = courseRunKeys.filter(
          (runKey) => findUserEnrollmentForCourseRun({ userEnrollments, runKey }),
        );
        return enrollments.length > 0;
      }
      return false;
    },
    [courseRunKeys, userEnrollments],
  );

  /**
   * Show subsidy request button if:
   *  - subsidy requests is enabled
   *  - course is in catalog
   *  - user not already enrolled in crouse
   *  - user has no subsidy for course
   */
  const showSubsidyRequestButton = subsidyRequestConfiguration?.subsidyRequestsEnabled
    && isCourseInCatalog
    && !isUserEnrolled
    && !userSubsidyApplicableToCourse;

  if (!showSubsidyRequestButton) {
    return null;
  }

  const userHasSubsidyRequest = useUserHasSubsidyRequestForCourse(courseKey);

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
};

SubsidyRequestButton.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

export default SubsidyRequestButton;
