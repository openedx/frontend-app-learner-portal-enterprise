import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { breakpoints } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { MainContent, Sidebar } from '../layout';
import { CourseContext } from './CourseContextProvider';
import CourseHeader from './CourseHeader';
import CourseMainContent from './CourseMainContent';
import CourseSidebar from './CourseSidebar';

import { isEmpty } from '../../utils';

export default function Course({
  course,
  activeCourseRun,
  userEnrollments,
  userEntitlements,
}) {
  const { enterpriseConfig } = useContext(AppContext);
  const { state, dispatch } = useContext(CourseContext);

  useEffect(() => {
    dispatch({ type: 'set-course', payload: course });
  }, [course]);

  useEffect(() => {
    dispatch({ type: 'set-course-run', payload: activeCourseRun });
  }, [activeCourseRun]);

  useEffect(() => {
    dispatch({ type: 'set-enrollments', payload: userEnrollments });
  }, [userEnrollments]);

  useEffect(() => {
    dispatch({ type: 'set-entitlements', payload: userEntitlements });
  }, [userEntitlements]);

  if (isEmpty(state.course) || isEmpty(state.activeCourseRun)) {
    return null;
  }

  return (
    <>
      <Helmet title={`${state.course.title} - ${enterpriseConfig.name}`} />
      <CourseHeader />
      <div className="container-fluid py-5">
        <div className="row">
          <MainContent>
            <CourseMainContent />
          </MainContent>
          <MediaQuery minWidth={breakpoints.large.minWidth}>
            {matches => matches && (
              <Sidebar>
                <CourseSidebar />
              </Sidebar>
            )}
          </MediaQuery>
        </div>
      </div>
    </>
  );
}

Course.propTypes = {
  course: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }).isRequired,
  activeCourseRun: PropTypes.shape({}).isRequired,
  userEnrollments: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  userEntitlements: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};
