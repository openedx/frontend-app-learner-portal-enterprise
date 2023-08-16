/* eslint-disable object-curly-newline */
import React, { useState, useContext } from 'react';
import {
  ModalDialog, Container, Button, SelectableBox, Chip, CardGrid,
} from '@edx/paragon';
import { useHistory } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import GoalDropdown from '../skills-quiz/GoalDropdown';
import {
  InterestedJobs,
  SKILLS_QUIZ_SEARCH_PAGE_MESSAGE_V2,
} from './constants';
import SkillsQuizHeader from './SkillsQuizHeader';

import headerImage from '../skills-quiz/images/headerImage.png';
import CourseCard from './CourseCard';
import ClosingAlert from './ClosingAlert';

const SkillsQuizV2 = () => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const { enterpriseConfig } = useContext(AppContext);
  const [value, setValue] = useState('green');
  const handleChange = (e) => setValue(e.target.value);
  const history = useHistory();
  const [showAlert, setShowAlert] = useState(false);

  const showCloseAlert = () => {
    setShowAlert(true);
  };

  const navigateToSearchPage = () => {
    history.push(`/${enterpriseConfig.slug}/search`);
  };

  const hideCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <ModalDialog
      title="Skills Quiz"
      size="fullscreen"
      className="bg-light-200 skills-quiz-modal"
      isOpen
      onClose={showCloseAlert}
    >
      <ModalDialog.Hero className="md-img">
        <ModalDialog.Hero.Background
          backgroundSrc={headerImage}
        />
        <ModalDialog.Hero.Content style={{ maxWidth: '15rem' }}>
          <SkillsQuizHeader />
        </ModalDialog.Hero.Content>
      </ModalDialog.Hero>
      <ModalDialog.Body>
        <Container size="lg">
          <div className="skills-quiz-dropdown my-4">
            <p>
              {SKILLS_QUIZ_SEARCH_PAGE_MESSAGE_V2}
            </p>
            <h5 className="mt-3.5">
              What roles are you interested in?
            </h5>
            <div className="mt-1">
              <GoalDropdown />
              <Button
                variant="link"
                className="mb-2 mb-sm-0 p-0 text-decoration-none"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                {showAdvancedOptions ? 'Hide advanced options' : 'Show advanced options'}
              </Button>
            </div>
            {showAdvancedOptions
                            && (
                              <div>
                                <h5 className="mt-3.5">
                                  Tell us about what you want to acheive
                                </h5>
                                <div className="mt-2">
                                  <GoalDropdown />
                                </div>
                                <h5 className="mt-3.5">
                                  Search and select your current job title
                                </h5>
                                <div className="mt-2">
                                  <GoalDropdown />
                                </div>
                                <h5 className="mt-3.5">
                                  What industry are you interested in?
                                </h5>
                                <div className="mt-2">
                                  <GoalDropdown />
                                </div>
                              </div>
                            )}
          </div>
          <div>
            <SelectableBox.Set
              type="radio"
              value={value}
              onChange={handleChange}
              name="interested-jobs"
              columns="3"
              className="selectable-box "
            >
              {InterestedJobs.map((job) => (
                <SelectableBox
                  className="box"
                  value={job.name}
                  inputHidden={false}
                  type="radio"
                  aria-label={job.name}
                >
                  <div>
                    <div className="lead">{job.name}</div>
                    <div className="x-small">Related skills</div>
                    {job.skills.slice(0, 5).map((skill) => (
                      <div>
                        <Chip>{skill}</Chip>
                      </div>
                    ))}
                  </div>
                </SelectableBox>
              ))}
            </SelectableBox.Set>
          </div>
          <div className="mt-3.5">
            <h4>Boot Camps for a Web technology Specialist</h4>
            <CardGrid
              columnSizes={{
                xs: 12,
                lg: 6,
                xl: 6,
              }}
            >
              <CourseCard />
              <CourseCard />
            </CardGrid>
          </div>
          <ClosingAlert
            navigateToSearchPage={navigateToSearchPage}
            hideCloseAlert={hideCloseAlert}
            showAlert={showAlert}
          />
        </Container>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default SkillsQuizV2;
