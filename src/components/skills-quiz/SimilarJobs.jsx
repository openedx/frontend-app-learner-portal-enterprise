import React, { useContext } from 'react';
import { Hyperlink } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { SearchContext, setRefinementAction } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContext } from './SkillsContextProvider';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE } from './constants';
import { SET_KEY_VALUE } from './data/constants';

const SimilarJobs = ({ selectedJobDetails, index }) => {
  const {
    state: {
      selectedJob, goal, interestedJobs,
    },
    dispatch: skillsDispatch,
  } = useContext(SkillsContext);
  const { refinements: { name }, dispatch } = useContext(SearchContext);

  async function handleSimilarJobClick(jobName) {
    const { hits } = await index.search('', {
      facetFilters: [
        [`name:${jobName}`],
      ],
    });
    if (hits.length > 0) {
      const interestedJobsCopy = interestedJobs?.filter((job) => job.name !== selectedJob);
      const nameCopy = name?.filter((jobObj) => jobObj !== selectedJob);
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
    }
  }

  return (
    <div className="mt-4">
      <p>{`Explore similar jobs to ${selectedJob}: `}
        {selectedJobDetails[0]?.similar_jobs?.map((job, jobIndex) => (
          <Hyperlink
            key={`${job}`}
            onClick={() => {
              handleSimilarJobClick(job);
            }}
          >
            { (jobIndex ? ', ' : '') + job }
          </Hyperlink>
        ))}
      </p>
    </div>
  );
};

SimilarJobs.propTypes = {
  selectedJobDetails: PropTypes.arrayOf(PropTypes.shape({
    similar_jobs: PropTypes.arrayOf.string,
  })).isRequired,
  index: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }).isRequired,
};

export default SimilarJobs;
