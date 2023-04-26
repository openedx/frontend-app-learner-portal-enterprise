import React, {
  createContext, useReducer, useMemo, useContext,
} from 'react';
import PropTypes from 'prop-types';
import {
  SET_COURSE_RUN,
} from './data/constants';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';

export const CourseContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case SET_COURSE_RUN:
      return { ...state, activeCourseRun: action.payload };
    default:
      return state;
  }
};

export const CourseContextProvider = ({ children, initialState }) => {
  const { catalogsForSubsidyRequests } = useContext(SubsidyRequestsContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { catalog } = state;

  const subsidyRequestCatalogsApplicableToCourse = useMemo(() => {
    const catalogsContainingCourse = new Set(catalog.catalogList);
    const subsidyRequestCatalogIntersection = new Set(
      catalogsForSubsidyRequests.filter(el => catalogsContainingCourse.has(el)),
    );
    return subsidyRequestCatalogIntersection;
  }, [catalog, catalogsForSubsidyRequests]);

  const value = useMemo(() => ({
    state,
    dispatch,
    subsidyRequestCatalogsApplicableToCourse,
  }), [state, subsidyRequestCatalogsApplicableToCourse]);

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

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
    courseRecommendations: PropTypes.shape({}).isRequired,
    courseReviews: PropTypes.shape({}).isRequired,
  }).isRequired,
};
