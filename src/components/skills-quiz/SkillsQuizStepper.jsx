/* eslint-disable object-curly-newline */
import React, { useEffect, useState, useContext, useMemo } from 'react';
import {
  Button, Stepper, ModalDialog, Container, Form, Stack,
} from '@edx/paragon';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { useHistory } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import GoalDropdown from './GoalDropdown';
import SearchJobDropdown from './SearchJobDropdown';
import CurrentJobDropdown from './CurrentJobDropdown';
import IndustryDropdown from './IndustryDropdown';
import SearchJobCard from './SearchJobCard';
import SearchCurrentJobCard from './SearchCurrentJobCard';
import SearchCourseCard from './SearchCourseCard';
import SearchProgramCard from './SearchProgramCard';
import SearchPathways from './SearchPathways';
import SelectJobCard from './SelectJobCard';
import SkillsCourses from './SkillsCourses';

import {
  DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE,
  STEP1,
  STEP2,
  STEP3,
  SKILLS_QUIZ_SEARCH_PAGE_MESSAGE,
  GOAL_DROPDOWN_DEFAULT_OPTION,
} from './constants';
import { SkillsContext } from './SkillsContextProvider';
import { SET_KEY_VALUE } from './data/constants';
import { checkValidGoalAndJobSelected } from '../utils/skills-quiz';
import TopSkillsOverview from './TopSkillsOverview';
import SkillsQuizHeader from './SkillsQuizHeader';

import headerImage from './images/headerImage.png';
import { saveSkillsGoalsAndJobsUserSelected } from './data/utils';
import { fetchCourseEnrollments } from './data/service';

