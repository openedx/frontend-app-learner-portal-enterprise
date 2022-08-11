import React, {
  useContext, useEffect, useMemo,
} from 'react';
import { Container } from '@edx/paragon';
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
    const isExecEd2UEnabled = enterpriseConfig.enableExecutiveEducation2UFulfillment;
    const hasCourseUUIDQueryParam = activeQueryParams.has('course_uuid');

    if (!isExecEd2UEnabled) {
      logError(`Enterprise ${enterpriseConfig.uuid} does not have executive education (2U) fulfillment enabled.`);
    }
    if (!hasCourseUUIDQueryParam) {
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

  return (
    <Container size="lg" className="py-5">
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <h2>
        {isLoading ? (
          <Skeleton containerTestId="loading-skeleton-page-title" />
        ) : (
          <>{pageTitle}</>
        )}
      </h2>
      <p>
        {(isLoading || !contentMetadata) ? (
          <Skeleton count={3} containerTestId="loading-skeleton-text-blurb" />
        ) : (
          <>
            {enterpriseName} has partnered with edX and GetSmarter to offer you high-quality Executive Education
            courses. To access <strong>&quot;{contentMetadata.title}&quot;</strong>, you{' '}
            <strong>must accept</strong> Terms of Service and <strong>provide additional data</strong>.
          </>
        )}
      </p>
      {!isLoading && <UserEnrollmentForm className="mt-5" />}
    </Container>
  );
}

export default ExecutiveEducation2UPage;
