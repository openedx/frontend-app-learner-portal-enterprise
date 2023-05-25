import React, { useContext } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import {
  Container, Col, Row,
} from '@edx/paragon';

import { CourseContext } from '../CourseContextProvider';
import CourseSummaryCard from '../../executive-education-2u/components/CourseSummaryCard';
import RegistrationSummaryCard from '../../executive-education-2u/components/RegistrationSummaryCard';
import UserEnrollmentForm from '../../executive-education-2u/UserEnrollmentForm';
import { useMinimalCourseMetadata } from '../data/hooks';

const ExternalCourseEnrollment = () => {
  const history = useHistory();
  const { url } = useRouteMatch();
  const {
    state: {
      courseEntitlementProductSku,
    },
  } = useContext(CourseContext);
  const courseMetadata = useMinimalCourseMetadata();

  const handleCheckoutSuccess = () => {
    history.push(`${url}/complete`);
  };

  return (
    <div className="fill-vertical-space page-light-bg">
      <Container size="lg" className="py-5">
        <Row>
          <Col>
            <h2 className="mb-3">
              Your registration(s)
            </h2>
            <p className="small bg-light-500 p-3 rounded-lg">
              <strong>
                This is where you finalize your registration for an edX executive
                education course through GetSmarter.
              </strong>
              &nbsp; Please ensure that the course details below are correct and confirm using Learner
              Credit with a &quot;Confirm registration&quot; button.
              Your Learner Credit funds will be redeemed at this point.
            </p>
            <CourseSummaryCard courseMetadata={courseMetadata} />
            <RegistrationSummaryCard priceDetails={courseMetadata.priceDetails} />
            <UserEnrollmentForm
              productSKU={courseEntitlementProductSku}
              onCheckoutSuccess={handleCheckoutSuccess}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ExternalCourseEnrollment;