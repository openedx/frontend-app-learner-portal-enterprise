import React, { useContext } from 'react';
import {
  Container, Chip, Breadcrumb,
  Skeleton, Spinner,
} from '@edx/paragon';
import {
  useParams, Link,
} from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { useAcademyMetadata } from './data/hooks';
import CourseCard from './CourseCard';
import NotFoundPage from '../NotFoundPage';
import { ACADEMY_NOT_FOUND_TITLE } from './data/constants';
import { useAlgoliaSearch } from '../../utils/hooks';

const AcademyDetailPage = () => {
  const config = getConfig();
  const { enterpriseConfig } = useContext(AppContext);
  const { academyUUID } = useParams();
  const [academy, isAcademyAPILoading, academyAPIError] = useAcademyMetadata(academyUUID);
  const academyURL = `/${enterpriseConfig.slug}/academy/${academyUUID}`;

  const [, courseIndex] = useAlgoliaSearch(config, config.ALGOLIA_INDEX_NAME);

  if (academyAPIError) {
    return (
      <NotFoundPage
        pageTitle={ACADEMY_NOT_FOUND_TITLE}
        errorHeading={ACADEMY_NOT_FOUND_TITLE}
      />
    );
  }

  return (
    <Container size="lg" className="pt-3 pb-4">
      {isAcademyAPILoading
        ? <Skeleton height={30} count={0.25} className="mb-4" data-testid="academy-breadcrumbs-loading" />
        : (
          <div className="small">
            <Breadcrumb
              data-testid="academy-breadcrumb"
              links={[
                { label: 'Find a Course', to: `/${enterpriseConfig.slug}/search` },
              ]}
              linkAs={Link}
              activeLabel={academy?.title}
            />
          </div>
        )}
      <div>
        {isAcademyAPILoading
          ? <Skeleton height={80} className="mb-4" data-testid="academy-title-loading" />
          : <h2 data-testid="academy-title" className="mb-3 mt-3">{academy?.title}</h2>}
        {
          isAcademyAPILoading
            ? <Skeleton height={30} count={3} data-testid="academy-description-loading" />
            : <p data-testid="academy-description">{academy?.longDescription}</p>
        }
        {isAcademyAPILoading ? <Skeleton height={40} className="mt-4 mb-4" data-testid="academy-tags-loading" />
          : (
            <div className="academy-tags mb-3">
              {academy?.tags.map(tag => (
                <Chip data-testid="academy-tag" key={tag.id} variant="light">{tag.title}</Chip>
              ))}
            </div>
          )}

        {isAcademyAPILoading
          ? (
            <div className="d-flex justify-content-center align-items-center">
              <Spinner animation="border" className="mie-3" screenReaderText="loading" />
            </div>
          )
          : (
            <CourseCard
              courseIndex={courseIndex}
              academyUUID={academyUUID}
              academyTitle={academy?.title}
              academyURL={academyURL}
            />
          )}
      </div>
    </Container>
  );
};

export default AcademyDetailPage;
