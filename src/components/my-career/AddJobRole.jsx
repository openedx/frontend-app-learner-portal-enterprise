import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Row, breakpoints, MediaQuery, TransitionReplace, Button, Icon,
} from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { MainContent, Sidebar } from '../layout';
import { DashboardSidebar } from '../dashboard/sidebar';
import SearchJobRole from './SearchJobRole';
import SkillsQuizImage from '../../assets/images/skills-quiz/skills-quiz.png';

const addIcon = () => (
  <Icon
    src={Plus}
    id="add-job-role-icon"
    className="add-job-icon"
    screenReaderText="Add Role"
  />
);

const AddJobRole = ({ submitClickHandler }) => {
  const [isEditable, setIsEditable] = useState(false);

  const addRoleClickHandler = () => {
    setIsEditable(true);
  };

  const onSaveRole = (resp) => {
    submitClickHandler(resp);
    setIsEditable(false);
  };

  const onCancelRole = () => {
    setIsEditable(false);
  };

  return (
    <Row className="py-5">
      {/* <CourseEnrollmentFailedAlert
        className="mt-0 mb-3"
        enrollmentSource={ENROLLMENT_SOURCE.DASHBOARD}
      /> */}
      <MainContent>
        <div className="job-role">
          <h2>
            <FormattedMessage
              id="enterprise.dashboard.my.career.tab.add.job.role.title"
              defaultMessage="Visualize your career."
              description="Title shown to learner when learner has no current or desired job role added"
            />
          </h2>
          <div className="row job-role-details">
            <div className="col-lg-6 col-sm-12">
              <TransitionReplace className="mb-3">
                {!isEditable ? (
                  <div key="add-job-button">
                    <p>
                      <FormattedMessage
                        id="enterprise.dashboard.my.career.tab.add.job.role.description"
                        defaultMessage="Take one minute to pick a job title that best describes your current or desired role. We'll tell you what skills you should be looking for when enrolling in courses, and track your skill growth as you complete courses."
                        description="Desctiption shown to learner when learner has no current or desired job role added"
                      />
                    </p>
                    <Button
                      className="pl-0"
                      variant="link"
                      iconBefore={addIcon}
                      onClick={addRoleClickHandler}
                    >
                      <FormattedMessage
                        id="enterprise.dashboard.my.career.tab.add.job.role.button"
                        defaultMessage="Add Role"
                        description="Label for button to add learner's current or desired job role"
                      />
                    </Button>
                  </div>
                ) : (
                  <div key="add-job-dropdown">
                    <SearchJobRole onSave={onSaveRole} onCancel={onCancelRole} />
                  </div>
                )}
              </TransitionReplace>
            </div>
            <div className="col-lg-6 col-sm-12">
              <img
                className="job-role-image"
                src={SkillsQuizImage}
                alt="Add Job Role CTA"
              />
            </div>
          </div>
        </div>
      </MainContent>
      <MediaQuery minWidth={breakpoints.large.minWidth}>
        {(matches) => (matches && (
          <Sidebar data-testid="add-job-role-sidebar">
            <DashboardSidebar />
          </Sidebar>
        ))}
      </MediaQuery>
    </Row>
  );
};

AddJobRole.propTypes = {
  submitClickHandler: PropTypes.func.isRequired,
};

export default AddJobRole;
