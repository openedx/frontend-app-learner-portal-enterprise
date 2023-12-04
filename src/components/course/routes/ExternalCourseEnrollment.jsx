import React, { useContext, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Alert, Button, Container, Col, Hyperlink, Row,
} from '@edx/paragon';
import { CheckCircle } from '@edx/paragon/icons';

import { getConfig } from '@edx/frontend-platform/config';
import { AppContext } from '@edx/frontend-platform/react';
import { isDuplicateExternalCourseOrder } from '../../executive-education-2u/data';
import { CourseContext } from '../CourseContextProvider';
import CourseSummaryCard from '../../executive-education-2u/components/CourseSummaryCard';
import RegistrationSummaryCard from '../../executive-education-2u/components/RegistrationSummaryCard';
import UserEnrollmentForm from '../../executive-education-2u/UserEnrollmentForm';
import { useExternalEnrollmentFailureReason, useIsCourseAssigned, useMinimalCourseMetadata } from '../data/hooks';
import ErrorPageContent from '../../executive-education-2u/components/ErrorPageContent';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { features } from '../../../config';

const ExternalCourseEnrollment = () => {
  const config = getConfig();
  const history = useHistory();
  const {
    state: {
      activeCourseRun,
      courseEntitlementProductSku,
      course,
    },
    userSubsidyApplicableToCourse,
    hasSuccessfulRedemption,
    externalCourseFormSubmissionError,
  } = useContext(CourseContext);
  const {
    redeemableLearnerCreditPolicies,
  } = useContext(UserSubsidyContext);
  const {
    enterpriseConfig: { authOrgId },
  } = useContext(AppContext);
  const isCourseAssigned = useIsCourseAssigned(redeemableLearnerCreditPolicies, course?.key);

  const courseMetadata = useMinimalCourseMetadata();

  const externalDashboardQueryParams = new URLSearchParams();
  if (authOrgId) {
    externalDashboardQueryParams.set('org_id', authOrgId);
  }

  let externalDashboardUrl = config.GETSMARTER_LEARNER_DASHBOARD_URL;

  if (externalDashboardQueryParams.has('org_id')) {
    externalDashboardUrl += `?${externalDashboardQueryParams.toString()}`;
  }

  const {
    failureReason,
    failureMessage,
  } = useExternalEnrollmentFailureReason();

  const containerRef = useRef(null);

  useEffect(() => {
    if (isDuplicateExternalCourseOrder(externalCourseFormSubmissionError) && containerRef?.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [externalCourseFormSubmissionError, containerRef]);

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
              <Alert
                variant="success"
                ref={containerRef}
                icon={CheckCircle}
                show={isDuplicateExternalCourseOrder(externalCourseFormSubmissionError)}
                actions={[
                  <Button as={Hyperlink} target="_blank" destination={externalDashboardUrl}>
                    Go to dashboard
                  </Button>,
                ]}
              >
                <Alert.Heading>Already Enrolled</Alert.Heading>
                <p>
                  You&apos;re already enrolled. Go to your GetSmarter dashboard to keep learning.
                </p>
              </Alert>
              {!isDuplicateExternalCourseOrder(externalCourseFormSubmissionError) && (
                <p className="small bg-light-500 p-3 rounded-lg">
                  <strong>
                    This is where you finalize your registration for an edX executive
                    education course through GetSmarter.
                  </strong>
                  &nbsp; Please ensure that the course details below are correct and confirm using Learner
                  Credit with a &quot;Confirm registration&quot; button.
                  {(features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && isCourseAssigned)
                    ? 'Your learning administrator already allocated funds towards this registration.'
                    : 'Your Learner Credit funds will be redeemed at this point.'}
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
