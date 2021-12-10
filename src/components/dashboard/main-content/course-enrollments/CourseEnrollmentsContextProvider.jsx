import React, {
  useContext, createContext, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { useCourseEnrollments } from './data/hooks';

export const CourseEnrollmentsContext = createContext();

const CourseEnrollmentsContextProvider = ({ children }) => {
  const {
    enterpriseConfig: {
      uuid,
    },
  } = useContext(AppContext);
  const {
    courseEnrollmentsByStatus,
    fetchCourseEnrollmentsError,
    updateCourseEnrollmentStatus,
  } = useCourseEnrollments(uuid);
  const [showMarkCourseCompleteSuccess, setShowMarkCourseCompleteSuccess] = useState(false);
  const [showMoveToInProgressCourseSuccess, setShowMoveToInProgressCourseSuccess] = useState(false);

  const context = useMemo(() => ({
    courseEnrollmentsByStatus,
    fetchCourseEnrollmentsError,
    showMarkCourseCompleteSuccess,
    showMoveToInProgressCourseSuccess,
    updateCourseEnrollmentStatus,
    setShowMarkCourseCompleteSuccess,
    setShowMoveToInProgressCourseSuccess,
  }), [
    courseEnrollmentsByStatus,
    fetchCourseEnrollmentsError,
    showMarkCourseCompleteSuccess,
    showMoveToInProgressCourseSuccess,
  ]);

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
