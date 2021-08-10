import React from 'react';
import PropTypes from 'prop-types';
import { connectStateResults, Hits } from 'react-instantsearch-dom';
import Skeleton from 'react-loading-skeleton';
import { useNbHitsFromSearchResults } from '@edx/frontend-enterprise-catalog-search';
import { Container, StatusAlert } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import SearchJobCard from './SearchJobCard';
import SelectJobCard from './SelectJobCard';
import { JOBS_ERROR_ALERT_MESSAGE, STEP1, STEP2 } from './constants';
import { isDefinedAndNotNull } from '../../utils/common';

const renderError = () => (
  <div>
    <div>
      <FontAwesomeIcon icon={faExclamationTriangle} />
    </div>
    <p>
      { JOBS_ERROR_ALERT_MESSAGE }
    </p>
  </div>
);

const SearchResults = ({
  searchResults,
  isSearchStalled,
  error,
  currentStep,
  className,
}) => {
  const nbHits = useNbHitsFromSearchResults(searchResults);
  return (
    <Container size="lg" className={`my-5 ${className}`}>
      <>
        {isSearchStalled && (
          <>
            <Skeleton className="lead mb-4" width={160} />
            <div className="skeleton-job-card">
              {currentStep === STEP2 ? (
                <SelectJobCard.Skeleton />)
                : (<SearchJobCard.Skeleton />)}
            </div>
          </>
        )}
        {!isSearchStalled && nbHits > 0 && (
          <>
            <Hits hitComponent={currentStep === STEP2 ? SelectJobCard : SearchJobCard} />
          </>
        )}
        {!isSearchStalled && isDefinedAndNotNull(error) && (
          <StatusAlert
            alertType="danger"
            dialog={renderError()}
            dismissible
            open
          />
        )}
      </>
    </Container>
  );
};

SearchResults.propTypes = {
  searchResults: PropTypes.shape({
    nbHits: PropTypes.number,
  }),
  isSearchStalled: PropTypes.bool,
  error: PropTypes.shape(),
  currentStep: PropTypes.string,
  className: PropTypes.string,
};

SearchResults.defaultProps = {
  searchResults: undefined,
  isSearchStalled: false,
  error: undefined,
  currentStep: STEP1,
  className: 'search-results',
};

export default connectStateResults(SearchResults);
