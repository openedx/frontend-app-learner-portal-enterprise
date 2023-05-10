import React, {
  useContext, useEffect, useMemo,
} from 'react';
import { Helmet } from 'react-helmet';
import {
  Container, Row, Col, Skeleton,
} from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { useHistory } from 'react-router-dom';

import moment from 'moment/moment';
import NotFoundPage from '../NotFoundPage';
import UserEnrollmentForm from './UserEnrollmentForm';
import {
  useActiveQueryParams,
  useExecutiveEducation2UContentMetadata,
} from './data';
import ExecutiveEducation2UError from './ExecutiveEducation2UError';
import CourseSummaryCard from './components/CourseSummaryCard';
import RegistrationSummaryCard from './components/RegistrationSummaryCard';
import { getActiveCourseRun } from '../course/data/utils';
import { DATE_FORMAT } from '../program/ProgramCourses';
import { getCourseOrganizationDetails, getExecutiveEducationCoursePrice } from './utils';

const ExecutiveEducation2UPage = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const activeQueryParams = useActiveQueryParams();
  const { push } = useHistory();

  const isExecEd2UFulfillmentEnabled = useMemo(() => {
    const hasRequiredQueryParams = (activeQueryParams.has('course_uuid') && activeQueryParams.has('sku'));
    return enterpriseConfig.enableExecutiveEducation2UFulfillment && hasRequiredQueryParams;
  }, [enterpriseConfig, activeQueryParams]);

  const { isLoadingContentMetadata: isLoading, contentMetadata } = useExecutiveEducation2UContentMetadata({
    courseUUID: activeQueryParams.get('course_uuid'),
    isExecEd2UFulfillmentEnabled,
  });

  useEffect(() => {
    if (!enterpriseConfig.enableExecutiveEducation2UFulfillment) {
      logError(`Enterprise ${enterpriseConfig.uuid} does not have executive education (2U) fulfillment enabled.`);
    }
    if (!activeQueryParams.has('course_uuid')) {
      logError(`Enterprise ${enterpriseConfig.uuid} visited ExecutiveEducation2UPage without required course_uuid query parameter.`);
    }
    if (!activeQueryParams.has('sku')) {
      logError(`Enterprise ${enterpriseConfig.uuid} visited ExecutiveEducation2UPage without required sku query parameter.`);
    }
  }, [activeQueryParams, enterpriseConfig]);

  const pageTitle = 'Share course enrollment information';
  const queryParams = {
    failureReason: activeQueryParams.get('failure_reason'),
    httpReferrer: activeQueryParams.get('http_referer'),
    sku: activeQueryParams.get('sku'),
  };

  const courseMetadata = useMemo(() => {
    if (contentMetadata) {
      const activeCourseRun = getActiveCourseRun(contentMetadata);
      const organizationDetails = getCourseOrganizationDetails(contentMetadata);
      return {
        organizationImage: organizationDetails.organizationLogo,
        organizationName: organizationDetails.organizationName,
        title: contentMetadata.title,
        startDate: moment(activeCourseRun?.start).format(DATE_FORMAT),
        duration: activeCourseRun ? `${activeCourseRun.weeksToComplete} Week${activeCourseRun.weeksToComplete <= 1 ? '' : 's'}` : '-',
        priceDetails: getExecutiveEducationCoursePrice(contentMetadata),
      };
    }
    return {};
  }, [contentMetadata]);

  const handleCheckoutSuccess = () => {
    push({
      pathname: `/${enterpriseConfig.slug}/executive-education-2u/enrollment-completed`,
      state: {
        data: courseMetadata,
      },
    });
  };

  if (!isExecEd2UFulfillmentEnabled) {
    return (
      <NotFoundPage />
    );
  }

  return (
    <div className="exec-ed-registration-page">
      <Container size="lg" className="py-5">
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        {queryParams.failureReason && (
          <ExecutiveEducation2UError
            failureReason={queryParams.failureReason}
            httpReferrer={queryParams.httpReferrer}
          />
        )}
        {!queryParams.failureReason && (
          <>
            <h2 className="mb-3">
              {isLoading || !contentMetadata ? (
                <Skeleton containerTestId="loading-skeleton-page-title" />
              ) : 'Your registration(s)'}
            </h2>
            {(isLoading || !contentMetadata) ? (
              <p>
                <Skeleton count={3} containerTestId="loading-skeleton-text-blurb" />
              </p>
            ) : (
              <Row className="mb-4">
                <Col xs={12} lg={12}>
                  <p className="small bg-light-500 p-3 rounded-lg">
                    <strong>
                      This is where you finalize your registration for an edX executive
                      education course through GetSmarter.
                    </strong>
                    &nbsp; Please ensure that the course details below are correct and confirm using Learner
                    Credit with a &quot;Confirm registration&quot; button.
                    Your Learner Credit funds will be redeemed at this point.
                  </p>
                </Col>
              </Row>
            )}

            {(isLoading || !contentMetadata) ? (
              <p>
                <Skeleton count={3} containerTestId="loading-skeleton-course-summary" />
              </p>
            ) : (
              <CourseSummaryCard courseMetadata={courseMetadata} />
            )}

            {(isLoading || !contentMetadata) ? (
              <p>
                <Skeleton count={3} containerTestId="loading-skeleton-course-summary" />
              </p>
            ) : (
              <RegistrationSummaryCard priceDetails={courseMetadata.priceDetails} />
            )}

            {!isLoading && (
              <UserEnrollmentForm
                productSKU={queryParams.sku}
                onCheckoutSuccess={handleCheckoutSuccess}
              />
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default ExecutiveEducation2UPage;
