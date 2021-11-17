/* eslint-disable no-console */
/* eslint-disable object-curly-newline */
import React, { useEffect, useState, useContext, useMemo } from 'react';
import {
  Button, Stepper, FullscreenModal, Container,
} from '@edx/paragon';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { SearchContext, removeFromRefinementArray, deleteRefinementAction } from '@edx/frontend-enterprise-catalog-search';
import { useHistory } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent, useIsFirstRender } from '@edx/frontend-enterprise-utils';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import GoalDropdown from './GoalDropdown';
import SearchJobDropdown from './SearchJobDropdown';
import CurrentJobDropdown from './CurrentJobDropdown';
import SkillsDropDown from './SkillsDropDown';
import SearchJobCard from './SearchJobCard';
import SearchCurrentJobCard from './SearchCurrentJobCard';
import SearchCourseCard from './SearchCourseCard';
import SelectJobCard from './SelectJobCard';
import TagCloud from '../TagCloud';

import { fixedEncodeURIComponent } from '../../utils/common';
import { useSelectedSkillsAndJobSkills } from './data/hooks';
import {
  DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE, STEP1, STEP2,
} from './constants';
import { SkillsContext } from './SkillsContextProvider';
import { SET_KEY_VALUE } from './data/constants';
import { checkValidGoalAndJobSelected } from '../utils/skills-quiz';
import SkillsQuizImg from './images/skills-quiz.png';

