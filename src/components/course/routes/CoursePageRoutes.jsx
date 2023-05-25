import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

import CourseAbout from './CourseAbout';
import ExternalCourseEnrollment from './ExternalCourseEnrollment';
import ExternalCourseEnrollmentConfirmation from './ExternalCourseEnrollmentConfirmation';

const CoursePageRoutes = () => {
  const { path: baseCoursePageRoutePath } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={baseCoursePageRoutePath} component={CourseAbout} />
      <Route exact path={`${baseCoursePageRoutePath}/enroll`} component={ExternalCourseEnrollment} />
      <Route exact path={`${baseCoursePageRoutePath}/enroll/complete`} component={ExternalCourseEnrollmentConfirmation} />
    </Switch>
  );
};

export default CoursePageRoutes;
