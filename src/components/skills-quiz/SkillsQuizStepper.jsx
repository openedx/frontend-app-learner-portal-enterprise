import React, { useState } from 'react';
import {
  Button, Stepper, FullscreenModal, Container,
} from '@edx/paragon';

import GoalDropdown from './GoalDropdown';
import SearchJobDropdown from './SearchJobDropdown';
import SearchResults from './SearchResults';
import { DROPDOWN_OPTION_CHANGE_ROLE } from './constants';

const SkillsQuizStepper = () => {
  const steps = ['skills-search', 'review'];
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const [showSearchJobsAndSearchResults, setShowSearchJobsAndSearchResults] = useState(true);
  const handleGoalOptionChange = (selectedGoalOption) => {
    setShowSearchJobsAndSearchResults(selectedGoalOption !== DROPDOWN_OPTION_CHANGE_ROLE);
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
