import React, { useContext } from 'react';

import { CardGrid, Container, Skeleton } from '@openedx/paragon';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '@edx/frontend-platform/react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import SearchAcademyCard from '../academies/SearchAcademyCard';
import { useAcademies } from '../academies/data/hooks';
import { ACADEMY_TITLE, CARDGRID_COLUMN_SIZES } from './constants';
import { getNoOfResultsFromTitle, getSkeletonCardFromTitle } from '../utils/search';
import SearchError from './SearchError';

const SearchAcademy = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const [academies, isLoading, fetchError] = useAcademies(enterpriseConfig.uuid);
  const SkeletonCard = getSkeletonCardFromTitle(ACADEMY_TITLE);

  if (isLoading) {
    return (
      <Container size="lg" className="search-results py-5">
        <Skeleton className="h2 d-block mb-3" width={240} />
        <CardGrid columnSizes={CARDGRID_COLUMN_SIZES}>
          {[...Array(getNoOfResultsFromTitle(ACADEMY_TITLE)).keys()].map(resultNum => <SkeletonCard data-testid="skeleton-card" key={resultNum} />)}
        </CardGrid>
      </Container>
    );
  }

  if (fetchError) {
    return (
      <Container size="lg" className="search-results py-5">
        <SearchError title={ACADEMY_TITLE} />
      </Container>
    );
  }

  return (
    !isLoading && !fetchError && academies?.length > 0 && (
      <Container size="lg" className="search-results py-5">
        <h2>
          <FormattedMessage
            id="enterprise.search.page.academies.section.title"
            defaultMessage="edX Academies; designed to meet your most critical business needs"
            description="Title of the academies section on the enterprise search page."
          />
        </h2>
        <p>
          <FormattedMessage
            id="enterprise.search.page.academies.section.subtile"
            defaultMessage="Choose from a curated range of programs aligned to the most in demand capability and skill areas crucial to organization success."
            description="Subtitle of the academies section on the enterprise search page."
          />
        </p>
        <div className="academies-grid">
          <CardGrid columnSizes={CARDGRID_COLUMN_SIZES}>
            {academies?.map((academy) => <SearchAcademyCard key={uuidv4()} {...academy} />)}
          </CardGrid>
        </div>
      </Container>
    )
  );
};

SearchAcademy.propTypes = {};

export default SearchAcademy;
