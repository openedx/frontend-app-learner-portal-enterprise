import { React, useContext } from 'react';
import { Container } from '@edx/paragon';

import { useExternalEnrollmentFailureReason, useMinimalCourseMetadata } from '../data/hooks';
import CourseSummaryCard from '../../executive-education-2u/components/CourseSummaryCard';
import EnrollmentCompletedSummaryCard from '../../executive-education-2u/components/EnrollmentCompletedSummaryCard';
import ErrorPageContent from '../../executive-education-2u/components/ErrorPageContent';
import { CourseContext } from '../CourseContextProvider';

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
          <h2 className="mb-3">Congratulations, you have completed your enrollment for your online course</h2>
          <CourseSummaryCard
            courseMetadata={courseMetadata}
            enrollmentCompleted
          />
          <EnrollmentCompletedSummaryCard courseKey={course?.key} />
        </Container>
      )}
    </div>
  );
};

export default ExternalCourseEnrollmentConfirmation;
