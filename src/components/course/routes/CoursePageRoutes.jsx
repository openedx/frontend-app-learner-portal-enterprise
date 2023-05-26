import React from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import { PageRoute } from '@edx/frontend-platform/react';

import CourseAbout from './CourseAbout';
import ExternalCourseEnrollment from './ExternalCourseEnrollment';
import ExternalCourseEnrollmentConfirmation from './ExternalCourseEnrollmentConfirmation';

const CoursePageRoutes = () => {
  const { path: baseCoursePageRoutePath } = useRouteMatch();
  return (
    <Switch>
      <PageRoute exact path={baseCoursePageRoutePath} component={CourseAbout} />
      <PageRoute exact path={`${baseCoursePageRoutePath}/enroll`} component={ExternalCourseEnrollment} />
      <PageRoute exact path={`${baseCoursePageRoutePath}/enroll/complete`} component={ExternalCourseEnrollmentConfirmation} />
    </Switch>
  );
};

export default CoursePageRoutes;
