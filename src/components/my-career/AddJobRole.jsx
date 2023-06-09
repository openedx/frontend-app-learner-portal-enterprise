import React, { useContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Alert, Row, breakpoints, MediaQuery, Hyperlink, Icon, useToggle,
} from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { MainContent, Sidebar } from '../layout';
import { DashboardSidebar } from '../dashboard/sidebar';
import { CourseEnrollmentsContextProvider } from '../dashboard/main-content/course-enrollments';
import CourseEnrollmentFailedAlert, { ENROLLMENT_SOURCE } from '../course/CourseEnrollmentFailedAlert';
import { LICENSE_ACTIVATION_MESSAGE } from '../dashboard/data/constants';

import SkillsQuizImage from '../../assets/images/skills-quiz/skills-quiz.png';

const AddJobRole = () => {
  const { state } = useLocation();
  const history = useHistory();
  const [isActivationAlertOpen, , closeActivationAlert] = useToggle(!!state?.activationSuccess);
  useEffect(() => {
    if (state?.activationSuccess) {
      const updatedLocationState = { ...state };
      delete updatedLocationState.activationSuccess;
      history.replace({ ...history.location, state: updatedLocationState });
    }
  }, [history, state]);

  const {
    enterpriseConfig: { slug },
  } = useContext(AppContext);

  return (
    <>
      <Alert
        variant="success"
        show={isActivationAlertOpen}
        onClose={closeActivationAlert}
        className="mt-3"
        dismissible
      >
        {LICENSE_ACTIVATION_MESSAGE}
      </Alert>
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
                  <p>
                    Take one minute to pick a job title that best describes your
                    current or desired role. We&apos;ll tell you what skills you
                    should be looking for when enrolling in courses, and track
                    your skill growth as you complete courses.
                  </p>
                  <Hyperlink destination={`/${slug}/skills-quiz`}>
                    <Icon
                      id="add-job-role-icon"
                      className="fa fa-plus add-job-icon"
                      screenReaderText="Add Role"
                    />
                    Add Role
                  </Hyperlink>
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
              <Sidebar data-testid="sidebar">
                <DashboardSidebar />
              </Sidebar>
            ) : null)}
          </MediaQuery>
        </CourseEnrollmentsContextProvider>
      </Row>
    </>
  );
};

export default AddJobRole;
