import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connectStateResults, Hits } from 'react-instantsearch-dom';
import Skeleton from 'react-loading-skeleton';
import { useNbHitsFromSearchResults } from '@edx/frontend-enterprise-catalog-search';
import { Container, StatusAlert } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import SelectJobCard from './SelectJobCard';
import {
  COURSES_ERROR_ALERT_MESSAGE,
  NO_COURSES_ALERT_MESSAGE,
  JOBS_ERROR_ALERT_MESSAGE,
} from './constants';
import SearchCourseCard from './SearchCourseCard';
import { isDefinedAndNotNull } from '../../utils/common';

const renderError = (isJobResult) => (
  <div>
    <div>
      <FontAwesomeIcon icon={faExclamationTriangle} />
    </div>
    <p>
      { isJobResult ? JOBS_ERROR_ALERT_MESSAGE : COURSES_ERROR_ALERT_MESSAGE }
    </p>
  </div>
);

const renderDialog = () => (
  <div>
    <div>
      <FontAwesomeIcon icon={faExclamationTriangle} />
    </div>
    <p>
      { NO_COURSES_ALERT_MESSAGE }
    </p>
  </div>
);

const SearchResults = ({
  searchResults,
  isSearchStalled,
  error,
  className,
  isJobResult,
}) => {
  const nbHits = useNbHitsFromSearchResults(searchResults);
  return (
    <Container size="lg" className={`my-5 ${className}`}>
      <>
        {isSearchStalled && (
          <>
            <Skeleton className="lead mb-4" width={160} />
            <div className={classNames({ 'skeleton-job-card': isJobResult, 'skeleton-course-card': !isJobResult })}>
              { !isJobResult ? <SearchCourseCard.Skeleton /> : <SelectJobCard.Skeleton /> }
            </div>
          </>
        )}
        {!isSearchStalled && nbHits > 0 && (
          <div className="hits-results">
            { !isJobResult && <h3> Recommended Courses </h3> }
            <Hits hitComponent={!isJobResult ? SearchCourseCard : SelectJobCard} />
          </div>
        )}
        {!isSearchStalled && nbHits === 0 && (
          <StatusAlert
            alertType="info"
            dialog={renderDialog()}
            dismissible={false}
            open
          />
        )}
        {!isSearchStalled && isDefinedAndNotNull(error) && (
          <StatusAlert
            alertType="danger"
            dialog={renderError(isJobResult)}
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
  className: PropTypes.string,
  isJobResult: PropTypes.bool,
};

SearchResults.defaultProps = {
  searchResults: undefined,
  isSearchStalled: false,
  error: undefined,
  className: 'skills-quiz-search-results',
  isJobResult: false,
};

export default connectStateResults(SearchResults);