const SkillsQuizStepper = () => {
  const config = getConfig();
  const { userId } = getAuthenticatedUser();
  const isFirstRender = useIsFirstRender();
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
    [], // only initialized once
  );
  const [currentStep, setCurrentStep] = useState(STEP1);

  const { state, dispatch: skillsDispatch } = useContext(SkillsContext);
  const { selectedJob, goal } = state;
  const { refinements, dispatch } = useContext(SearchContext);
  const { skill_names: skills, name: jobs, current_job: currentJob } = refinements;
  const { enterpriseConfig } = useContext(AppContext);
  const history = useHistory();
  const selectedSkillsAndJobSkills = useSelectedSkillsAndJobSkills({ getAllSkills: true });
  const getQueryParamString = () => {
    if (selectedSkillsAndJobSkills) {
      const queryParams = selectedSkillsAndJobSkills.map((skill) => `skill_names=${ fixedEncodeURIComponent(skill)}`);
      return queryParams.join('&');
    }
    return '';
  };

  const goalExceptImproveAndJobSelected = checkValidGoalAndJobSelected(goal, jobs, false);
  const improveGoalAndCurrentJobSelected = checkValidGoalAndJobSelected(goal, currentJob, true);
  const canContinueToRecommendedCourses = goalExceptImproveAndJobSelected || improveGoalAndCurrentJobSelected;
  const handleSeeMoreButtonClick = () => {
    const queryString = getQueryParamString();
    const ENT_PATH = `/${enterpriseConfig.slug}`;
    let SEARCH_PATH = queryString ? `${ENT_PATH}/search?${queryString}` : `${ENT_PATH}/search`;
    SEARCH_PATH = SEARCH_PATH.replace(/\/\/+/g, '/'); // to remove duplicate slashes that can occur
    history.push(SEARCH_PATH);
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
      'edx.ui.enterprise.learner_portal.skills_quiz.see_more_courses.clicked',
      { userId, enterprise: enterpriseConfig.slug },
    );
  };

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
  }, []);

  // will be true if goal or skills changed not because of first render, if link shared and there are more than one
  // selected skills, or if skillsVisible variable is ever been true for once.
  const skillsVisible = useMemo(() => (!isFirstRender || skillsVisible || (selectedSkills?.length > 0)),
    [goal, selectedSkills]);
  const jobsDropdownsVisible = useMemo(() => !isFirstRender, [skills]);

  return (
    <>
      <Stepper activeKey={currentStep}>
        <FullscreenModal
          title="Skills Quiz"
          className="bg-light-200"
          isOpen
          onClose={() => closeSkillsQuiz()}
          beforeBodyNode={<Stepper.Header className="border-bottom border-light" />}
          footerNode={(
            <>
              <Stepper.ActionRow eventKey="skills-search">
                <Button variant="outline-primary" onClick={() => closeSkillsQuiz()}>
                  Cancel
                </Button>
                <Stepper.ActionRow.Spacer />
                <Button
                  disabled={!canContinueToRecommendedCourses}
                  onClick={() => flipToRecommendedCourses()}
                >Continue
                </Button>
              </Stepper.ActionRow>
              <Stepper.ActionRow eventKey="review">
                <Button variant="outline-primary" onClick={() => setCurrentStep(STEP1)}>
                  Go back
                </Button>
                <Stepper.ActionRow.Spacer />
                <Button onClick={() => closeSkillsQuiz()}>Done</Button>
              </Stepper.ActionRow>
            </>
          )}
        >
          <Container size="lg">
            <Stepper.Step eventKey="skills-search" title="Skills Search">

              <div className="row skills-quiz-dropdown">
                <div className="col col-8">
                  <h2>Looking for something?</h2>
                  <p>
                    edX is here to help you find the course(s) and program(s) to help you take the next step in
                    your career. To get started, tell us a bit about your learning goals.
                  </p>
                  <GoalDropdown />
                  {
                    skillsVisible && (
                      <InstantSearch
                        indexName={config.ALGOLIA_INDEX_NAME}
                        searchClient={searchClient}
                      >
                        <div className="skills-drop-down">
                          <div className="mt-4.5">
                            Next, select at least 1 (one) skill you&apos;re interested in learning or are
                            relevant to your goals.
                          </div>
                          <SkillsDropDown />
                        </div>
                      </InstantSearch>
                    )
                  }

                  { skillsVisible && (
                    <TagCloud
                      tags={selectedSkills}
                      onRemove={
                        (skillMetadata) => {
                          if (selectedSkills.length > 1) {
                            dispatch(removeFromRefinementArray('skill_names', skillMetadata.title));
                          } else {
                            dispatch(deleteRefinementAction('skill_names'));
                          }
                        }
                      }
                    />
                  )}
                  {
                    jobsDropdownsVisible && (
                      <div>
                        <div className="mt-4.5 mb-3">
                          Finally, tell us about your current job and select at least 1 (one) job you&apos;re interested
                          in. if you&apos;re a student, you can leave the &quot;Current job title&quot; field blank.
                        </div>
                        <InstantSearch
                          indexName={config.ALGOLIA_INDEX_NAME_JOBS}
                          searchClient={searchClient}
                        >
                          <CurrentJobDropdown />
                          { goal !== DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE ? <div className="mt-4.5"><SearchJobDropdown /></div> : null }
                        </InstantSearch>
                      </div>
                    )
                  }

                </div>
                <div className="col-4">
                  <img className="side-image" src={SkillsQuizImg} alt="skills quiz preview" />
                </div>

                {
                  jobsDropdownsVisible && (
                    <div className="col-12 mt-4">
                      { goalExceptImproveAndJobSelected
                        ? <SearchJobCard index={jobIndex} /> : null }
                      { improveGoalAndCurrentJobSelected
                        ? <SearchCurrentJobCard index={jobIndex} /> : null }
                    </div>
                  )
                }
              </div>
            </Stepper.Step>
            <Stepper.Step eventKey="review" title="Review Skills">
              <div className="row justify-content-center">
                <h2>Review!</h2>
              </div>
              <div className="search-job-card mb-3">
                { canContinueToRecommendedCourses ? <SelectJobCard /> : null}
              </div>
              <div>
                { (selectedJob || skills || goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE)
                    && <SearchCourseCard index={courseIndex} /> }
              </div>
              <div className="row justify-content-center">
                <Button variant="outline-primary" onClick={handleSeeMoreButtonClick}>See more courses</Button>
              </div>
            </Stepper.Step>
          </Container>
        </FullscreenModal>
      </Stepper>
    </>
  );
};

export default SkillsQuizStepper;
