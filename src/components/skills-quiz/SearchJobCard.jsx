import { useContext, useEffect, useMemo } from 'react';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import PropTypes from 'prop-types';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { getConfig } from '@edx/frontend-platform/config';
import { SkillsContext } from './SkillsContextProvider';
import JobCardComponentV2 from '../skills-quiz-v2/JobCardComponent';
import JobCardComponent from './JobCardComponent';
import { JOB_SOURCE_COURSE_SKILL } from './constants';
import { AlgoliaFilterBuilder } from '../AlgoliaFilterBuilder';
import { withCamelCasedStateResults } from '../utils/skills-quiz';
import { useAlgoliaSearch } from '../app/data';
import { SET_KEY_VALUE } from './data/constants';

const JobHits = ({
  hits, isLoading,
}) => {
  const { dispatch } = useContext(SkillsContext);
  const { refinements } = useContext(SearchContext);
  const { current_job: currentJob } = refinements;

  useEffect(() => {
    if (hits.length > 0) {
      if (currentJob?.length > 0) {
        dispatch({ type: SET_KEY_VALUE, key: 'currentJobRole', value: hits });
      }
      dispatch({ type: SET_KEY_VALUE, key: 'interestedJobs', value: hits });
    }
  }, [dispatch, hits]);

  if (false) {
    <JobCardComponentV2 jobs={hits} isLoading={isLoading} jobIndex={index} courseIndex={courseIndex} />;
  }
  return <JobCardComponent jobs={hits} isLoading={isLoading} />;
};

JobHits.propTypes = {
  isLoading: PropTypes.bool,
  hits: PropTypes.arrayOf(PropTypes.shape()),
};

const ConnectedJobHits = withCamelCasedStateResults(JobHits);

const SearchJobCard = () => {
  const config = getConfig();
  const {
    searchIndex: jobIndex,
    searchClient: jobSearchClient,
  } = useAlgoliaSearch(config.ALGOLIA_INDEX_NAME_JOBS);
  const { refinements } = useContext(SearchContext);
  const { name: jobs, current_job: currentJob } = refinements;

  const searchFilters = useMemo(() => {
    if (!jobs?.length) { return null; }
    if (currentJob?.length) {
      return new AlgoliaFilterBuilder()
        .and('name', currentJob[0], true)
        .build();
    }
    return new AlgoliaFilterBuilder()
      .and('job_sources', JOB_SOURCE_COURSE_SKILL)
      .or('name', jobs, true)
      .build();
  }, [currentJob, jobs]);

  return (
    <InstantSearch
      indexName={jobIndex.indexName}
      searchClient={jobSearchClient}
    >
      <Configure filters={searchFilters} hitsPerPage={3} />
      <ConnectedJobHits />
    </InstantSearch>
  );
};

export default SearchJobCard;
