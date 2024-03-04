import { React, useContext } from 'react';
import { Button, Container, Hyperlink } from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useExternalEnrollmentFailureReason, useIsCourseAssigned, useMinimalCourseMetadata } from '../data/hooks';
import CourseSummaryCard from '../../executive-education-2u/components/CourseSummaryCard';
import EnrollmentCompletedSummaryCard from '../../executive-education-2u/components/EnrollmentCompletedSummaryCard';
import ErrorPageContent from '../../executive-education-2u/components/ErrorPageContent';
import { CourseContext } from '../CourseContextProvider';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

const ExternalCourseEnrollmentConfirmation = () => {
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

  const config = getConfig();
  const {
    enterpriseConfig: { authOrgId, slug },
  } = useContext(AppContext);
  const { redeemableLearnerCreditPolicies } = useContext(UserSubsidyContext);
  const isCourseAssigned = useIsCourseAssigned(redeemableLearnerCreditPolicies.learnerContentAssignments, course?.key);
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
          <h2 className="mb-3">
            <FormattedMessage
              id="executive.education.external.course.enrollment.completed.page.title"
              defaultMessage="Congratulations, you have completed your enrollment for your online course"
              description="Title for the executive education course enrollment completed page"
            />
          </h2>
          <Button
            as={Hyperlink}
            className="mb-3 ml-auto"
            destination={dashboardUrl}
          >
            <FormattedMessage
              id="executive.education.external.course.enrollment.completed.page.go.to.dashboard.button"
              defaultMessage="Go to dashboard"
              description="Button that will navigate the learners to learner dashboard"
            />
          </Button>
          <CourseSummaryCard
            courseMetadata={courseMetadata}
            enrollmentCompleted
          />
          <EnrollmentCompletedSummaryCard
            isCourseAssigned={isCourseAssigned}
            externalDashboardUrl={externalDashboardUrl}
            dashboardUrl={dashboardUrl}
            getStudnetTCUrl={getStudnetTCUrl}
          />
        </Container>
      )}
    </div>
  );
};

export default ExternalCourseEnrollmentConfirmation;
