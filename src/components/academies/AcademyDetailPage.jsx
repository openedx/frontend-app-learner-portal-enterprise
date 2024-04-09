import React, { useMemo } from 'react';
import {
  Container, Breadcrumb,
} from '@openedx/paragon';
import {
  useParams, Link,
} from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import algoliasearch from 'algoliasearch/lite';
import { getConfig } from '@edx/frontend-platform/config';
import NotFoundPage from '../NotFoundPage';
import './styles/Academy.scss';
import AcademyContentCard from './AcademyContentCard';
import { useAcademyDetails, useEnterpriseCustomer } from '../app/data';

const AcademyDetailPage = () => {
  const config = getConfig();
  const { academyUUID } = useParams();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: academy } = useAcademyDetails();
  const academyURL = `/${enterpriseCustomer.slug}/academy/${academyUUID}`;
  const intl = useIntl();

  // init algolia index
  const courseIndex = useMemo(
    () => {
      const client = algoliasearch(
        config.ALGOLIA_APP_ID,
        config.ALGOLIA_SEARCH_API_KEY,
      );
      return client.initIndex(config.ALGOLIA_INDEX_NAME);
    },
    [config.ALGOLIA_APP_ID, config.ALGOLIA_INDEX_NAME, config.ALGOLIA_SEARCH_API_KEY],
  );

  if (!academy) {
    return (
      <NotFoundPage
        pageTitle={intl.formatMessage({
          id: 'academy.detail.page.academy.not.found.page.title',
          defaultMessage: 'Academy not found',
          description: 'Page title for the academy not found page.',
        })}
        errorHeading={intl.formatMessage({
          id: 'academy.detail.page.academy.not.found.page.message',
          defaultMessage: 'Academy not found',
          description: 'Error message for the academy not found page.',
        })}
      />
    );
  }

  return (
    <>
      <Container size="lg" className="pt-3">
        <div className="small">
          <Breadcrumb
            data-testid="academy-breadcrumb"
            links={[
              { label: 'Find a Course', to: `/${enterpriseCustomer.slug}/search` },
            ]}
            linkAs={Link}
            activeLabel={academy.title}
          />
        </div>
        <div>
          <h2 data-testid="academy-title" className="mb-3 mt-3">{academy?.title}</h2>
          <p data-testid="academy-description">{academy?.longDescription}</p>
        </div>
      </Container>
      {/* new pathway sectoin will come here */}
      <Container size="lg" className="pb-4">
        <AcademyContentCard
          courseIndex={courseIndex}
          academyUUID={academyUUID}
          academyTitle={academy?.title}
          academyURL={academyURL}
          tags={academy?.tags}
        />
      </Container>
    </>
  );
};

export default AcademyDetailPage;
