/* eslint-disable no-console */
import React, { useState, useContext, useMemo } from 'react';
import {
  Button, Stepper, FullscreenModal, Container,
} from '@edx/paragon';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { SearchContext, removeFromRefinementArray, deleteRefinementAction } from '@edx/frontend-enterprise-catalog-search';
import { useHistory } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import GoalDropdown from './GoalDropdown';
import SearchJobDropdown from './SearchJobDropdown';
import CurrentJobDropdown from './CurrentJobDropdown';
import SkillsDropDown from './SkillsDropDown';
import SearchJobCard from './SearchJobCard';
import SearchCourseCard from './SearchCourseCard';
import SelectJobCard from './SelectJobCard';
import TagCloud from '../TagCloud';

import { fixedEncodeURIComponent } from '../../utils/common';
import { useSelectedSkillsAndJobSkills } from './data/hooks';
import {
  DROPDOWN_OPTION_CHANGE_ROLE, STEP1, STEP2,
} from './constants';
import { SkillsContext } from './SkillsContextProvider';
import { SET_KEY_VALUE } from './data/constants';

const SkillsQuizStepper = () => {
  const config = getConfig();
  const searchClient = algoliasearch(
    config.ALGOLIA_APP_ID,
    config.ALGOLIA_SEARCH_API_KEY,
  );
  const courseIndex = searchClient.initIndex(config.ALGOLIA_INDEX_NAME);
  const jobIndex = searchClient.initIndex(config.ALGOLIA_INDEX_NAME_JOBS);
  const [currentStep, setCurrentStep] = useState(STEP1);

  const { state, dispatch: skillsDispatch } = useContext(SkillsContext);
  const { selectedJob, goal } = state;
  const { refinements, dispatch } = useContext(SearchContext);
  const { skill_names: skills, name: jobs } = refinements;
  const { enterpriseConfig } = useContext(AppContext);
  const history = useHistory();
  const selectedSkillsAndJobSkills = useSelectedSkillsAndJobSkills();

  const getQueryParamString = () => {
    if (selectedSkillsAndJobSkills) {
      const queryParams = selectedSkillsAndJobSkills.map((skill) => `skill_names=${ fixedEncodeURIComponent(skill)}`);
      return queryParams.join('&');
    }
    return '';
  };

  const handleSeeMoreButtonClick = () => {
    const queryString = getQueryParamString();
    const ENT_PATH = `/${enterpriseConfig.slug}`;
    let SEARCH_PATH = queryString ? `${ENT_PATH}/search?${queryString}` : `${ENT_PATH}/search`;
    SEARCH_PATH = SEARCH_PATH.replace(/\/\/+/g, '/'); // to remove duplicate slashes that can occur
    history.push(SEARCH_PATH);
  };

  const selectedSkills = useMemo(
    () => skills?.map(skill => ({ title: skill, metadata: { title: skill } })) || [],
    [JSON.stringify(refinements)],
  );

  const flipToRecommendedCourses = () => {
    // show  courses if learner has selected skills or jobs.
    if (skills?.length > 0 || (goal !== DROPDOWN_OPTION_CHANGE_ROLE && (jobs?.length > 0))) {
      // verify if selectedJob is still checked and within first 3 jobs else
      // set first job as selected by default to show courses.
      if ((selectedJob && !jobs?.includes(selectedJob)) || !selectedJob) {
        skillsDispatch({
          type: SET_KEY_VALUE,
          key: 'selectedJob',
          value: jobs[0],
        });
      }
      setCurrentStep(STEP2);
    }
  };

  return (
    <>
      <Stepper activeKey={currentStep}>
        <FullscreenModal
          title="Skills Quiz"
          className="bg-light-200"
          isOpen
          onClose={() => console.log('Skills quiz closed.')}
          beforeBodyNode={<Stepper.Header className="border-bottom border-light" />}
          footerNode={(
            <>
              <Stepper.ActionRow eventKey="skills-search">
                <Button variant="outline-primary" onClick={() => console.log('Skills quiz closed.')}>
                  Cancel
                </Button>
                <Stepper.ActionRow.Spacer />
                <Button onClick={() => flipToRecommendedCourses()}>Continue</Button>
              </Stepper.ActionRow>
              <Stepper.ActionRow eventKey="review">
                <Button variant="outline-primary" onClick={() => setCurrentStep(STEP1)}>
                  Go back
                </Button>
                <Stepper.ActionRow.Spacer />
                <Button onClick={() => console.log('Skills quiz completed.')}>Done</Button>
              </Stepper.ActionRow>
            </>
          )}
        >
          <Container size="md">
            <Stepper.Step eventKey="skills-search" title="Skills Search">
              <div className="row justify-content-center">
                <h2>Skills Search</h2>
              </div>

              <p>
                edX is here to help you find the course(s) or program(s) to help you take the next step in your career.
                Tell us a bit about your current role, and skills or jobs you&apos;re interested in.
              </p>
              <div className="row skils-quiz-dropdown">
                <div className="col col-6">
                  <GoalDropdown />
                  <InstantSearch
                    indexName={config.ALGOLIA_INDEX_NAME}
                    searchClient={searchClient}
                  >
                    <div className="skills-drop-down">
                      <SkillsDropDown />
                    </div>
                  </InstantSearch>
                  { selectedSkills.length > 0 && (
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
                </div>
                <div className="col col-6">
                  <InstantSearch
                    indexName={config.ALGOLIA_INDEX_NAME_JOBS}
                    searchClient={searchClient}
                  >
                    <CurrentJobDropdown />
                    { goal !== DROPDOWN_OPTION_CHANGE_ROLE ? <SearchJobDropdown /> : null }
                  </InstantSearch>
                  { (goal !== DROPDOWN_OPTION_CHANGE_ROLE && (jobs?.length > 0))
                    ? <SearchJobCard index={jobIndex} /> : null }
                </div>
              </div>
            </Stepper.Step>
            <Stepper.Step eventKey="review" title="Review Skills">
              <div className="row justify-content-center">
                <h2>Review!</h2>
              </div>
              <div className="search-job-card mb-3">
                {(goal !== DROPDOWN_OPTION_CHANGE_ROLE && (jobs?.length > 0)) ? <SelectJobCard /> : null}
              </div>
              <div>
                { (selectedJob || skills || goal === DROPDOWN_OPTION_CHANGE_ROLE)
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
