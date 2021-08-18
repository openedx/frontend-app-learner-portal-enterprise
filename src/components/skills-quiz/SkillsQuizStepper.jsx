/* eslint-disable no-console */
import React, { useState, useContext, useMemo } from 'react';
import {
  Button, Stepper, FullscreenModal, Container,
} from '@edx/paragon';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { SearchContext, removeFromRefinementArray, deleteRefinementAction } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';
import { useHistory } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import GoalDropdown from './GoalDropdown';
import SearchJobDropdown from './SearchJobDropdown';
import SearchResults from './SearchResults';
import TagCloud from '../TagCloud';

import {
  DROPDOWN_OPTION_CHANGE_ROLE, SKILLS_QUIZ_FACET_FILTERS, STEP1, STEP2,
} from './constants';

const SkillsQuizStepper = () => {
  const config = getConfig();
  const searchClient = algoliasearch(
    config.ALGOLIA_APP_ID,
    config.ALGOLIA_SEARCH_API_KEY,
  );
  const [currentStep, setCurrentStep] = useState(STEP1);
  const [showSearchJobsAndSearchResults, setShowSearchJobsAndSearchResults] = useState(true);
  const handleGoalChange = (goal) => setShowSearchJobsAndSearchResults(goal !== DROPDOWN_OPTION_CHANGE_ROLE);

  const { refinements, dispatch } = useContext(SearchContext);
  // TODO: Change this statement to destructure jobs instead of skills once Algolia part is done.
  const { skill_names: skills } = refinements;
  const { enterpriseConfig } = useContext(AppContext);
  const history = useHistory();
  const handleSeeMoreButtonClick = () => {
    // TODO: incorporate handling of skills related to jobs as well; additionally, if there are
    // multiple skills, the URL query parameters should be denoted as `skill_names=A&skill_names=B`
    // versus `skill_names=A,B`.
    const queryString = new URLSearchParams({ skill_names: skills });
    const ENT_PATH = `/${enterpriseConfig.slug}`;
    let SEARCH_PATH = skills ? `${ENT_PATH}/search?${queryString}` : `${ENT_PATH}/search`;
    SEARCH_PATH = SEARCH_PATH.replace(/\/\/+/g, '/'); // to remove duplicate slashes that can occur
    history.push(SEARCH_PATH);
  };
  const skillQuizFacets = useMemo(
    () => {
      const filtersFromRefinements = SKILLS_QUIZ_FACET_FILTERS.map(({
        title,
        attribute,
        typeaheadOptions,
        facetValueType,
      }) => (
        <FacetListRefinement
          key={attribute}
          title={title}
          attribute={attribute}
          limit={300} // this is replicating the B2C search experience
          refinements={refinements}
          defaultRefinement={refinements[attribute]}
          facetValueType={facetValueType}
          typeaheadOptions={typeaheadOptions}
          searchable={!!typeaheadOptions}
        />
      ));
      return (
        <>
          {filtersFromRefinements}
        </>
      );
    },
    [JSON.stringify(refinements)],
  );

  const selectedSkills = useMemo(
    () => skills?.map(skill => ({ title: skill, metadata: { title: skill } })) || [],
    [JSON.stringify(refinements)],
  );

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
                <Button onClick={() => setCurrentStep(STEP2)}>Continue</Button>
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
              <GoalDropdown handleGoalOptionChange={handleGoalChange} />
              <InstantSearch
                indexName={config.ALGOLIA_INDEX_NAME}
                searchClient={searchClient}
              >
                <Configure hitsPerPage={1} />
                {skillQuizFacets}
                { showSearchJobsAndSearchResults ? <SearchJobDropdown /> : null }
                { (showSearchJobsAndSearchResults && (skills?.length > 0)) ? <SearchResults isJobResult /> : null }
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
            </Stepper.Step>
            <Stepper.Step eventKey="review" title="Review Skills">
              <div className="row justify-content-center">
                <h2>Review!</h2>
                <InstantSearch
                  indexName={config.ALGOLIA_INDEX_NAME}
                  searchClient={searchClient}
                >
                  <Configure hitsPerPage={1} />
                  { skills?.length > 0 ? <SearchResults className="select-job-results" currentStep={currentStep} isJobResult /> : null }
                </InstantSearch>

              </div>
              <InstantSearch
                indexName={config.ALGOLIA_INDEX_NAME}
                searchClient={searchClient}
              >
                <Configure hitsPerPage={3} />
                { skills?.length > 0 ? <SearchResults currentStep={currentStep} /> : null }
              </InstantSearch>
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
