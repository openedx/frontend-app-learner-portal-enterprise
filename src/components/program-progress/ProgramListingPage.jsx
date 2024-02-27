import React, {
  useContext,
} from 'react';
import {
  Button,
  CardGrid,
} from '@edx/paragon';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { Search } from '@edx/paragon/icons';

import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../loading-spinner';

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
    <div className="py-5" data-testid="program-listing-page">
      {programsListData.length > 0 ? (
        <CardGrid columnSizes={{ xs: 12, lg: 6 }}>
          {programsListData.map((program) => <ProgramListingCard program={program} key={program.title} />)}
        </CardGrid>
      ) : (
        <div className="no-content-message">
          <h2>
            <FormattedMessage
              id="enterprise.dashboard.programs.no.programs.error.message"
              defaultMessage="You are not enrolled in any programs yet."
              description="Error message for no programs found."
            />
          </h2>
          {(canOnlyViewHighlightSets === false) && (
            <Link to={`/${enterpriseConfig.slug}/search?content_type=${CONTENT_TYPE_PROGRAM}`}>
              <Button variant="primary" iconBefore={Search} className="btn-brand-primary mt-2">
                <FormattedMessage
                  id="enterprise.dashboard.programs.explore.programs.button.text"
                  defaultMessage="Explore programs"
                  description="Text for explore programs button on programs page"
                />
              </Button>
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
