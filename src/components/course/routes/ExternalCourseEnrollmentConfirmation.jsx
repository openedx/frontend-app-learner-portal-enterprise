import React from 'react';
import { Container } from '@edx/paragon';

import { useMinimalCourseMetadata } from '../data/hooks';
import CourseSummaryCard from '../../executive-education-2u/components/CourseSummaryCard';
import EnrollmentCompletedSummaryCard from '../../executive-education-2u/components/EnrollmentCompletedSummaryCard';

const ExternalCourseEnrollmentConfirmation = () => {
  const courseMetadata = useMinimalCourseMetadata();
  return (
    <div className="fill-vertical-space page-light-bg">
      <Container size="lg" className="py-5">
        <h2 className="mb-3">Congratulations, you have completed your enrollment for your online course</h2>
        <CourseSummaryCard
          courseMetadata={courseMetadata}
          enrollmentCompleted
        />
        <EnrollmentCompletedSummaryCard />
      </Container>
    </div>
  );
};

export default ExternalCourseEnrollmentConfirmation;
