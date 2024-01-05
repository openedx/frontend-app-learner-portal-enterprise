import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Row, breakpoints, MediaQuery, TransitionReplace, Button, Icon,
} from '@edx/paragon';
import { Plus } from '@edx/paragon/icons';
import { MainContent, Sidebar } from '../layout';
import { DashboardSidebar } from '../dashboard/sidebar';
import { CourseEnrollmentsContextProvider } from '../dashboard/main-content/course-enrollments';
import CourseEnrollmentFailedAlert, { ENROLLMENT_SOURCE } from '../course/CourseEnrollmentFailedAlert';
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
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    if (state?.activationSuccess) {
      const updatedLocationState = { ...state };
      delete updatedLocationState.activationSuccess;
      navigate(pathname, { state: updatedLocationState, replace: true });
    }
  }, [navigate, pathname, state]);

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
      <CourseEnrollmentsContextProvider>
        <CourseEnrollmentFailedAlert
          className="mt-0 mb-3"
          enrollmentSource={ENROLLMENT_SOURCE.DASHBOARD}
        />
        <MainContent>
          <div className="job-role">
            <h2>Visualize your career.</h2>
            <div className="row job-role-details">
              <div className="col-lg-6 col-sm-12">
                <TransitionReplace className="mb-3">
                  {!isEditable ? (
                    <div key="add-job-button">
                      <p>
                        Take one minute to pick a job title that best describes your
                        current or desired role. We&apos;ll tell you what skills you
                        should be looking for when enrolling in courses, and track
                        your skill growth as you complete courses.
                      </p>
                      <Button
                        style={{ paddingLeft: 0 }}
                        variant="link"
                        iconBefore={addIcon}
                        onClick={addRoleClickHandler}
                      >
                        Add Role
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
          {(matches) => (matches ? (
            <Sidebar data-testid="add-job-role-sidebar">
              <DashboardSidebar />
            </Sidebar>
          ) : null)}
        </MediaQuery>
      </CourseEnrollmentsContextProvider>
    </Row>
  );
};

AddJobRole.propTypes = {
  submitClickHandler: PropTypes.func.isRequired,
};

export default AddJobRole;
