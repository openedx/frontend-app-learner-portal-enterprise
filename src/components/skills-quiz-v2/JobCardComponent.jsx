import React, { useContext, useState, useEffect } from 'react';
import {
  SelectableBox, Chip, Spinner, Stack, Button,
} from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
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

  if (!isLoading) {
    return (
      <Spinner
        animation="border"
        className="mie-3 d-block mt-4"
        screenReaderText="loading"
      />
    );
  }

  if (!jobs || jobs.length === 0) {
    return null;
  }

  return (
    <div className="skills-quiz-v2-job-card">
      <SelectableBox.Set
        type="radio"
        value={jobSelected}
        onChange={handleChange}
        name="industry"
        columns="3"
        className="selectable-box mt-4"
        aria-label="Select a job"
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
              <div className="x-small mt-3">
                <FormattedMessage
                  id="enterprise.skills.quiz.v2.job.card.related.skills.label"
                  defaultMessage="Related skills"
                  description="Related skills label for the job card on skills quiz v2 page"
                />
              </div>
              {job.skills.slice(0, 5).map((skill) => (
                <div key={skill.name}>
                  <Chip>{skill.name}</Chip>
                </div>
              ))}
            </div>
          </SelectableBox>
        ))}
      </SelectableBox.Set>
      <TopSkillsOverview index={jobIndex} />
      <Stack gap={4}>
        <SearchCourseCard index={courseIndex} />
        <SearchProgramCard index={courseIndex} />
        <SearchPathways index={courseIndex} />
      </Stack>
      <div className="text-center py-4">
        {!showMoreRecommendedCourses && (
          <Button
            variant="outline-primary"
            onClick={() => setShowMoreRecommendedCourses(true)}
          >
            <FormattedMessage
              id="enterprise.skills.quiz.v2.see.more.recommendations.label"
              defaultMessage="See more course recommendations"
              description="Label prompting the user to see more course recommendations on the skills quiz v2 page."
            />
          </Button>
        )}
      </div>
      {showMoreRecommendedCourses && <SkillsCourses index={courseIndex} />}
    </div>
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
