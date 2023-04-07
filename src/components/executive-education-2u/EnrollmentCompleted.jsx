import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { Container } from '@edx/paragon';
import { Helmet } from 'react-helmet';
import { AppContext } from '@edx/frontend-platform/react';
import PropTypes from 'prop-types';
import CourseSummaryCard from './components/CourseSummaryCard';
import EnrollmentCompletedSummaryCard from './components/EnrollmentCompletedSummaryCard';

const EnrollmentCompleted = (props) => {
  const { enterpriseConfig } = useContext(AppContext);
  if (!props.location.state?.data) {
    return <Redirect to={`/${enterpriseConfig.slug}`} />;
  }
  return (
    <Container size="md" className="py-5">
      <Helmet>
        <title>Enrollment Completed</title>
      </Helmet>
      <h2 className="mb-3">Congratulations, you have completed your enrollment for your online course</h2>
      <CourseSummaryCard courseMetadata={props.location.state.data} enrolmentCompleted />
      <EnrollmentCompletedSummaryCard />
    </Container>
  );
};

EnrollmentCompleted.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      data: PropTypes.shape({}),
    }).isRequired,
  }).isRequired,
};

export default EnrollmentCompleted;
