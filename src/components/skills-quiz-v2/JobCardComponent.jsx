import React, { useContext, useState, useEffect } from 'react';
import {
  SelectableBox, Chip, Spinner, Stack, Button,
} from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import PropTypes from 'prop-types';
import { SkillsContext } from '../skills-quiz/SkillsContextProvider';
import { SET_KEY_VALUE } from '../skills-quiz/data/constants';
import TopSkillsOverview from '../skills-quiz/TopSkillsOverview';
import SearchCourseCard from '../skills-quiz/SearchCourseCard';
import SearchProgramCard from '../skills-quiz/SearchProgramCard';
import SearchPathways from '../skills-quiz/SearchPathways';
import SkillsCourses from '../skills-quiz/SkillsCourses';
import { fetchCourseEnrollments } from '../skills-quiz/data/service';
import { saveSkillsGoalsAndJobsUserSelected } from '../skills-quiz/data/utils';

const JobCardComponent = ({
  jobs, isLoading, jobIndex, courseIndex,
}) => {
  const { dispatch, state } = useContext(SkillsContext);
  const { goal, currentJobRole, interestedJobs } = state;
  const [jobSelected, setJobSelected] = useState(undefined);
  const [showMoreRecommendedCourses, setShowMoreRecommendedCourses] = useState(false);

  useEffect(() => {
    if (jobs?.length > 0) {
      setJobSelected(jobs[0]?.name);
      dispatch({
        type: SET_KEY_VALUE,
        key: 'selectedJob',
        value: jobs[0]?.name,
      });
    }
  }, [jobs, dispatch]);

  useEffect(() => {
    if (goal && (currentJobRole || interestedJobs)) {
      saveSkillsGoalsAndJobsUserSelected(goal, currentJobRole, interestedJobs);
    }
  }, [goal, currentJobRole, interestedJobs]);

  useEffect(() => {
    const fetchLearnerCourseEnrollments = async () => {
      try {
        const response = await fetchCourseEnrollments();
        const enrolledCourses = camelCaseObject(response.data);
        const enrolledCourseIds = enrolledCourses.map(
          (course) => course.courseDetails.courseId,
        );
        dispatch({
          type: SET_KEY_VALUE,
          key: 'enrolledCourseIds',
          value: enrolledCourseIds,
        });
      } catch (error) {
        logError(error);
      }
    };

    if (jobs?.length > 0) {
      fetchLearnerCourseEnrollments();
    }
  }, [dispatch, jobs]);

  const handleChange = (e) => {
    e.preventDefault();
    setJobSelected(e.target.value);
    dispatch({ type: SET_KEY_VALUE, key: 'selectedJob', value: e.target.value });
    setShowMoreRecommendedCourses(false);
  };

  return !isLoading ? (
    <div className="skills-quiz-v2-job-card">
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
      {jobs?.length > 0 && (
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
    </div>
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
