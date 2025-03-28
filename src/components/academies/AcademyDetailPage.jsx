import { useMemo } from 'react';
import {
  Container, Breadcrumb,
} from '@openedx/paragon';
import {
  useParams, Link,
} from 'react-router-dom';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import algoliasearch from 'algoliasearch/lite';
import { getConfig } from '@edx/frontend-platform/config';
import NotFoundPage from '../NotFoundPage';
import './styles/Academy.scss';
import { useAcademyDetails, useEnterpriseCustomer } from '../app/data';
import AcademyContentCard from './AcademyContentCard';

const AcademyDetailPage = () => {
  const config = getConfig();
  const { academyUUID } = useParams();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: academy } = useAcademyDetails();
  const academyURL = `/${enterpriseCustomer.slug}/academy/${academyUUID}/?${enterpriseCustomer.uuid}`;
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
          <h1 data-testid="academy-title" className="my-4.5 font-italic text-left academy-title">
            <FormattedMessage
              id="academy.detail.page.academy.title"
              defaultMessage="{academyTitle} Academy"
              description="Title for the academy on the academy detail page"
              values={{ academyTitle: academy?.title || 'Academy' }}
            />
          </h1>
        </div>
      </Container>
      <Container size="lg">
        <h3 id="academy-all-courses" data-testid="academy-all-courses-title" className="h3 mb-3">
          <FormattedMessage
            id="academy.detail.page.all.courses.title"
            defaultMessage="All {academyTitle} Academy Courses"
            description="Title for the all courses section of a specific academy on the academy detail page"
            values={{ academyTitle: academy?.title }}
          />
        </h3>
      </Container>
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
