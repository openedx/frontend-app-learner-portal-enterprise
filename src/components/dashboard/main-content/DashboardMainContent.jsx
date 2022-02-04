import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Button, breakpoints, MediaQuery } from '@edx/paragon';

import { CourseEnrollments, CourseEnrollmentsContextProvider } from './course-enrollments';

import SupportInformation from '../sidebar/SupportInformation';
import SubsidiesSummary from '../sidebar/SubsidiesSummary';

const DashboardMainContent = () => {
  const {
    enterpriseConfig: {
      name,
      slug,
      disableSearch,
    },
    authenticatedUser,
  } = useContext(AppContext);

  const userFirstName = useMemo(() => authenticatedUser?.name.split(' ').shift(), [authenticatedUser?.name]);

  return (
    <CourseEnrollmentsContextProvider>
      <h2 className="h1 mb-4">
        {userFirstName ? `Welcome, ${userFirstName}!` : 'Welcome!'}
      </h2>
      <MediaQuery maxWidth={breakpoints.medium.maxWidth}>
        {matches => (matches ? (
          <SubsidiesSummary />
        ) : null)}
      </MediaQuery>
      <CourseEnrollments>
        {/* The children below will only be rendered if there are no course enrollments. */}
        {disableSearch ? (
          <p>
            You are not enrolled in any courses sponsored by {name}.
            Reach out to your administrator for instructions on how to start learning learning with edX!
          </p>
        ) : (
          <>
            <p>
              Getting started with edX is easy. Simply find a course from your
              catalog, request enrollment, and get started on your learning journey.
            </p>
            <Button
              as={Link}
              to={`/${slug}/search`}
              className="btn-brand-primary d-block d-md-inline-block"
            >
              Find a course
            </Button>
          </>
        )}
      </CourseEnrollments>

      <MediaQuery maxWidth={breakpoints.medium.maxWidth}>
        {matches => (matches ? <SupportInformation className="mt-5" /> : null)}
      </MediaQuery>
    </CourseEnrollmentsContextProvider>
  );
};

export default DashboardMainContent;
