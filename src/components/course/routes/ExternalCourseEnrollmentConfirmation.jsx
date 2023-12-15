import { React, useContext } from 'react';
import { Button, Container, Hyperlink } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';

import { useExternalEnrollmentFailureReason, useMinimalCourseMetadata } from '../data/hooks';
import CourseSummaryCard from '../../executive-education-2u/components/CourseSummaryCard';
import EnrollmentCompletedSummaryCard from '../../executive-education-2u/components/EnrollmentCompletedSummaryCard';
import ErrorPageContent from '../../executive-education-2u/components/ErrorPageContent';
import { CourseContext } from '../CourseContextProvider';

const ExternalCourseEnrollmentConfirmation = () => {
  const config = getConfig();
  const courseMetadata = useMinimalCourseMetadata();
  const {
    state: {
      course,
    },
  } = useContext(CourseContext);
  const {
    failureReason,
    failureMessage,
  } = useExternalEnrollmentFailureReason();

  const {
    enterpriseConfig: { authOrgId, slug },
  } = useContext(AppContext);
  const externalDashboardQueryParams = new URLSearchParams({
    org_id: authOrgId,
  });
  const externalDashboardQueryString = externalDashboardQueryParams ? `?${externalDashboardQueryParams.toString()}` : '';
  const externalDashboardUrl = `${config.GETSMARTER_LEARNER_DASHBOARD_URL}${externalDashboardQueryString ?? ''}`;
  const enterpriseSlug = `/${slug}`;
  const dashboardUrl = `${config.BASE_URL}${enterpriseSlug}`;
  const getStudnetTCUrl = config.GETSMARTER_STUDENT_TC_URL;
  return (
    <div className="fill-vertical-space page-light-bg">
      {failureReason ? (
        <ErrorPageContent
          className="py-5"
          failureReason={failureReason}
          failureMessage={failureMessage}
        />
      ) : (
        <Container size="lg" className="py-5 d-flex flex-column">
          <h2 className="mb-3">Congratulations, you have completed your enrollment for your online course</h2>
          <Button
            as={Hyperlink}
            className="mb-3 ml-auto"
            destination={dashboardUrl}
          >
            Go to dashboard
          </Button>
          <CourseSummaryCard
            courseMetadata={courseMetadata}
            enrollmentCompleted
          />
          <EnrollmentCompletedSummaryCard
            externalDashboardUrl={externalDashboardUrl}
            dashboardUrl={dashboardUrl}
            getStudnetTCUrl={getStudnetTCUrl}
            courseKey={course?.key}
          />
        </Container>
      )}
    </div>
  );
};

export default ExternalCourseEnrollmentConfirmation;
