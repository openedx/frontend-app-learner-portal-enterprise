import { Link, generatePath, useParams } from 'react-router-dom';
import { Button, Container } from '@openedx/paragon';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useExternalEnrollmentFailureReason } from '../data/hooks';
import CourseSummaryCard from '../../executive-education-2u/components/CourseSummaryCard';
import EnrollmentCompletedSummaryCard from '../../executive-education-2u/components/EnrollmentCompletedSummaryCard';
import ErrorPageContent from '../../executive-education-2u/components/ErrorPageContent';

const ExternalCourseEnrollmentConfirmation = () => {
  const { enterpriseSlug } = useParams();
  const {
    failureReason,
    failureMessage,
  } = useExternalEnrollmentFailureReason();

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
            to={generatePath('/:enterpriseSlug', { enterpriseSlug })}
          >
            <FormattedMessage
              id="executive.education.external.course.enrollment.completed.page.go.to.dashboard.button"
              defaultMessage="Go to dashboard"
              description="Button that will navigate the learners to learner dashboard"
            />
          </Button>
          <CourseSummaryCard enrollmentCompleted />
          <EnrollmentCompletedSummaryCard />
        </Container>
      )}
    </div>
  );
};

export default ExternalCourseEnrollmentConfirmation;
