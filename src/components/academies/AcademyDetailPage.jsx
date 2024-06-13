import React, { useMemo } from 'react';
import {
  Container, Breadcrumb,
} from '@openedx/paragon';
import {
  useParams, Link,
} from 'react-router-dom';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import algoliasearch from 'algoliasearch/lite';
import { getConfig } from '@edx/frontend-platform/config';
import { ArrowDownward } from '@openedx/paragon/icons';
import NotFoundPage from '../NotFoundPage';
import './styles/Academy.scss';
import { isObjEmpty, useAcademyDetails, useEnterpriseCustomer } from '../app/data';
import PathwaysSection from './PathwaysSection';
import AcademyContentCard from './AcademyContentCard';
import { useAcademyPathwayData } from './data/hooks';

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

  const [pathway] = useAcademyPathwayData(academyUUID, courseIndex);

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
          {!isObjEmpty(pathway) && (
            <>
              <div>
                <h3 data-testid="academy-instruction-header" className="mb-3">
                  <FormattedMessage
                    id="academy.detail.page.instruction.header"
                    defaultMessage="Follow a recommended pathway - or select individual courses"
                    description="Header for pathways and course selection instructions in a specific academy on the academy detail page"
                  />
                </h3>
                <p data-testid="academy-instruction-description" className="mb-0">
                  <FormattedMessage
                    id="academy.detail.page.instruction.description"
                    defaultMessage="Pathways are curated roadmaps through the academy’s content designed specifically for your learning goals. Or select a specific course from Executive Education or Self-paced courses in this Academy."
                    description="Description for pathways and course selection in a specific academy on the academy detail page"
                  />
                </p>
              </div>
              <div data-testid="academies-jump-link" className="mb-4.5 text-right mr-5">
                <Link to="#academy-all-courses">
                  <FormattedMessage
                    id="academy.detail.page.view.all.courses.link"
                    defaultMessage="View all {academyTitle} Academy Courses"
                    description="Link text to view all courses for a specific academy on the academy detail page"
                    values={{ academyTitle: academy?.title || '' }}
                  />
                  <ArrowDownward />
                </Link>
              </div>
            </>
          )}
        </div>
      </Container>
      {!isObjEmpty(pathway) && <PathwaysSection pathwayData={pathway} />}
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
