import React from 'react';
import { Switch } from 'react-router-dom';
import { PageRoute } from '@edx/frontend-platform/react';

import CourseAbout from './CourseAbout';
import ExternalCourseEnrollment from './ExternalCourseEnrollment';
import ExternalCourseEnrollmentConfirmation from './ExternalCourseEnrollmentConfirmation';

const CoursePageRoutes = () => (
  <Switch>
    <PageRoute exact path="/" component={CourseAbout} />
    <PageRoute exact path="/enroll" component={ExternalCourseEnrollment} />
    <PageRoute exact path="/enroll/complete" component={ExternalCourseEnrollmentConfirmation} />
  </Switch>
);

export default CoursePageRoutes;
