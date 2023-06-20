import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { PageWrap } from '@edx/frontend-platform/react';

import CourseAbout from './CourseAbout';
import ExternalCourseEnrollment from './ExternalCourseEnrollment';
import ExternalCourseEnrollmentConfirmation from './ExternalCourseEnrollmentConfirmation';
import NotFoundPage from '../../NotFoundPage';

const CoursePageRoutes = () => (
  <Routes>
    <Route path="/" element={<PageWrap><CourseAbout /></PageWrap>} />
    <Route path="enroll" element={<PageWrap><ExternalCourseEnrollment /></PageWrap>} />
    <Route path="enroll/complete" element={<PageWrap><ExternalCourseEnrollmentConfirmation /></PageWrap>} />
    <Route path="*" element={<PageWrap><NotFoundPage /></PageWrap>} />
  </Routes>
);

export default CoursePageRoutes;
