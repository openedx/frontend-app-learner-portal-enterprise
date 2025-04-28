import {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { Hyperlink } from '@openedx/paragon';
import { SkillsContext } from './SkillsContextProvider';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE } from './constants';
import { SET_KEY_VALUE } from './data/constants';
import { useAlgoliaSearch } from '../app/data';
import { AlgoliaFilterBuilder } from '../AlgoliaFilterBuilder';
import { withCamelCasedStateResults } from '../utils/skills-quiz';

// const SimilarJobs = ({ selectedJobDetails, index }) => {
//   const {
//     state: {
//       selectedJob, goal, interestedJobs,
//     },
//     dispatch: skillsDispatch,
//   } = useContext(SkillsContext);
//   const { refinements: { name }, dispatch } = useContext(SearchContext);
//
//   async function handleSimilarJobClick(jobName) {
//     const { hits } = await index.search('', {
//       facetFilters: [
//         [`name:${jobName}`],
//       ],
//     });
//     if (hits.length > 0) {
//       const interestedJobsCopy = interestedJobs?.filter((job) => job.name !== selectedJob);
//       const nameCopy = name?.filter((jobObj) => jobObj !== selectedJob);
//       skillsDispatch({
//         type: SET_KEY_VALUE,
//         key: 'selectedJob',
//         value: hits[0].name,
//       });
//
//       if (goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE) {
//         skillsDispatch({
//           type: SET_KEY_VALUE,
//           key: 'currentJobRole',
//           value: [hits[0]],
//         });
//       } else {
//         dispatch(setRefinementAction('name', [...nameCopy, hits[0].name]));
//         skillsDispatch({
//           type: SET_KEY_VALUE,
//           key: 'interestedJobs',
//           value: [...interestedJobsCopy, hits[0]],
//         });
//       }
//     }
//   }
//
//   return (
//     <div className="mt-4">
//       <p>{`Explore similar jobs to ${selectedJob}: `}
//         {selectedJobDetails[0]?.similar_jobs?.map((job, jobIndex) => (
//           <Hyperlink
//             key={`${job}`}
//             onClick={() => {
//               handleSimilarJobClick(job);
//             }}
//           >
//             { (jobIndex ? ', ' : '') + job }
//           </Hyperlink>
//         ))}
//       </p>
//     </div>
//   );
// };

const SimilarJobHits = ({ hits, isLoading }) => {
  const {
    state: {
      selectedJob, goal, interestedJobs,
    },
    dispatch: skillsDispatch,
  } = useContext(SkillsContext);
  const { refinements: { name }, dispatch } = useContext(SearchContext);

  const interestedJobsCopy = useMemo(
    () => hits.length > 0 && interestedJobs.filter((job) => job.name !== selectedJob),
    [hits.length, interestedJobs, selectedJob],
  );
  const nameCopy = useMemo(
    () => hits.length > 0 && name.filter((jobObj) => jobObj !== selectedJob),
    [hits.length, name, selectedJob],
  );
  console.log({ interestedJobsCopy, nameCopy, hits });
  const updateDispatch = useCallback(() => {
    if (!isLoading && hits?.length > 0) {
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
        // dispatch(setRefinementAction('name', [...nameCopy, hits[0].name]));
        skillsDispatch({
          type: SET_KEY_VALUE,
          key: 'interestedJobs',
          value: [...interestedJobsCopy, hits[0]],
        });
      }
    }
  }, [goal, hits, isLoading, skillsDispatch]);

  useEffect(() => {
    updateDispatch();
  }, [updateDispatch]);
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
      .and('name', jobName, true).build());
  }, []);
  return (
    <InstantSearch
      indexName={jobIndex.indexName}
      searchClient={jobSearchClient}
    >
      <Configure filters={searchFilters} />
      <div className="mt-4">
        <p>{`Explore similar jobs to ${selectedJob}: `}
          {selectedJobDetails[0]?.similarJobs?.map((job, index) => (
            <Hyperlink
              key={`${job}`}
              onClick={() => {
                handleSimilarJobClick(job);
              }}
            >
              { (index ? ', ' : '') + job }
            </Hyperlink>
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
