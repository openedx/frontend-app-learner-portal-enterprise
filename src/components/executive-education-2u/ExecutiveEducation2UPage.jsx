import React, {
  useContext, useEffect, useState,
} from 'react';
import { Container } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';
import { logError } from '@edx/frontend-platform/logging';

import NotFoundPage from '../NotFoundPage';
import UserEnrollmentForm from './UserEnrollmentForm';
import { getExecutiveEducation2UContentMetadata, useActiveQueryParams } from './data';

function ExecutiveEducation2UPage() {
  const { enterpriseConfig } = useContext(AppContext);
  const activeQueryParams = useActiveQueryParams();

  const [isLoadingContentMetadata, setIsLoadingContentMetadata] = useState(true);
  const [contentMetadata, setContentMetadata] = useState();

  const isExecEd2UFulfillmentEnabled = (enterpriseConfig.enableExecutiveEducation2UFulfillment && activeQueryParams.has('course_uuid'));

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

  useEffect(() => {
    const fetchContentMetadata = async () => {
      setIsLoadingContentMetadata(true);
      try {
        const courseUUID = activeQueryParams.get('course_uuid');
        const metadata = await getExecutiveEducation2UContentMetadata(courseUUID);
        setContentMetadata(metadata);
      } catch (error) {
        logError(error);
      } finally {
        setIsLoadingContentMetadata(false);
      }
    };
    if (isExecEd2UFulfillmentEnabled) {
      fetchContentMetadata();
    }
  }, [isExecEd2UFulfillmentEnabled, activeQueryParams]);

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
