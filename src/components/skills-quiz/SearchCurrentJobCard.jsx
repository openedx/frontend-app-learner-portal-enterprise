import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { useContext, useEffect, useMemo } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform/config';
import { AlgoliaFilterBuilder } from '../AlgoliaFilterBuilder';
import { SkillsContext } from './SkillsContextProvider';
import { withCamelCasedStateResults } from '../utils/skills-quiz';
import JobCardComponent from './JobCardComponent';
import { useAlgoliaSearch } from '../app/data';

const JobHits = ({
  hits, isLoading,
}) => {
  const { dispatch } = useContext(SkillsContext);

  useEffect(() => {
    if (hits.length > 0) {
      dispatch({ type: 'SET_KEY_VALUE', key: 'currentJobRole', value: hits });
    }
  }, [dispatch, hits]);

  return (
    <JobCardComponent jobs={hits} isLoading={isLoading} />
  );
};

JobHits.propTypes = {
  isLoading: PropTypes.bool,
  hits: PropTypes.arrayOf(PropTypes.shape()),
};

const ConnectedJobHits = withCamelCasedStateResults(JobHits);

const SearchCurrentJobCard = () => {
  const config = getConfig();
  const {
    searchIndex: jobIndex,
    searchClient: jobSearchClient,
  } = useAlgoliaSearch(config.ALGOLIA_INDEX_NAME_JOBS);
  const { refinements } = useContext(SearchContext);
  const { current_job: currentJob } = refinements;
  const searchFilters = useMemo(() => {
    if (!currentJob?.length) { return null; }
    return new AlgoliaFilterBuilder()
      .and('name', currentJob[0], true)
      .build();
  }, [currentJob]);
  return (
    <InstantSearch
      indexName={jobIndex.indexName}
      searchClient={jobSearchClient}
    >
      <Configure filters={searchFilters} />
      <ConnectedJobHits />
    </InstantSearch>
  );
};

export default SearchCurrentJobCard;
