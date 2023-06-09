import React from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import { PageRoute } from '@edx/frontend-platform/react';

import CourseAbout from './CourseAbout';
import ExternalCourseEnrollment from './ExternalCourseEnrollment';
import ExternalCourseEnrollmentConfirmation from './ExternalCourseEnrollmentConfirmation';
import NotFoundPage from '../../NotFoundPage';

const CoursePageRoutes = () => {
  const routeMatch = useRouteMatch();
  return (
    <Switch>
      <PageRoute exact path={routeMatch.path} component={CourseAbout} />
      <PageRoute exact path={`${routeMatch.path}/enroll`} component={ExternalCourseEnrollment} />
      <PageRoute exact path={`${routeMatch.path}/enroll/complete`} component={ExternalCourseEnrollmentConfirmation} />
      <PageRoute path={`${routeMatch.path}/*`} component={NotFoundPage} />
    </Switch>
  );
};

export default CoursePageRoutes;
