import { Link } from 'react-router-dom';
import { Button, CardGrid } from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { Search } from '@openedx/paragon/icons';

import { NO_PATHWAYS_ERROR_MESSAGE } from './constants';
import PathwayProgressCard from './PathwayProgressCard';

import { CONTENT_TYPE_PATHWAY } from '../search/constants';
import { useCanOnlyViewHighlights, useEnterpriseCustomer, useEnterprisePathwaysList } from '../app/data';

// [tech debt] This should be moved to an import within the `src/index.scss` file.
import './styles/index.scss';

const PathwayProgressListingPage = () => {
  const { data: canOnlyViewHighlightSets } = useCanOnlyViewHighlights();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const {
    data: enterprisePathways,
    error: pathwayFetchError,
  } = useEnterprisePathwaysList();

  if (pathwayFetchError) {
    return <ErrorPage message={pathwayFetchError.message} />;
  }

  return (
    <div className="py-5" data-testid="pathway-listing-page">
      {enterprisePathways.length > 0 ? (
        <CardGrid columnSizes={{ xs: 12, lg: 6 }}>
          {enterprisePathways.map((pathway) => (
            <PathwayProgressCard
              pathway={pathway}
              key={pathway.learnerPathwayProgress.uuid}
            />
          ))}
        </CardGrid>
      ) : (
        <div className="no-content-message">
          <h2>{NO_PATHWAYS_ERROR_MESSAGE}</h2>
          {(canOnlyViewHighlightSets === false) && (
            <Link to={`/${enterpriseCustomer.slug}/search?content_type=${CONTENT_TYPE_PATHWAY}`}>
              <Button variant="primary" iconBefore={Search} className="btn-brand-primary mt-2">Explore pathways</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default PathwayProgressListingPage;
