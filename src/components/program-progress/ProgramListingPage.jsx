import { Link } from 'react-router-dom';
import { Button, CardGrid } from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Search } from '@openedx/paragon/icons';

import ProgramListingCard from './ProgramListingCard';

import { CONTENT_TYPE_PROGRAM } from '../search/constants';
import { useCanOnlyViewHighlights, useEnterpriseCustomer, useEnterpriseProgramsList } from '../app/data';

const ProgramListingPage = () => {
  const { data: canOnlyViewHighlightSets } = useCanOnlyViewHighlights();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const {
    data: enterprisePrograms,
    error: programsFetchError,
  } = useEnterpriseProgramsList();

  if (programsFetchError) {
    return <ErrorPage message={programsFetchError.message} />;
  }

  return (
    <div className="py-5" data-testid="program-listing-page">
      {enterprisePrograms.length > 0 ? (
        <CardGrid columnSizes={{ xs: 12, lg: 6 }}>
          {enterprisePrograms.map((program) => <ProgramListingCard program={program} key={program.title} />)}
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
            <Link to={`/${enterpriseCustomer.slug}/search?content_type=${CONTENT_TYPE_PROGRAM}`}>
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

export default ProgramListingPage;
