import React, { useState, useContext, useMemo } from 'react';
import {
  Button, Stepper, FullscreenModal, Container,
} from '@edx/paragon';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';
import { NUM_RESULTS_PER_PAGE } from '../search/constants';

import GoalDropdown from './GoalDropdown';
import SearchJobDropdown from './SearchJobDropdown';
import SearchResults from './SearchResults';
import { DROPDOWN_OPTION_CHANGE_ROLE, SKILLS_QUIZ_FACET_FILTERS } from './constants';

const SkillsQuizStepper = () => {
  const config = getConfig();
  const searchClient = algoliasearch(
    config.ALGOLIA_APP_ID,
    config.ALGOLIA_SEARCH_API_KEY,
  );
  const steps = ['skills-search', 'review'];
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const [showSearchJobsAndSearchResults, setShowSearchJobsAndSearchResults] = useState(true);
  const handleGoalOptionChange = (selectedGoalOption) => {
    setShowSearchJobsAndSearchResults(selectedGoalOption !== DROPDOWN_OPTION_CHANGE_ROLE);
  };

  const { refinementsFromQueryParams } = useContext(SearchContext);
  const skillQuizFacets = useMemo(
    () => {
      const filtersFromRefinements = SKILLS_QUIZ_FACET_FILTERS.map(({
        title, attribute, typeaheadOptions,
      }) => (
        <FacetListRefinement
          key={attribute}
          title={title}
          attribute={attribute}
          limit={300} // this is replicating the B2C search experience
          refinementsFromQueryParams={refinementsFromQueryParams}
          defaultRefinement={refinementsFromQueryParams[attribute]}
          facetValueType="array"
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
    [refinementsFromQueryParams],
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
                <Button onClick={() => setCurrentStep('review')}>Continue</Button>
              </Stepper.ActionRow>
              <Stepper.ActionRow eventKey="review">
                <Button variant="outline-primary" onClick={() => setCurrentStep('skills-search')}>
                  Go Back
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
              <GoalDropdown handleGoalOptionChange={handleGoalOptionChange} />
              { showSearchJobsAndSearchResults ? <SearchJobDropdown /> : null }
              { showSearchJobsAndSearchResults ? <SearchResults /> : null }
              <InstantSearch
                indexName={config.ALGOLIA_INDEX_NAME}
                searchClient={searchClient}
              >
                <Configure hitsPerPage={NUM_RESULTS_PER_PAGE} />
                {skillQuizFacets}
              </InstantSearch>
            </Stepper.Step>
            <Stepper.Step eventKey="review" title="Review Skills">
              <div className="row justify-content-center">
                <h2>Review!</h2>
              </div>
              <p>
                Skills Review Page.
              </p>
            </Stepper.Step>
          </Container>
        </FullscreenModal>
      </Stepper>
    </>
  );
};

export default SkillsQuizStepper;
