import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Button, Container, Form, ModalDialog, Stack, Stepper,
} from '@openedx/paragon';
import { InstantSearch } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import algoliasearch from 'algoliasearch/lite';
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
  DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE, GOAL_DROPDOWN_DEFAULT_OPTION, STEP1, STEP2, STEP3,
} from './constants';
import { SkillsContext } from './SkillsContextProvider';
import { SET_KEY_VALUE } from './data/constants';
import { checkValidGoalAndJobSelected } from '../utils/skills-quiz';
import TopSkillsOverview from './TopSkillsOverview';
import SkillsQuizHeader from './SkillsQuizHeader';

import headerImage from './images/headerImage.png';
import { saveSkillsGoalsAndJobsUserSelected } from './data/utils';
import { fetchCourseEnrollments } from './data/service';
import { useEnterpriseCustomer } from '../app/data';

const SkillsQuizStepper = ({ isStyleAutoSuggest }) => {
  const config = getConfig();

  const [searchClient, courseIndex, jobIndex] = useMemo(() => {
    const client = algoliasearch(
      config.ALGOLIA_APP_ID,
      config.ALGOLIA_SEARCH_API_KEY,
    );
    const cIndex = client.initIndex(config.ALGOLIA_INDEX_NAME);
    const jIndex = client.initIndex(config.ALGOLIA_INDEX_NAME_JOBS);
    return [client, cIndex, jIndex];
  }, [
    config.ALGOLIA_APP_ID,
    config.ALGOLIA_INDEX_NAME,
    config.ALGOLIA_INDEX_NAME_JOBS,
    config.ALGOLIA_SEARCH_API_KEY,
  ]);

  const [currentStep, setCurrentStep] = useState(STEP1);
  const [isStudentChecked, setIsStudentChecked] = useState(false);
  const handleIsStudentCheckedChange = (e) => setIsStudentChecked(e.target.checked);

  const {
    state: {
      selectedJob, goal, currentJobRole, interestedJobs,
    },
    dispatch: skillsDispatch,
  } = useContext(SkillsContext);
  const { refinements } = useContext(SearchContext);
  const { name: jobs, current_job: currentJob } = refinements;
  const { authenticatedUser: { userId } } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  const navigate = useNavigate();

  const goalNotDefault = goal !== GOAL_DROPDOWN_DEFAULT_OPTION;
  const goalExceptImproveAndJobSelected = goalNotDefault && checkValidGoalAndJobSelected(goal, jobs, false);
  const improveGoalAndCurrentJobSelected = goalNotDefault && checkValidGoalAndJobSelected(goal, currentJob, true);
  const canContinueToRecommendedCourses = goalExceptImproveAndJobSelected || improveGoalAndCurrentJobSelected;

  const closeSkillsQuiz = () => {
    navigate(`/${enterpriseCustomer.slug}/search`);
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.skills_quiz.done.clicked',
      { userId, enterprise: enterpriseCustomer.slug },
    );
  };

  const flipToRecommendedCourses = () => {
    saveSkillsGoalsAndJobsUserSelected(goal, currentJobRole, interestedJobs);
    // show  courses if learner has selected skills or jobs.
    if (goalExceptImproveAndJobSelected) {
      // verify if selectedJob is still checked and within first 3 jobs else
      // set first job as selected by default to show courses.
      if (
        jobs?.length > 0
        && ((selectedJob && !jobs?.includes(selectedJob)) || !selectedJob)
      ) {
        sendEnterpriseTrackEvent(
          enterpriseCustomer.uuid,
          'edx.ui.enterprise.learner_portal.skills_quiz.continue.clicked',
          { userId, enterprise: enterpriseCustomer.slug, selectedJob: jobs[0] },
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
        enterpriseCustomer.uuid,
        'edx.ui.enterprise.learner_portal.skills_quiz.continue.clicked',
        {
          userId,
          enterprise: enterpriseCustomer.slug,
          selectedJob: currentJob[0],
        },
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
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.skills_quiz.started',
      { userId, enterprise: enterpriseCustomer.slug },
    );
  }, [enterpriseCustomer.slug, enterpriseCustomer.uuid, userId]);

  // will be true if goal changed not because of first render.
  const [
    industryAndJobsDropdownsVisible,
    setIndustryAndJobsDropdownsVisible,
  ] = useState(false);

  useEffect(() => {
    if (goal !== GOAL_DROPDOWN_DEFAULT_OPTION) {
      setIndustryAndJobsDropdownsVisible(true);
    } else {
      if (goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE) {
        setIsStudentChecked(false);
      }
      setIndustryAndJobsDropdownsVisible(false);
    }
  }, [goal]);

  useEffect(() => {
    const fetchLearnerCourseEnrollments = async () => {
      try {
        const response = await fetchCourseEnrollments();
        const enrolledCourses = camelCaseObject(response.data);
        const enrolledCourseIds = enrolledCourses.map(
          (course) => course.courseDetails.courseId,
        );
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
          <ModalDialog.Hero.Background backgroundSrc={headerImage} />
          <ModalDialog.Hero.Content style={{ maxWidth: '15rem' }}>
            <SkillsQuizHeader />
          </ModalDialog.Hero.Content>
        </ModalDialog.Hero>
        <ModalDialog.Body>
          <Container size="lg">
            <Stepper.Step eventKey="skills-search" title="Skills Search">
              <div className="skills-quiz-dropdown my-4">
                <p>
                  <FormattedMessage
                    id="enterprise.skills.quiz.v1.skills.search.heading"
                    defaultMessage="Let edX be your guide. We combine the educational expertise of the world's leading institutions with labor market data to find the right course(s) and program(s) to help you reach your learning and professional goals."
                    description="Skills search heading on skills quiz v1 page"
                  />
                </p>
                <p className="mt-4.5">
                  <FormattedMessage
                    id="enterprise.skills.quiz.v1.goal.selection.label"
                    defaultMessage="First, tell us a bit more about what you want to achieve."
                    description="Goal selection label prompting the user to select their goal on the skills quiz v1 page."
                  />
                </p>
                <div className="mt-2">
                  <GoalDropdown />
                </div>
                {industryAndJobsDropdownsVisible && (
                  <div>
                    <InstantSearch
                      indexName={config.ALGOLIA_INDEX_NAME_JOBS}
                      searchClient={searchClient}
                    >
                      <div className="mt-4.5">
                        <FormattedMessage
                          id="enterprise.skills.quiz.v1.industry.selection.label"
                          defaultMessage="Second, which industry describes where you work? (select one, or leave blank)"
                          description="Industry selection label for industry dropdown, prompting the user to select their relevant industry on the skills quiz v1 page. Indicates that the user should either select one option from the dropdown or leave it blank."
                        />
                      </div>
                      <div className="col col-8 p-0 mt-3">
                        <IndustryDropdown
                          isStyleAutoSuggest={isStyleAutoSuggest}
                        />
                      </div>

                      <p className="mt-4.5">
                        <FormattedMessage
                          id="enterprise.skills.quiz.v1.current.job.title"
                          defaultMessage="Next, tell us about your current job title."
                          description="Label for current job title dropdown on the skills quiz v1 page."
                        />
                      </p>
                      <div className="col col-8 p-0 mt-3">
                        <CurrentJobDropdown
                          isStyleAutoSuggest={isStyleAutoSuggest}
                        />
                        <Form.Checkbox
                          checked={isStudentChecked}
                          onChange={handleIsStudentCheckedChange}
                          disabled={
                            goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE
                          }
                          data-testid="is-student-checkbox"
                        >
                          <FormattedMessage
                            id="enterprise.skills.quiz.v1.currently.a.student.label"
                            defaultMessage="I am currently a student"
                            description="Label indicating that the user is currently a student on the skills quiz v1 page."
                          />
                        </Form.Checkbox>
                      </div>

                      <div>
                        {goal !== DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE ? (
                          <>
                            <p className="mt-4.5">
                              <FormattedMessage
                                id="enterprise.skills.quiz.v1.similar.career.paths"
                                defaultMessage="Lastly, tell us about career paths you're interested in (select up to three)"
                                description="Label for career paths dropdown, prompting the user to select up to three similar career paths on the skills quiz v1 page."
                              />
                            </p>
                            <div className="col col-8 p-0 mt-3">
                              <SearchJobDropdown
                                isChip
                                isStyleAutoSuggest={isStyleAutoSuggest}
                              />
                            </div>
                          </>
                        ) : null}
                      </div>
                    </InstantSearch>
                  </div>
                )}
                {industryAndJobsDropdownsVisible && (
                  <>
                    {goalExceptImproveAndJobSelected ? (
                      <SearchJobCard index={jobIndex} />
                    ) : null}
                    {improveGoalAndCurrentJobSelected ? (
                      <SearchCurrentJobCard index={jobIndex} />
                    ) : null}
                  </>
                )}
              </div>
            </Stepper.Step>
            <Stepper.Step
              eventKey="courses-with-jobs"
              title="Recommended Courses With Jobs"
            >
              <div>
                <div className="row mb-4 pl-2 mt-4">
                  <h2>
                    <FormattedMessage
                      id="enterprise.skills.quiz.v1.explore.courses.label"
                      defaultMessage="Start Exploring Courses!"
                      description="Label to start exploring available courses on the skills quiz v1 page."
                    />
                  </h2>
                </div>
                <div className="search-job-card">
                  {canContinueToRecommendedCourses ? <SelectJobCard /> : null}
                </div>
                <TopSkillsOverview index={jobIndex} />
                <div>
                  {(selectedJob
                    || goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE) && (
                    <Stack gap={4}>
                      <SearchCourseCard index={courseIndex} />
                      <SearchProgramCard index={courseIndex} />
                      <SearchPathways index={courseIndex} />
                    </Stack>
                  )}
                </div>
              </div>
              <div className="text-center py-4">
                <Button
                  variant="outline-primary"
                  onClick={() => setCurrentStep(STEP3)}
                >
                  <FormattedMessage
                    id="enterprise.skills.quiz.v1.see.more.recommendations.label"
                    defaultMessage="See more course recommendations"
                    description="Redirect label to see more course recommendations that will redirect the user to the courses page, on the skills quiz v1."
                  />
                </Button>
              </div>
            </Stepper.Step>
            <Stepper.Step
              eventKey="courses-with-skills"
              title="Recommended Courses With Skills"
            >
              <SkillsCourses index={courseIndex} />
            </Stepper.Step>
          </Container>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Stepper.ActionRow eventKey="skills-search">
            <Button variant="outline-primary" onClick={() => closeSkillsQuiz()}>
              <FormattedMessage
                id="enterprise.skills.quiz.v1.cancel.button.label"
                defaultMessage="Cancel"
                description="Button text for cancel button that closes the skills builder, on the skills quiz v1 page."
              />
            </Button>
            <Stepper.ActionRow.Spacer />
            <Button
              disabled={!canContinueToRecommendedCourses}
              onClick={() => flipToRecommendedCourses()}
            >
              <FormattedMessage
                id="enterprise.skills.quiz.v1.continue.button.label1"
                defaultMessage="Continue"
                description="Button text for continue button that takes the user towards the recommended courses page, on the skills quiz v1."
              />
            </Button>
          </Stepper.ActionRow>
          <Stepper.ActionRow eventKey="courses-with-jobs">
            <Button
              variant="outline-primary"
              onClick={() => setCurrentStep(STEP1)}
            >
              Go back
            </Button>
            <Stepper.ActionRow.Spacer />
            <Button data-testid="skills-continue-button" onClick={() => setCurrentStep(STEP3)}>
              <FormattedMessage
                id="enterprise.skills.quiz.v1.continue.button.label2"
                defaultMessage="Continue"
                description="Button text for continue button that takes the user to the courses page, on the skills quiz v1."
              />
            </Button>
          </Stepper.ActionRow>
          <Stepper.ActionRow eventKey="courses-with-skills">
            <Button
              variant="outline-primary"
              onClick={() => setCurrentStep(STEP2)}
            >
              Go back
            </Button>
            <Stepper.ActionRow.Spacer />
            <Button onClick={() => closeSkillsQuiz()}>
              <FormattedMessage
                id="enterprise.skills.quiz.v1.done.button.label"
                defaultMessage="Done"
                description="Button text for done button that closes the skills builder upon clicking, on the skills quiz v1 page."
              />
            </Button>
          </Stepper.ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </Stepper>
  );
};

SkillsQuizStepper.propTypes = {
  isStyleAutoSuggest: PropTypes.bool,
};

SkillsQuizStepper.defaultProps = {
  isStyleAutoSuggest: false,
};

export default SkillsQuizStepper;
