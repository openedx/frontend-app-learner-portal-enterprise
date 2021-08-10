import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connectStateResults, Hits } from 'react-instantsearch-dom';
import Skeleton from 'react-loading-skeleton';
import { useNbHitsFromSearchResults } from '@edx/frontend-enterprise-catalog-search';
import { Container, StatusAlert } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import SearchJobCard from './SearchJobCard';
import SelectJobCard from './SelectJobCard';
import {
  COURSE_ERROR_ALERT_MESSAGE, JOBS_ERROR_ALERT_MESSAGE, STEP1, STEP2,
} from './constants';
import SearchCourseCard from './SearchCourseCard';
import { isDefinedAndNotNull } from '../../utils/common';

const renderError = (isJobResult) => (
  <div>
    <div>
      <FontAwesomeIcon icon={faExclamationTriangle} />
    </div>
    <p>
      { isJobResult ? JOBS_ERROR_ALERT_MESSAGE : COURSE_ERROR_ALERT_MESSAGE }
    </p>
  </div>
);

const hitResultComponent = (isJobResult, currentStep) => {
  if (!isJobResult) {
    return SearchCourseCard;
  }
  if (currentStep === STEP1) {
    return SearchJobCard;
  }
  return SelectJobCard;
};

const SearchResults = ({
  searchResults,
  isSearchStalled,
  error,
  currentStep,
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
              { !isJobResult && <SearchCourseCard.Skeleton /> }
              { isJobResult && (currentStep === STEP1) && <SearchJobCard.Skeleton /> }
              { isJobResult && (currentStep === STEP2) && <SelectJobCard.Skeleton /> }
            </div>
          </>
        )}
        {!isSearchStalled && nbHits > 0 && (
          <div className="hits-results">
            { !isJobResult && <h3> Recommended Courses </h3> }
            <Hits hitComponent={hitResultComponent(isJobResult, currentStep)} />
          </div>
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
  currentStep: PropTypes.string,
  className: PropTypes.string,
  isJobResult: PropTypes.bool,
};

SearchResults.defaultProps = {
  searchResults: undefined,
  isSearchStalled: false,
  error: undefined,
  currentStep: STEP1,
  className: 'skills-quiz-search-results',
  isJobResult: false,
};

export default connectStateResults(SearchResults);
