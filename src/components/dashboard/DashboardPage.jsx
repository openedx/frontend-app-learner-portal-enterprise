import React, {
  useContext, useEffect, useMemo,
} from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Tabs,
  Tab,
} from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { ProgramListingPage } from '../program-progress';
import PathwayProgressListingPage from '../pathway-progress/PathwayProgressListingPage';
import { features } from '../../config';
import { useEnterpriseCuration } from '../search/content-highlights/data';
import { useLearnerProgramsListData } from '../program-progress/data/hooks';
import { useInProgressPathwaysData } from '../pathway-progress/data/hooks';
import CoursesTabComponent from './main-content/CoursesTabComponent';
import { MyCareerTab } from '../my-career';
import EnterpriseLearnerFirstVisitRedirect from '../enterprise-redirects/EnterpriseLearnerFirstVisitRedirect';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { IntegrationWarningModal } from '../integration-warning-modal';
import SubscriptionExpirationModal from './SubscriptionExpirationModal';

const DashboardPage = () => {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const { enterpriseConfig, authenticatedUser } = useContext(AppContext);
  const { subscriptionPlan, showExpirationNotifications } = useContext(UserSubsidyContext);
  // TODO: Create a context provider containing these 2 data fetch hooks to future proof when we need to use this data
  const [learnerProgramsListData, programsFetchError] = useLearnerProgramsListData(enterpriseConfig.uuid);
  const [pathwayProgressData, pathwayFetchError] = useInProgressPathwaysData(enterpriseConfig.uuid);
  const {
    enterpriseCuration: {
      canOnlyViewHighlightSets,
    },
  } = useEnterpriseCuration(enterpriseConfig.uuid);

  useEffect(() => {
    if (state?.activationSuccess) {
      const updatedLocationState = { ...state };
      delete updatedLocationState.activationSuccess;
      navigate(pathname, { state: updatedLocationState });
    }
  }, [pathname, navigate, state]);

  const userFirstName = useMemo(() => authenticatedUser?.name.split(' ').shift(), [authenticatedUser]);
  const PAGE_TITLE = `Dashboard - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Container size="lg">
        <h2 className="h1 mb-4 mt-4">
          {userFirstName ? `Welcome, ${userFirstName}!` : 'Welcome!'}
        </h2>
        <EnterpriseLearnerFirstVisitRedirect />
        <Tabs defaultActiveKey="courses">
          <Tab eventKey="courses" title="Courses">
            <CoursesTabComponent canOnlyViewHighlightSets={canOnlyViewHighlightSets} />
          </Tab>
          <Tab eventKey="programs" title="Programs" disabled={learnerProgramsListData.length === 0}>
            <ProgramListingPage
              canOnlyViewHighlightSets={canOnlyViewHighlightSets}
              programsListData={learnerProgramsListData}
              programsFetchError={programsFetchError}
            />
          </Tab>
          {features.FEATURE_ENABLE_PATHWAY_PROGRESS && (
            <Tab eventKey="pathways" title="Pathways" disabled={pathwayProgressData.length === 0}>
              <PathwayProgressListingPage
                canOnlyViewHighlightSets={canOnlyViewHighlightSets}
                pathwayProgressData={pathwayProgressData}
                pathwayFetchError={pathwayFetchError}
              />
            </Tab>
          )}
          {features.FEATURE_ENABLE_MY_CAREER && (
            <Tab eventKey="my-career" title="My Career">
              <MyCareerTab />
            </Tab>
          )}
        </Tabs>
        {enterpriseConfig.showIntegrationWarning && <IntegrationWarningModal isOpen />}
        {subscriptionPlan && showExpirationNotifications && <SubscriptionExpirationModal />}
      </Container>
    </>
  );
};

export default DashboardPage;
