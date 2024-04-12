import { Link, generatePath, useParams } from 'react-router-dom';
import {
  Button, Col, Container, Row, Stack,
} from '@openedx/paragon';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useExternalEnrollmentFailureReason } from '../data';
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
        <Container size="lg" className="py-5">
          <Row className="mb-4">
            <Col>
              <Stack
                direction="horizontal"
                className="align-items-center"
                gap={5}
              >
                <h2 className="mb-0">
                  <FormattedMessage
                    id="executive.education.external.course.enrollment.completed.page.title"
                    defaultMessage="Congratulations, you have completed your enrollment for your online course"
                    description="Title for the executive education course enrollment completed page"
                  />
                </h2>
                <Button
                  as={Link}
                  className="flex-shrink-0"
                  to={generatePath('/:enterpriseSlug', { enterpriseSlug })}
                >
                  <FormattedMessage
                    id="executive.education.external.course.enrollment.completed.page.go.to.dashboard.button"
                    defaultMessage="Go to dashboard"
                    description="Button that will navigate the learners to learner dashboard"
                  />
                </Button>
              </Stack>
            </Col>
          </Row>
          <Row>
            <Col>
              <CourseSummaryCard enrollmentCompleted />
              <EnrollmentCompletedSummaryCard />
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
};

export default ExternalCourseEnrollmentConfirmation;
