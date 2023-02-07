import React, {
  useContext,
} from 'react';
import {
  Button,
  CardGrid,
} from '@edx/paragon';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import PropTypes from 'prop-types';
import { Search } from '@edx/paragon/icons';

import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../loading-spinner';

import { NO_PROGRAMS_ERROR_MESSAGE } from './data/constants';
import ProgramListingCard from './ProgramListingCard';

import { CONTENT_TYPE_PROGRAM } from '../search/constants';

const ProgramListingPage = ({ canOnlyViewHighlightSets, programData }) => {
  const { enterpriseConfig } = useContext(AppContext);

  const { data, error } = programData;

  if (error) {
    return <ErrorPage message={error.message} />;
  }

  if (!data) {
    return (
      <div className="py-5">
        <LoadingSpinner screenReaderText="loading program" />
      </div>
    );
  }

  return (
    <div className="py-5">
      {data.length > 0 ? (
        <CardGrid columnSizes={{ xs: 12, lg: 6 }}>
          {data.map((program) => <ProgramListingCard program={program} key={program.title} />)}
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
  programData: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
    })),
    error: PropTypes.shape({
      message: PropTypes.string,
    }),
  }),
};

ProgramListingPage.defaultProps = {
  canOnlyViewHighlightSets: false,
  programData: {
    data: [],
    error: null,
  },
};

export default ProgramListingPage;
