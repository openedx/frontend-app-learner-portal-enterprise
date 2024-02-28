import React, {
  useContext, createContext, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@openedx/paragon';
import { useCourseEnrollments } from './data/hooks';
import { LoadingSpinner } from '../../../loading-spinner';
import { SubsidyRequestsContext } from '../../../enterprise-subsidy-requests';
import { transformSubsidyRequest } from './data/utils';

export const CourseEnrollmentsContext = createContext();

const CourseEnrollmentsContextProvider = ({ children }) => {
  const {
    enterpriseConfig: {
      uuid: enterpriseUUID,
      slug,
    },
  } = useContext(AppContext);

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
      slug,
    }));
  }, [isSubsidyRequestsEnabled, requestsBySubsidyType, slug, subsidyRequestConfiguration]);

  const {
    courseEnrollmentsByStatus,
    isLoading,
    fetchCourseEnrollmentsError,
    updateCourseEnrollmentStatus,
    removeCourseEnrollment,
  } = useCourseEnrollments({
    enterpriseUUID,
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
