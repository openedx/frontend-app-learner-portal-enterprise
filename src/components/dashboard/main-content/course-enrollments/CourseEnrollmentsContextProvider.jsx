import React, {
  useContext, createContext, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';
import { useCourseEnrollments } from './data/hooks';
import { LoadingSpinner } from '../../../loading-spinner';

export const CourseEnrollmentsContext = createContext();

const CourseEnrollmentsContextProvider = ({ children }) => {
  const {
    enterpriseConfig: {
      uuid,
    },
  } = useContext(AppContext);

  const {
    courseEnrollmentsByStatus,
    programEnrollments,
    isLoading,
    fetchCourseEnrollmentsError,
    updateCourseEnrollmentStatus,
  } = useCourseEnrollments(uuid);

  const [showMarkCourseCompleteSuccess, setShowMarkCourseCompleteSuccess] = useState(false);
  const [showMoveToInProgressCourseSuccess, setShowMoveToInProgressCourseSuccess] = useState(false);

  const context = useMemo(() => ({
    courseEnrollmentsByStatus,
    programEnrollments,
    fetchCourseEnrollmentsError,
    showMarkCourseCompleteSuccess,
    showMoveToInProgressCourseSuccess,
    updateCourseEnrollmentStatus,
    setShowMarkCourseCompleteSuccess,
    setShowMoveToInProgressCourseSuccess,
  }), [
    courseEnrollmentsByStatus,
    programEnrollments,
    fetchCourseEnrollmentsError,
    showMarkCourseCompleteSuccess,
    showMoveToInProgressCourseSuccess,
  ]);

  if (isLoading) {
    return (
      <Container>
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
