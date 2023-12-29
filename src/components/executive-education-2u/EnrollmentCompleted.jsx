import React, { useContext } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { Container } from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { AppContext } from '@edx/frontend-platform/react';
import CourseSummaryCard from './components/CourseSummaryCard';
import EnrollmentCompletedSummaryCard from './components/EnrollmentCompletedSummaryCard';

const EnrollmentCompleted = () => {
  const location = useLocation();
  const { enterpriseConfig } = useContext(AppContext);
  if (!location.state?.data) {
    return <Redirect to={`/${enterpriseConfig.slug}`} />;
  }
  return (
    <div className="fill-vertical-space page-light-bg">
      <Container size="lg" className="py-5">
        <Helmet>
          <title>Enrollment Completed</title>
        </Helmet>
        <h2 className="mb-3">Congratulations, you have completed your enrollment for your online course</h2>
        <CourseSummaryCard
          courseMetadata={location.state.data}
          enrollmentCompleted
        />
        <EnrollmentCompletedSummaryCard
          courseKey={location?.state?.data?.key}
        />
      </Container>
    </div>
  );
};

export default EnrollmentCompleted;
