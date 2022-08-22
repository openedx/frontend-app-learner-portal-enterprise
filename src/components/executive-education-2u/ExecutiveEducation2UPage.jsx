import React, {
  useContext, useEffect, useMemo,
} from 'react';
import { Container, Row, Col } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';
import { logError } from '@edx/frontend-platform/logging';
import NotFoundPage from '../NotFoundPage';
import UserEnrollmentForm from './UserEnrollmentForm';
import {
  useActiveQueryParams,
  useExecutiveEducation2UContentMetadata,
} from './data';
import ExecutiveEducation2UError from './ExecutiveEducation2UError';

function ExecutiveEducation2UPage() {
  const { enterpriseConfig } = useContext(AppContext);
  const activeQueryParams = useActiveQueryParams();

  const isExecEd2UFulfillmentEnabled = useMemo(() => (
    enterpriseConfig.enableExecutiveEducation2UFulfillment && activeQueryParams.has('course_uuid')
  ), [enterpriseConfig, activeQueryParams]);

  const {
    isLoading: isLoadingContentMetadata,
    contentMetadata,
  } = useExecutiveEducation2UContentMetadata({
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
  }, [activeQueryParams, enterpriseConfig]);

  if (!isExecEd2UFulfillmentEnabled) {
    return (
      <NotFoundPage />
    );
  }

  const isLoading = isLoadingContentMetadata;
  const { name: enterpriseName } = enterpriseConfig;

  const pageTitle = 'Share course enrollment information';
  const queryParams = {
    failureReason: activeQueryParams.get('failure_reason'),
    httpReferrer: activeQueryParams.get('http_referrer'),
  };
  return (
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
            {isLoading ? (
              <Skeleton containerTestId="loading-skeleton-page-title" />
            ) : (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>{pageTitle}</>
            )}
          </h2>
          <p>
            {(isLoading || !contentMetadata) ? (
              <p>
                <Skeleton count={3} containerTestId="loading-skeleton-text-blurb" />
              </p>
            ) : (
              <Row className="mb-4">
                <Col xs={12} lg={10}>
                  <p>
                    {enterpriseName} has partnered with edX and GetSmarter to offer you high-quality Executive Education
                    courses. To access <strong>&quot;{contentMetadata.title}&quot;</strong>, you must (1) provide course
                    enrollment data and (2) accept Terms and Conditions.
                  </p>
                </Col>
              </Row>
            )}
          </p>
          {!isLoading && <UserEnrollmentForm />}
        </>
      )}
    </Container>
  );
}

export default ExecutiveEducation2UPage;
