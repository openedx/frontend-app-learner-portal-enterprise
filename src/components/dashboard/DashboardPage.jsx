import React, {
  useContext, useEffect, useMemo,
} from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Container, Alert, Row, breakpoints, useToggle, MediaQuery, Tabs, Tab,
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
import { ProgramListingPage } from '../program-progress';
import PathwayProgressListingPage from '../pathway-progress/PathwayProgressListingPage';
import { features } from '../../config';
import { getHighlightsContentTypeSet, useContentHighlights, useEnterpriseCuration } from '../search/content-highlights/data';

export const LICENCE_ACTIVATION_MESSAGE = 'Your license was successfully activated.';

const DashboardPage = () => {
  const { enterpriseConfig, authenticatedUser } = useContext(AppContext);
  const { enterpriseConfig: { uuid: enterpriseUUID } } = useContext(AppContext);
  const { subscriptionPlan, showExpirationNotifications } = useContext(UserSubsidyContext);
  const { state } = useLocation();
  const history = useHistory();
  const [isActivationAlertOpen, , closeActivationAlert] = useToggle(!!state?.activationSuccess);
  const {
    enterpriseCuration: {
      canOnlyViewHighlightSets,
    },
  } = useEnterpriseCuration(enterpriseUUID);
  const { contentHighlights } = useContentHighlights(enterpriseUUID);
  const highlightsContentTypeSet = getHighlightsContentTypeSet(contentHighlights);

  useEffect(() => {
    if (state?.activationSuccess) {
      const updatedLocationState = { ...state };
      delete updatedLocationState.activationSuccess;
      history.replace({ ...history.location, state: updatedLocationState });
    }
  }, [history, state]);

  const userFirstName = useMemo(() => authenticatedUser?.name.split(' ').shift(), [authenticatedUser]);
  const CoursesTabComponent = (
    <>
      <Alert
        variant="success"
        show={isActivationAlertOpen}
        onClose={closeActivationAlert}
        className="mt-3"
        dismissible
      >
        {LICENCE_ACTIVATION_MESSAGE}
      </Alert>
      <Row className="py-5">
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
    </>
  );
  const PAGE_TITLE = `Dashboard - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />

      <Container size="lg">
        <h2 className="h1 mb-4 mt-4">
          {userFirstName ? `Welcome, ${userFirstName}!` : 'Welcome!'}
        </h2>
        <Tabs defaultActiveKey="courses">
          <Tab eventKey="courses" title="Courses">
            {CoursesTabComponent}
          </Tab>
          <Tab eventKey="programs" title="Programs" disabled={canOnlyViewHighlightSets && !highlightsContentTypeSet.has('program')}>
            <ProgramListingPage />
          </Tab>
          {features.FEATURE_ENABLE_PATHWAY_PROGRESS && (
            <Tab eventKey="pathways" title="Pathways" disabled={canOnlyViewHighlightSets && !highlightsContentTypeSet.has('learnerpathway')}>
              <PathwayProgressListingPage />
            </Tab>
          )}
        </Tabs>
      </Container>
    </>
  );
};

export default DashboardPage;
