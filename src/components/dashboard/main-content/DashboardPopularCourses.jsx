import React, { useContext } from 'react';
import { InstantSearch } from 'react-instantsearch-dom';

import { Container } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';

import { PopularResults } from '../../search/popular-results';
import { COURSE_TITLE, SEARCH_FACET_FILTERS } from '../../search/constants';

import { NUM_POPULAR_COURSES_TO_DISPLAY } from './data/constants';

const DashboardPopularCourses = () => {
  const { algolia } = useContext(AppContext);
  const config = getConfig();

  return (
    <SearchData searchFacetFilters={SEARCH_FACET_FILTERS}>
      <InstantSearch
        indexName={config.ALGOLIA_INDEX_NAME}
        searchClient={algolia.client}
      >
        <Container size="lg" className="search-results pl-0 my-5">
          <PopularResults
            title={COURSE_TITLE}
            numberResultsToDisplay={NUM_POPULAR_COURSES_TO_DISPLAY}
          />
        </Container>
      </InstantSearch>
    </SearchData>
  );
};

export default DashboardPopularCourses;
