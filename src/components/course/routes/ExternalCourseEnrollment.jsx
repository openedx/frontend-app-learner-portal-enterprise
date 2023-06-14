import React, { useContext, useEffect, createRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Alert, Button, Container, Col, Row,
} from '@edx/paragon';
import { CheckCircle } from '@edx/paragon/icons';

import { getConfig } from '@edx/frontend-platform/config';
import { AppContext } from '@edx/frontend-platform/react';
import { isDuplicateOrder } from '../../executive-education-2u/data';
import { CourseContext } from '../CourseContextProvider';
import CourseSummaryCard from '../../executive-education-2u/components/CourseSummaryCard';
import RegistrationSummaryCard from '../../executive-education-2u/components/RegistrationSummaryCard';
import UserEnrollmentForm from '../../executive-education-2u/UserEnrollmentForm';
import { useExternalEnrollmentFailureReason, useMinimalCourseMetadata } from '../data/hooks';
import ErrorPageContent from '../../executive-education-2u/components/ErrorPageContent';

const ExternalCourseEnrollment = () => {
  const config = getConfig();
  const history = useHistory();
  const {
    state: {
      activeCourseRun,
      courseEntitlementProductSku,
    },
    userSubsidyApplicableToCourse,
    hasSuccessfulRedemption,
    formSubmissionError,
  } = useContext(CourseContext);
  const {
    enterpriseConfig: { authOrgId },
  } = useContext(AppContext);

  const courseMetadata = useMinimalCourseMetadata();

  const externalDashboardQueryParams = new URLSearchParams();
  if (authOrgId) {
    externalDashboardQueryParams.set('org', authOrgId);
  }

  const externalDashboardQueryString = externalDashboardQueryParams.toString();
  const externalDashboardUrl = `${config.GETSMARTER_LEARNER_DASHBOARD_URL}${externalDashboardQueryString ?? ''}`;

  const {
    failureReason,
    failureMessage,
  } = useExternalEnrollmentFailureReason();

  const containerRef = createRef(null);

  useEffect(() => {
    if (isDuplicateOrder(formSubmissionError) && containerRef?.current) {
      containerRef?.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [formSubmissionError, containerRef]);

  const handleCheckoutSuccess = () => {
    history.push('enroll/complete');
  };

  useEffect(() => {
    if (hasSuccessfulRedemption) {
      history.push('enroll/complete');
    }
  }, [hasSuccessfulRedemption, history]);

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
          <Row>
            <Col>
              <h2 className="mb-3">
                Your registration(s)
              </h2>
              {isDuplicateOrder(formSubmissionError) && (
                <Alert
                  variant="success"
                  ref={containerRef}
                  icon={CheckCircle}
                  actions={[
                    <Button href={externalDashboardUrl}>
                      Go to dashboard
                    </Button>,
                  ]}
                >
                  <Alert.Heading>Already Enrolled</Alert.Heading>
                  <p>
                    You&apos;re already enrolled. Go to your GetSmarter dashboard to keep learning.
                  </p>
                </Alert>
              )}
              {!isDuplicateOrder(formSubmissionError) && (
                <p className="small bg-light-500 p-3 rounded-lg">
                  <strong>
                    This is where you finalize your registration for an edX executive
                    education course through GetSmarter.
                  </strong>
                  &nbsp; Please ensure that the course details below are correct and confirm using Learner
                  Credit with a &quot;Confirm registration&quot; button.
                  Your Learner Credit funds will be redeemed at this point.
                </p>
              )}
              <CourseSummaryCard courseMetadata={courseMetadata} />
              <RegistrationSummaryCard priceDetails={courseMetadata.priceDetails} />
              <UserEnrollmentForm
                productSKU={courseEntitlementProductSku}
                onCheckoutSuccess={handleCheckoutSuccess}
                activeCourseRun={activeCourseRun}
                userSubsidyApplicableToCourse={userSubsidyApplicableToCourse}
              />
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
};

export default ExternalCourseEnrollment;
