import React, { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Container, Alert, Row, breakpoints, useToggle, MediaQuery,
} from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { IntegrationWarningModal } from '../integration-warning-modal';
import { MainContent, Sidebar } from '../layout';
import { DashboardMainContent } from './main-content';
import { DashboardSidebar } from './sidebar';
import SubscriptionExpirationModal from './SubscriptionExpirationModal';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { CourseEnrollmentsContextProvider } from './main-content/course-enrollments';
import CourseEnrollmentFailedAlert, { ENROLLMENT_SOURCE } from '../course/CourseEnrollmentFailedAlert';

export const LICENCE_ACTIVATION_MESSAGE = 'Your license was successfully activated.';

export default function DashboardPage() {
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionPlan, showExpirationNotifications } = useContext(UserSubsidyContext);
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

  const PAGE_TITLE = `Dashboard - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Container size="lg">
        <Alert
          variant="success"
          show={isActivationAlertOpen}
          onClose={closeActivationAlert}
          className="mt-3"
          dismissible
        >
          {LICENCE_ACTIVATION_MESSAGE}
        </Alert>
      </Container>
      <Container size="lg" className="py-5">
        <Row>
          <CourseEnrollmentsContextProvider>
            <CourseEnrollmentFailedAlert className="mt-0 mb-3" enrollmentSource={ENROLLMENT_SOURCE.DASHBOARD} />
            <MainContent>
              <DashboardMainContent />
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
      </Container>
    </>
  );
}
