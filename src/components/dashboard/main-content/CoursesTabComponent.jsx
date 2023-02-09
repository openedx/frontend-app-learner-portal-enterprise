import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import {
  useToggle,
  Row,
  Alert,
  MediaQuery,
  breakpoints,
} from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import PropTypes from 'prop-types';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { CourseEnrollmentsContextProvider } from './course-enrollments';
import { IntegrationWarningModal } from '../../integration-warning-modal';
import { MainContent, Sidebar } from '../../layout';
import CourseEnrollmentFailedAlert, { ENROLLMENT_SOURCE } from '../../course/CourseEnrollmentFailedAlert';
import DashboardMainContent from './DashboardMainContent';
import { DashboardSidebar } from '../sidebar';
import SubscriptionExpirationModal from '../SubscriptionExpirationModal';
import { LICENSE_ACTIVATION_MESSAGE } from '../data/constants';

const CoursesTabComponent = ({ canOnlyViewHighlightSets }) => {
  const { state } = useLocation();
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionPlan, showExpirationNotifications } = useContext(UserSubsidyContext);
  const [isActivationAlertOpen, , closeActivationAlert] = useToggle(!!state?.activationSuccess);

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
          <CourseEnrollmentFailedAlert className="mt-0 mb-3" enrollmentSource={ENROLLMENT_SOURCE.DASHBOARD} />
          <MainContent>
            <DashboardMainContent canOnlyViewHighlightSets={canOnlyViewHighlightSets} />
          </MainContent>
          <MediaQuery minWidth={breakpoints.large.minWidth}>
            {matches => (matches ? (
              <Sidebar data-testid="sidebar">
                <DashboardSidebar />
              </Sidebar>
            ) : null)}
          </MediaQuery>
        </CourseEnrollmentsContextProvider>
        <IntegrationWarningModal isOpen={enterpriseConfig.showIntegrationWarning} />
        {subscriptionPlan && showExpirationNotifications && <SubscriptionExpirationModal />}
      </Row>
    </>
  );
};

CoursesTabComponent.propTypes = {
  canOnlyViewHighlightSets: PropTypes.bool,
};

CoursesTabComponent.defaultProps = {
  canOnlyViewHighlightSets: false,
};

export default CoursesTabComponent;
