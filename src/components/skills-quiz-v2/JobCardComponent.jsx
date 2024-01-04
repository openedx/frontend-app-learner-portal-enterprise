import React, { useContext, useState, useEffect } from 'react';
import {
  SelectableBox, Chip, Spinner, Stack, Button,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { SkillsContext } from '../skills-quiz/SkillsContextProvider';
import { SET_KEY_VALUE } from '../skills-quiz/data/constants';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE } from '../skills-quiz/constants';
import TopSkillsOverview from '../skills-quiz/TopSkillsOverview';
import SearchCourseCard from '../skills-quiz/SearchCourseCard';
import SearchProgramCard from '../skills-quiz/SearchProgramCard';
import SearchPathways from '../skills-quiz/SearchPathways';
import SkillsCourses from '../skills-quiz/SkillsCourses';

const JobCardComponent = ({
  jobs, isLoading, jobIndex, courseIndex,
}) => {
  const { dispatch, state } = useContext(SkillsContext);
  const { goal } = state;
  const [jobSelected, setJobSelected] = useState(undefined);
  const [showMoreRecommendedCourses, setShowMoreRecommendedCourses] = useState(false);

  useEffect(() => {
    if (jobs?.length === 1) {
      setJobSelected(jobs[0]?.name);
      dispatch({ type: SET_KEY_VALUE, key: 'selectedJob', value: jobSelected });
    } else if (jobs?.length === 0) {
      setJobSelected(undefined);
      dispatch({ type: SET_KEY_VALUE, key: 'selectedJob', value: undefined });
    }
  }, [jobs, dispatch, jobSelected]);

  const handleChange = (e) => {
    setJobSelected(e.target.value);
    dispatch({ type: SET_KEY_VALUE, key: 'selectedJob', value: e.target.value });
    setShowMoreRecommendedCourses(false);
  };

  return !isLoading ? (
    <>
      <SelectableBox.Set
        type="radio"
        value={jobSelected}
        onChange={handleChange}
        name="industry"
        columns="3"
        className="selectable-box mt-4"
      >
        {jobs.map((job) => (
          <SelectableBox
            key={job.id}
            className="box"
            value={job.name}
            inputHidden={false}
            type="radio"
            aria-label={job.name}
            isLoading={isLoading}
          >
            <div>
              <div className="lead">{job.name}</div>
              <div className="x-small mt-3">Related skills</div>
              {job.skills.slice(0, 5).map((skill) => (
                <div key={skill.name}>
                  <Chip>{skill.name}</Chip>
                </div>
              ))}
            </div>
          </SelectableBox>
        ))}
      </SelectableBox.Set>
      {(jobSelected || goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE) && (
        <>
          <TopSkillsOverview index={jobIndex} />
          <Stack gap={4}>
            <SearchCourseCard index={courseIndex} />
            <SearchProgramCard index={courseIndex} />
            <SearchPathways index={courseIndex} />
          </Stack>
          <div className="text-center py-4">
            { !showMoreRecommendedCourses && (
              <Button
                variant="outline-primary"
                onClick={() => setShowMoreRecommendedCourses(true)}
              >
                See more course recommendations
              </Button>
            ) }
          </div>
          { showMoreRecommendedCourses && <SkillsCourses index={courseIndex} />}
        </>
      )}
    </>
  ) : (
    <Spinner
      animation="border"
      className="mie-3 d-block mt-4"
      screenReaderText="loading"
    />
  );
};

JobCardComponent.defaultProps = {
  jobs: undefined,
  isLoading: false,
  jobIndex: undefined,
  courseIndex: undefined,
};

JobCardComponent.propTypes = {
  isLoading: PropTypes.bool,
  jobs: PropTypes.arrayOf(PropTypes.shape()),
  jobIndex: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }),
  courseIndex: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }),
};

export default JobCardComponent;
