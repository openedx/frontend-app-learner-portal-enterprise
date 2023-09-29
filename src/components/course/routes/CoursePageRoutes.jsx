import React from 'react';
import { Route, Routes, useMatch } from 'react-router-dom';
import { PageWrap } from '@edx/frontend-platform/react';

import CourseAbout from './CourseAbout';
import ExternalCourseEnrollment from './ExternalCourseEnrollment';
import ExternalCourseEnrollmentConfirmation from './ExternalCourseEnrollmentConfirmation';
import NotFoundPage from '../../NotFoundPage';

const CoursePageRoutes = () => {
  const routeMatch = useMatch();
  return (
    <Routes>
      <Route exact path={routeMatch.path} element={<PageWrap><CourseAbout /></PageWrap>} />
      <Route exact path={`${routeMatch.path}/enroll`} element={<PageWrap><ExternalCourseEnrollment /></PageWrap>} />
      <Route exact path={`${routeMatch.path}/enroll/complete`} element={<PageWrap><ExternalCourseEnrollmentConfirmation /></PageWrap>} />
      <Route path={`${routeMatch.path}/*`} element={<PageWrap><NotFoundPage /></PageWrap>} />
    </Routes>
  );
};

export default CoursePageRoutes;
