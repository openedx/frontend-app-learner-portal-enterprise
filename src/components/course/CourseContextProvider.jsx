import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import {
  SET_COURSE_RUN,
} from './data/constants';

export const CourseContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case SET_COURSE_RUN:
      return { ...state, activeCourseRun: action.payload };
    default:
      return state;
  }
};

export function CourseContextProvider({ children, initialState }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
}

CourseContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialState: PropTypes.shape({
    course: PropTypes.shape({}).isRequired,
    activeCourseRun: PropTypes.shape({}).isRequired,
    userEnrollments: PropTypes.arrayOf(PropTypes.shape({
      isEnrollmentActive: PropTypes.bool.isRequired,
      isRevoked: PropTypes.bool.isRequired,
      courseRunId: PropTypes.string.isRequired,
      mode: PropTypes.string.isRequired,
    })).isRequired,
    userEntitlements: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    userSubsidyApplicableToCourse: PropTypes.shape({}),
    catalog: PropTypes.shape({}).isRequired,
  }).isRequired,
};
