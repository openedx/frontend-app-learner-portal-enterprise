import React, {
  useContext,
} from 'react';
import {
  Button,
  CardGrid,
} from '@openedx/paragon';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import PropTypes from 'prop-types';
import { Search } from '@openedx/paragon/icons';

import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../loading-spinner';

import { NO_PROGRAMS_ERROR_MESSAGE } from './data/constants';
import ProgramListingCard from './ProgramListingCard';

import { CONTENT_TYPE_PROGRAM } from '../search/constants';

const ProgramListingPage = ({ canOnlyViewHighlightSets, programsListData, programsFetchError }) => {
  const { enterpriseConfig } = useContext(AppContext);
  if (programsFetchError) {
    return <ErrorPage message={programsFetchError.message} />;
  }

  if (!programsListData) {
    return (
      <div className="py-5">
        <LoadingSpinner screenReaderText="loading program" />
      </div>
    );
  }

  return (
    <div className="py-5">
      {programsListData.length > 0 ? (
        <CardGrid columnSizes={{ xs: 12, lg: 6 }}>
          {programsListData.map((program) => <ProgramListingCard program={program} key={program.title} />)}
        </CardGrid>
      ) : (
        <div className="no-content-message">
          <h2>{NO_PROGRAMS_ERROR_MESSAGE}</h2>
          {(canOnlyViewHighlightSets === false) && (
            <Link to={`/${enterpriseConfig.slug}/search?content_type=${CONTENT_TYPE_PROGRAM}`}>
              <Button variant="primary" iconBefore={Search} className="btn-brand-primary mt-2">Explore programs</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

ProgramListingPage.propTypes = {
  canOnlyViewHighlightSets: PropTypes.bool,
  programsListData: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
  })),
  programsFetchError: PropTypes.shape({
    message: PropTypes.string,
  }),
};

ProgramListingPage.defaultProps = {
  canOnlyViewHighlightSets: false,
  programsListData: [],
  programsFetchError: null,
};

export default ProgramListingPage;
