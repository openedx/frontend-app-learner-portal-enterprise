import React, { useContext, useEffect, useRef } from 'react';
import { generatePath, useNavigate, useLocation } from 'react-router-dom';
import {
  Alert, Button, Col, Container, Hyperlink, Row,
} from '@openedx/paragon';
import { CheckCircle } from '@openedx/paragon/icons';

import { getConfig } from '@edx/frontend-platform/config';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { isDuplicateExternalCourseOrder } from '../../executive-education-2u/data';
import { CourseContext } from '../CourseContextProvider';
import CourseSummaryCard from '../../executive-education-2u/components/CourseSummaryCard';
import RegistrationSummaryCard from '../../executive-education-2u/components/RegistrationSummaryCard';
import UserEnrollmentForm from '../../executive-education-2u/UserEnrollmentForm';
import {
  useExternalEnrollmentFailureReason,
  useIsCourseAssigned,
  useMinimalCourseMetadata,
  useUserSubsidyApplicableToCourse,
} from '../data/hooks';
import ErrorPageContent from '../../executive-education-2u/components/ErrorPageContent';
import { features } from '../../../config';
import { useCourseMetadata, useCourseRedemptionEligibility, useEnterpriseCustomer } from '../../app/data';

const ExternalCourseEnrollment = () => {
  const config = getConfig();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { externalCourseFormSubmissionError } = useContext(CourseContext);
  const {
    data: {
      courseMetadata,
      activeCourseRun,
      courseEntitlementProductSku,
    },
  } = useCourseMetadata({
    select: ({ transformed }) => ({
      courseMetadata: transformed,
      activeCourseRun: transformed.activeCourseRun,
      courseEntitlementProductSku: transformed.courseEntitlementProductSku,
    }),
  });
  const { data: { hasSuccessfulRedemption } } = useCourseRedemptionEligibility();
  const { userSubsidyApplicableToCourse } = useUserSubsidyApplicableToCourse();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const completeEnrollmentUrl = generatePath(
      `${pathname}/complete`,
      {
        enterpriseSlug: enterpriseCustomer.slug,
        courseType: courseMetadata.courseType,
        courseKey: courseMetadata.key,
      },
  );
  const isCourseAssigned = useIsCourseAssigned();
  const minimalCourseMetadata = useMinimalCourseMetadata();

  const externalDashboardQueryParams = new URLSearchParams();
  if (enterpriseCustomer.authOrgId) {
    externalDashboardQueryParams.set('org_id', enterpriseCustomer.authOrgId);
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

  useEffect(() => {
    // Once a redemption has successfully completed and the can-redeem query has been invalidated or
    // a user attempts to navigate directly to /:enterpriseSlug/:courseType/course/:courseKey/enroll,
    // it will run this conditional and perform the redirect
    if (hasSuccessfulRedemption) {
      navigate(completeEnrollmentUrl);
    }
  }, [completeEnrollmentUrl, hasSuccessfulRedemption, navigate]);

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
                <FormattedMessage
                  id="executive.education.external.course.enrollment.page.registration.title"
                  defaultMessage="Your registration(s)"
                  description="Title for the executive education course registration page"
                />
              </h2>
              <Alert
                variant="success"
                ref={containerRef}
                icon={CheckCircle}
                show={isDuplicateExternalCourseOrder(externalCourseFormSubmissionError)}
                actions={[
                  <Button as={Hyperlink} target="_blank" destination={externalDashboardUrl}>
                    <FormattedMessage
                      id="executive.education.external.course.enrollment.page.go.to.dashboard.cta"
                      defaultMessage="Go to dashboard"
                      description="Button that will navigate the learners to learner dashboard"
                    />
                  </Button>,
                ]}
              >
                <Alert.Heading>
                  <FormattedMessage
                    id="executive.education.external.course.enrollment.page.already.enrolled.alert.heading"
                    defaultMessage="Already Enrolled"
                    description="Heading for the alert when the user is already enrolled"
                  />
                </Alert.Heading>
                <p>
                  <FormattedMessage
                    id="executive.education.external.course.enrollment.page.already.enrolled.message"
                    defaultMessage="You're already enrolled. Go to your GetSmarter dashboard to keep learning."
                    description="Message displayed when the user is already enrolled in current course"
                  />
                </p>
              </Alert>
              {!isDuplicateExternalCourseOrder(externalCourseFormSubmissionError) && (
                <p className="small bg-light-500 p-3 rounded-lg">
                  <FormattedMessage
                    id="executive.education.external.course.enrollment.page.finalize.registration.message"
                    defaultMessage='<strong>This is where you finalize your registration for an edX executive education course through GetSmarter.</strong> Please ensure that the course details below are correct and confirm using Learner Credit with a "Confirm registration" button.'
                    description="Message to finalize registration for an executive education course through GetSmarter."
                    // eslint-disable-next-line react/no-unstable-nested-components
                    values={{ strong: (chunks) => <strong>{chunks}</strong> }}
                  />
                  {(features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && isCourseAssigned)
                    ? (
                      <FormattedMessage
                        id="executive.education.external.course.enrollment.page.funds.allocated.message"
                        defaultMessage="Your learning administrator already allocated funds towards this registration."
                        description="Message when funds are already allocated for the registration by the administator."
                      />
                    )
                    : (
                      <FormattedMessage
                        id="executive.education.external.course.enrollment.page.funds.redeemed.message"
                        defaultMessage="Your Learner Credit funds will be redeemed at this point."
                        description="Message when Learner Credit funds will be redeemed"
                      />
                    )}
                </p>
              )}
              <CourseSummaryCard courseMetadata={minimalCourseMetadata} />
              <RegistrationSummaryCard priceDetails={minimalCourseMetadata.priceDetails} />
              <UserEnrollmentForm
                productSKU={courseEntitlementProductSku}
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