const SkillsQuizStepper = () => {
  const config = getConfig();
  const { userId } = getAuthenticatedUser();
  const [searchClient, courseIndex, jobIndex] = useMemo(
    () => {
      const client = algoliasearch(
        config.ALGOLIA_APP_ID,
        config.ALGOLIA_SEARCH_API_KEY,
      );
      const cIndex = client.initIndex(config.ALGOLIA_INDEX_NAME);
      const jIndex = client.initIndex(config.ALGOLIA_INDEX_NAME_JOBS);
      return [client, cIndex, jIndex];
    },
    [config.ALGOLIA_APP_ID, config.ALGOLIA_INDEX_NAME, config.ALGOLIA_INDEX_NAME_JOBS, config.ALGOLIA_SEARCH_API_KEY],
  );
  const [currentStep, setCurrentStep] = useState(STEP1);
  const [isStudentChecked, setIsStudentChecked] = useState(false);
  const handleIsStudentCheckedChange = e => setIsStudentChecked(e.target.checked);

  const {
    state: { selectedJob, goal, currentJobRole, interestedJobs },
    dispatch: skillsDispatch,
  } = useContext(SkillsContext);
  const { refinements } = useContext(SearchContext);
  const { skill_names: skills, name: jobs, current_job: currentJob } = refinements;
  const { enterpriseConfig } = useContext(AppContext);

  const history = useHistory();

  const goalExceptImproveAndJobSelected = checkValidGoalAndJobSelected(goal, jobs, false);
  const improveGoalAndCurrentJobSelected = checkValidGoalAndJobSelected(goal, currentJob, true);
  const canContinueToRecommendedCourses = goalExceptImproveAndJobSelected || improveGoalAndCurrentJobSelected;

  const closeSkillsQuiz = () => {
    history.push(`/${enterpriseConfig.slug}/search`);
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
      'edx.ui.enterprise.learner_portal.skills_quiz.done.clicked',
      { userId, enterprise: enterpriseConfig.slug },
    );
  };

  const selectedSkills = useMemo(
    () => skills?.map(skill => ({ title: skill, metadata: { title: skill } })) || [],
    [skills],
  );

  const flipToRecommendedCourses = () => {
    saveSkillsGoalsAndJobsUserSelected(goal, skills, currentJobRole, interestedJobs);
    // show  courses if learner has selected skills or jobs.
    if (goalExceptImproveAndJobSelected) {
      // verify if selectedJob is still checked and within first 3 jobs else
      // set first job as selected by default to show courses.
      if (jobs?.length > 0 && ((selectedJob && !jobs?.includes(selectedJob)) || !selectedJob)) {
        sendEnterpriseTrackEvent(
          enterpriseConfig.uuid,
          'edx.ui.enterprise.learner_portal.skills_quiz.continue.clicked',
          { userId, enterprise: enterpriseConfig.slug, selectedJob: jobs[0] },
        );
        skillsDispatch({
          type: SET_KEY_VALUE,
          key: 'selectedJob',
          value: jobs[0],
        });
      }
      setCurrentStep(STEP2);
    } else if (improveGoalAndCurrentJobSelected) {
      sendEnterpriseTrackEvent(
        enterpriseConfig.uuid,
        'edx.ui.enterprise.learner_portal.skills_quiz.continue.clicked',
        { userId, enterprise: enterpriseConfig.slug, selectedJob: currentJob[0] },
      );
      skillsDispatch({
        type: SET_KEY_VALUE,
        key: 'selectedJob',
        value: currentJob[0],
      });
      setCurrentStep(STEP2);
    }
  };

  useEffect(() => {
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
      'edx.ui.enterprise.learner_portal.skills_quiz.started',
      { userId, enterprise: enterpriseConfig.slug },
    );
  }, [enterpriseConfig.slug, enterpriseConfig.uuid, userId]);

  const [skillsVisible, setSkillsVisible] = useState(false);

  useEffect(() => {
    if (goal !== GOAL_DROPDOWN_DEFAULT_OPTION) {
      setSkillsVisible(true);
    }

    if (goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE) {
      setIsStudentChecked(false);
    }
  }, [goal]);

  // will be true if goal or skills changed not because of first render, if link shared and there are more than one
  // selected skills, or if skillsVisible variable is ever been true for once.
  const [jobsDropdownsVisible, setJobsDropdownsVisible] = useState(false);

  useEffect(() => {
    if (skillsVisible) {
      setJobsDropdownsVisible(true);
    } else {
      setJobsDropdownsVisible(false);
    }
  }, [skillsVisible, selectedSkills]);

  useEffect(() => {
    const fetchLearnerCourseEnrollments = async () => {
      try {
        const response = await fetchCourseEnrollments();
        const enrolledCourses = camelCaseObject(response.data);
        const enrolledCourseIds = enrolledCourses.map((course) => course.courseDetails.courseId);
        skillsDispatch({
          type: SET_KEY_VALUE,
          key: 'enrolledCourseIds',
          value: enrolledCourseIds,
        });
      } catch (error) {
        logError(error);
      }
    };

    fetchLearnerCourseEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stepper activeKey={currentStep}>
      <ModalDialog
        title="Skills Quiz"
        size="fullscreen"
        className="bg-light-200 skills-quiz-modal"
        isOpen
        onClose={closeSkillsQuiz}
      >
        <ModalDialog.Hero className="bg-img">
          <ModalDialog.Hero.Background
            backgroundSrc={headerImage}
          />
          <ModalDialog.Hero.Content style={{ maxWidth: '15rem' }}>
            <SkillsQuizHeader />
          </ModalDialog.Hero.Content>
        </ModalDialog.Hero>
        <ModalDialog.Body>
          <Container size="lg">
            <Stepper.Step eventKey="skills-search" title="Skills Search">
              <div className="skills-quiz-dropdown my-4">
                <p>
                  {SKILLS_QUIZ_SEARCH_PAGE_MESSAGE}
                </p>
                <p className="mt-4.5">
                  First, tell us a bit more about what you want to achieve.
                </p>
                <div className="mt-2">
                  <GoalDropdown />
                </div>
                {jobsDropdownsVisible && (
                  <div>
                    <InstantSearch
                      indexName={config.ALGOLIA_INDEX_NAME_JOBS}
                      searchClient={searchClient}
                    >
                      <div className="mt-4.5">
                        Second, which industry describes where you work? (select one, or leave blank)
                      </div>
                      <div className="col col-8 p-0 mt-3">
                        <IndustryDropdown />
                      </div>

                      <div className="mt-2">
                        <p className="mt-4.5">
                          Next, tell us about your current job title.
                        </p>
                        <CurrentJobDropdown />
                        <Form.Checkbox
                          checked={isStudentChecked}
                          onChange={handleIsStudentCheckedChange}
                          disabled={goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE}
                          data-testid="is-student-checkbox"
                        >
                          I am currently a student
                        </Form.Checkbox>
                      </div>

                      <div>
                        {goal !== DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE
                          ? (
                            <>
                              <p className="mt-4.5">
                                Lastly, tell us about career paths you&apos;re interested in (select up to three)
                              </p>
                              <div className="mt-2">
                                <SearchJobDropdown />
                              </div>
                            </>
                          ) : null }
                      </div>
                    </InstantSearch>
                  </div>
                )}
                {jobsDropdownsVisible && (
                  <>
                    {goalExceptImproveAndJobSelected
                      ? <SearchJobCard index={jobIndex} /> : null }
                    {improveGoalAndCurrentJobSelected
                      ? <SearchCurrentJobCard index={jobIndex} /> : null }
                  </>
                )}
              </div>
            </Stepper.Step>
            <Stepper.Step eventKey="courses-with-jobs" title="Recommended Courses With Jobs">
              <div>
                <div className="row mb-4 pl-2 mt-4">
                  <h2>Start Exploring Courses!</h2>
                </div>
                <div className="search-job-card">
                  {canContinueToRecommendedCourses ? <SelectJobCard /> : null}
                </div>
                <TopSkillsOverview index={jobIndex} />
                <div>
                  {(selectedJob || skills || goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE) && (
                    <Stack gap={4}>
                      <SearchCourseCard index={courseIndex} />
                      <SearchProgramCard index={courseIndex} />
                      <SearchPathways index={courseIndex} />
                    </Stack>
                  )}
                </div>
              </div>
              <div className="text-center py-4">
                <Button variant="outline-primary" onClick={() => setCurrentStep(STEP3)}>
                  See more course recommendations
                </Button>
              </div>
            </Stepper.Step>
            <Stepper.Step eventKey="courses-with-skills" title="Recommended Courses With Skills">
              <SkillsCourses index={courseIndex} />
            </Stepper.Step>
          </Container>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Stepper.ActionRow eventKey="skills-search">
            <Button variant="outline-primary" onClick={() => closeSkillsQuiz()}>
              Cancel
            </Button>
            <Stepper.ActionRow.Spacer />
            <Button
              disabled={!canContinueToRecommendedCourses}
              onClick={() => flipToRecommendedCourses()}
            >
              Continue
            </Button>
          </Stepper.ActionRow>
          <Stepper.ActionRow eventKey="courses-with-jobs">
            <Button variant="outline-primary" onClick={() => setCurrentStep(STEP1)}>
              Go back
            </Button>
            <Stepper.ActionRow.Spacer />
            <Button onClick={() => setCurrentStep(STEP3)}>Continue</Button>
          </Stepper.ActionRow>
          <Stepper.ActionRow eventKey="courses-with-skills">
            <Button variant="outline-primary" onClick={() => setCurrentStep(STEP2)}>
              Go back
            </Button>
            <Stepper.ActionRow.Spacer />
            <Button onClick={() => closeSkillsQuiz()}>Done</Button>
          </Stepper.ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </Stepper>
  );
};

export default SkillsQuizStepper;
