import React, {
  useContext, createContext, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { Container } from '@openedx/paragon';
import { useCourseEnrollments } from './data/hooks';
import { LoadingSpinner } from '../../../loading-spinner';
import { SubsidyRequestsContext } from '../../../enterprise-subsidy-requests';
import { transformSubsidyRequest, useEnterpriseCustomer } from '../../../app/data';

export const CourseEnrollmentsContext = createContext();

const CourseEnrollmentsContextProvider = ({ children }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  const {
    subsidyRequestConfiguration,
    requestsBySubsidyType,
  } = useContext(SubsidyRequestsContext);

  const isSubsidyRequestsEnabled = subsidyRequestConfiguration?.subsidyRequestsEnabled;

  const requestedCourseEnrollments = useMemo(() => {
    if (!isSubsidyRequestsEnabled) {
      return [];
    }
    const requests = requestsBySubsidyType[subsidyRequestConfiguration.subsidyType];
    return requests.map(subsidyRequest => transformSubsidyRequest({
      subsidyRequest,
      slug: enterpriseCustomer.slug,
    }));
  }, [isSubsidyRequestsEnabled, requestsBySubsidyType, enterpriseCustomer.slug, subsidyRequestConfiguration]);

  const {
    courseEnrollmentsByStatus,
    isLoading,
    fetchCourseEnrollmentsError,
    updateCourseEnrollmentStatus,
    removeCourseEnrollment,
  } = useCourseEnrollments({
    enterpriseUUID: enterpriseCustomer.uuid,
    requestedCourseEnrollments,
  });

  const [showMarkCourseCompleteSuccess, setShowMarkCourseCompleteSuccess] = useState(false);
  const [showMoveToInProgressCourseSuccess, setShowMoveToInProgressCourseSuccess] = useState(false);

  const context = useMemo(() => ({
    courseEnrollmentsByStatus,
    fetchCourseEnrollmentsError,
    showMarkCourseCompleteSuccess,
    showMoveToInProgressCourseSuccess,
    updateCourseEnrollmentStatus,
    removeCourseEnrollment,
    setShowMarkCourseCompleteSuccess,
    setShowMoveToInProgressCourseSuccess,
  }), [
    courseEnrollmentsByStatus,
    fetchCourseEnrollmentsError,
    showMarkCourseCompleteSuccess,
    showMoveToInProgressCourseSuccess,
    updateCourseEnrollmentStatus,
    removeCourseEnrollment,
  ]);

  if (isLoading) {
    return (
      <Container className="py-5">
        <LoadingSpinner screenReaderText="loading course enrollments" />
      </Container>
    );
  }

  return (
    <CourseEnrollmentsContext.Provider value={context}>
      {children}
    </CourseEnrollmentsContext.Provider>
  );
};

CourseEnrollmentsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CourseEnrollmentsContextProvider;
