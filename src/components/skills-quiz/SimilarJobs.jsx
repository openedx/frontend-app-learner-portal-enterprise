import {
  Fragment, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { SearchContext, setRefinementAction } from '@edx/frontend-enterprise-catalog-search';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { Hyperlink } from '@openedx/paragon';
import { SkillsContext } from './SkillsContextProvider';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE } from './constants';
import { SET_KEY_VALUE } from './data/constants';
import { useAlgoliaSearch } from '../app/data';
import { AlgoliaFilterBuilder } from '../AlgoliaFilterBuilder';

import { withCamelCasedStateResults } from '../../utils/HOC';

const SimilarJobHits = ({ hits, isLoading }) => {
  const {
    state: {
      selectedJob, goal, interestedJobs,
    },
    dispatch: skillsDispatch,
  } = useContext(SkillsContext);
  const { refinements: { name }, dispatch } = useContext(SearchContext);
  const { interestedJobsCopy, nameCopy } = useMemo(() => ({
    interestedJobsCopy: interestedJobs?.filter((job) => job.name !== selectedJob) || [],
    nameCopy: name?.filter((jobObj) => jobObj !== selectedJob) || [],
  }), [interestedJobs, name, selectedJob]);
  const updateDispatch = useCallback(() => {
    skillsDispatch({
      type: SET_KEY_VALUE,
      key: 'selectedJob',
      value: hits[0].name,
    });

    if (goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE) {
      skillsDispatch({
        type: SET_KEY_VALUE,
        key: 'currentJobRole',
        value: [hits[0]],
      });
    } else {
      dispatch(setRefinementAction('name', [...nameCopy, hits[0].name]));
      skillsDispatch({
        type: SET_KEY_VALUE,
        key: 'interestedJobs',
        value: [...interestedJobsCopy, hits[0]],
      });
    }
  }, [dispatch, goal, hits, interestedJobsCopy, nameCopy, skillsDispatch]);

  useEffect(() => {
    if (!isLoading && hits?.length > 0 && (hits[0]?.name !== selectedJob)) {
      updateDispatch();
    }
  }, [hits, interestedJobs, isLoading, selectedJob, updateDispatch]);
  return null;
};
SimilarJobHits.propTypes = {
  isLoading: PropTypes.bool,
  hits: PropTypes.arrayOf(PropTypes.shape()),
};

const ConnectedSimilarJobsHits = withCamelCasedStateResults(SimilarJobHits);

const SimilarJobs = ({ selectedJobDetails }) => {
  const config = getConfig();
  const {
    searchIndex: jobIndex,
    searchClient: jobSearchClient,
  } = useAlgoliaSearch(config.ALGOLIA_INDEX_NAME_JOBS);
  const {
    state: {
      selectedJob,
    },
  } = useContext(SkillsContext);
  const [searchFilters, setSearchFilters] = useState('');
  const handleSimilarJobClick = useCallback((jobName) => {
    setSearchFilters(new AlgoliaFilterBuilder()
      .and('name', jobName, { stringify: true }).build());
  }, []);

  return (
    <InstantSearch
      indexName={jobIndex.indexName}
      searchClient={jobSearchClient}
    >
      {searchFilters && <Configure filters={searchFilters} />}
      <div className="mt-4">
        <p>{`Explore similar jobs to ${selectedJob}: `}
          {selectedJobDetails[0]?.similarJobs?.map((job, index) => (
            <Fragment key={`${job}`}>
              {index ? ', ' : ''}
              <Hyperlink
                onClick={() => {
                  handleSimilarJobClick(job);
                }}
              >
                {job}
              </Hyperlink>
            </Fragment>
          ))}
        </p>
      </div>
      <ConnectedSimilarJobsHits />
    </InstantSearch>
  );
};

SimilarJobs.propTypes = {
  selectedJobDetails: PropTypes.arrayOf(PropTypes.shape({
    similarJobs: PropTypes.arrayOf.string,
  })).isRequired,
};

export default SimilarJobs;
