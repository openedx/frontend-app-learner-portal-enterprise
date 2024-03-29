import { Link } from 'react-router-dom';
import { Button, Container } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform/config';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useExternalEnrollmentFailureReason, useIsCourseAssigned, useMinimalCourseMetadata } from '../data/hooks';
import CourseSummaryCard from '../../executive-education-2u/components/CourseSummaryCard';
import EnrollmentCompletedSummaryCard from '../../executive-education-2u/components/EnrollmentCompletedSummaryCard';
import ErrorPageContent from '../../executive-education-2u/components/ErrorPageContent';
import { useEnterpriseCustomer } from '../../app/data';

const ExternalCourseEnrollmentConfirmation = () => {
  const minimalCourseMetadata = useMinimalCourseMetadata();
  const {
    failureReason,
    failureMessage,
  } = useExternalEnrollmentFailureReason();

  const config = getConfig();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const isCourseAssigned = useIsCourseAssigned();
  const externalDashboardQueryParams = new URLSearchParams({
    org_id: enterpriseCustomer.authOrgId,
  });
  const externalDashboardQueryString = externalDashboardQueryParams ? `?${externalDashboardQueryParams.toString()}` : '';
  const externalDashboardUrl = `${config.GETSMARTER_LEARNER_DASHBOARD_URL}${externalDashboardQueryString ?? ''}`;
  const enterpriseSlug = `/${enterpriseCustomer.slug}`;
  const dashboardUrl = `${config.BASE_URL}${enterpriseSlug}`;
  const getStudentTCUrl = config.GETSMARTER_STUDENT_TC_URL;
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
            as={Link}
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
            courseMetadata={minimalCourseMetadata}
            enrollmentCompleted
          />
          <EnrollmentCompletedSummaryCard
            isCourseAssigned={isCourseAssigned}
            externalDashboardUrl={externalDashboardUrl}
            dashboardUrl={dashboardUrl}
            getStudentTCUrl={getStudentTCUrl}
          />
        </Container>
      )}
    </div>
  );
};

export default ExternalCourseEnrollmentConfirmation;
