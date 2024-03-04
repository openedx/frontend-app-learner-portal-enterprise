import React, {
  useContext, useState, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContext } from './SkillsContextProvider';
import { SET_KEY_VALUE } from './data/constants';
import JobCardComponentV2 from '../skills-quiz-v2/JobCardComponent';
import JobCardComponent from './JobCardComponent';
import { JOB_FILTERS } from './constants';

const SearchJobCard = ({ index, isSkillQuizV2, courseIndex }) => {
  const { refinements } = useContext(SearchContext);
  const { name: jobs, current_job: currentJob } = refinements;
  const [isLoading, setIsLoading] = useState(true);
  const { dispatch, state } = useContext(SkillsContext);
  const { interestedJobs } = state;

  const jobsToFetch = useMemo(() => {
    const jobsArray = [];
    if (jobs) {
      jobs.forEach(job => jobsArray.push(`name:${job}`));
    }
    return jobsArray;
  }, [jobs]);
  const jobToFetch = useMemo(() => {
    const jobArray = [];
    if (currentJob?.length > 0) {
      jobArray.push(`name:${currentJob[0]}`);
    }
    return jobArray;
  }, [currentJob]);

  useEffect(
    () => {
      let fetch = true;
      fetchJobs(); // eslint-disable-line no-use-before-define
      return () => { fetch = false; };

      async function fetchJobs() {
        setIsLoading(true);
        const { hits } = await index.search('', {
          filters: JOB_FILTERS.JOB_SOURCE_COURSE_SKILL,
          facetFilters: [
            jobsToFetch,
          ],
        });
        if (!fetch) { return; }
        const jobHits = hits.length <= 3 ? hits : hits.slice(0, 3);
        dispatch({ type: SET_KEY_VALUE, key: 'interestedJobs', value: jobHits });
        setIsLoading(false);
      }
    },
    [dispatch, index, jobs, jobsToFetch],
  );
  useEffect(() => {
    let fetch = true;
    if (currentJob) {
      fetchJob(); // eslint-disable-line no-use-before-define
    }
    return () => { fetch = false; };
    async function fetchJob() {
      const { hits } = await index.search('', {
        facetFilters: [
          jobToFetch,
        ],
      });
      if (!fetch) { return; }
      dispatch({ type: SET_KEY_VALUE, key: 'currentJobRole', value: hits });
    }
  }, [dispatch, index, currentJob, jobToFetch]);

  return (
    isSkillQuizV2
      ? <JobCardComponentV2 jobs={interestedJobs} isLoading={isLoading} jobIndex={index} courseIndex={courseIndex} />
      : <JobCardComponent jobs={interestedJobs} isLoading={isLoading} />
  );
};

SearchJobCard.propTypes = {
  index: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }).isRequired,
  courseIndex: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }),
  isSkillQuizV2: PropTypes.bool,
};

SearchJobCard.defaultProps = {
  courseIndex: undefined,
  isSkillQuizV2: false,
};

export default SearchJobCard;
