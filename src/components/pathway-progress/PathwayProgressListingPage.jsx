import {
  Container,
  Button,
  CardGrid,
} from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import './styles/index.scss';
import PropTypes from 'prop-types';

import { Search } from '@openedx/paragon/icons';

import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../loading-spinner';

import { NO_PATHWAYS_ERROR_MESSAGE } from './constants';
import PathwayProgressCard from './PathwayProgressCard';

import { CONTENT_TYPE_PATHWAY } from '../search/constants';
import { useEnterpriseCustomer } from '../app/data';

const PathwayProgressListingPage = ({ canOnlyViewHighlightSets, pathwayProgressData, pathwayFetchError }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  if (pathwayFetchError) {
    return <ErrorPage message={pathwayFetchError.message} />;
  }

  if (!pathwayProgressData) {
    return (
      <Container size="lg" className="py-5">
        <LoadingSpinner screenReaderText="loading pathways" />
      </Container>
    );
  }

  return (
    <div className="py-5" data-testid="pathway-listing-page">
      {pathwayProgressData.length > 0 ? (
        <CardGrid columnSizes={{ xs: 12, lg: 6 }}>
          {pathwayProgressData.map((pathway) => (
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

PathwayProgressListingPage.propTypes = {
  canOnlyViewHighlightSets: PropTypes.bool,
  pathwayProgressData: PropTypes.arrayOf(PropTypes.shape({
    learnerPathwayProgress: PropTypes.shape({
      uuid: PropTypes.string,
    }),
  })),
  pathwayFetchError: PropTypes.shape({
    message: PropTypes.string,
  }),
};

PathwayProgressListingPage.defaultProps = {
  canOnlyViewHighlightSets: false,
  pathwayProgressData: [],
  pathwayFetchError: null,
};

export default PathwayProgressListingPage;
