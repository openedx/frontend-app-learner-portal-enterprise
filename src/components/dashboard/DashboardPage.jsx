import React, { useContext, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Tab, Tabs } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { ProgramListingPage } from '../program-progress';
import PathwayProgressListingPage from '../pathway-progress/PathwayProgressListingPage';
import { features } from '../../config';
import { useEnterpriseCuration } from '../search/content-highlights/data';
import { useLearnerProgramsListData } from '../program-progress/data/hooks';
import { useInProgressPathwaysData } from '../pathway-progress/data/hooks';
import CoursesTabComponent from './main-content/CoursesTabComponent';
import { MyCareerTab } from '../my-career';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { IntegrationWarningModal } from '../integration-warning-modal';
import SubscriptionExpirationModal from './SubscriptionExpirationModal';
import EnterpriseLearnerFirstVisitRedirect from '../enterprise-redirects/EnterpriseLearnerFirstVisitRedirect';

const DashboardPage = () => {
  const {
    pathname, state, search, hash,
  } = useLocation();
  const navigate = useNavigate();
  const { enterpriseConfig, authenticatedUser } = useContext(AppContext);
  const {
    subscriptionPlan,
    showExpirationNotifications,
  } = useContext(UserSubsidyContext);
  // TODO: Create a context provider containing these 2 data fetch hooks to future proof when we need to use this data
  const [learnerProgramsListData, programsFetchError] = useLearnerProgramsListData(enterpriseConfig.uuid);
  const [pathwayProgressData, pathwayFetchError] = useInProgressPathwaysData(enterpriseConfig.uuid);
  const {
    enterpriseCuration: {
      canOnlyViewHighlightSets,
    },
  } = useEnterpriseCuration(enterpriseConfig.uuid);
  const intl = useIntl();

  const onSelectHandler = (key) => {
    if (key === 'my-career') {
      sendEnterpriseTrackEvent(
        enterpriseConfig.uuid,
        'edx.ui.enterprise.learner_portal.career_tab.page_visit',
      );
    }
  };

  useEffect(() => {
    if (state?.activationSuccess) {
      const updatedLocationState = { ...state };
      delete updatedLocationState.activationSuccess;
      navigate(pathname, {
        search, hash, state: updatedLocationState, replace: true,
      });
    }
  }, [pathname, navigate, state, search, hash]);

  const userFirstName = useMemo(() => authenticatedUser?.name.split(' ').shift(), [authenticatedUser]);
  const PAGE_TITLE = intl.formatMessage(
    {
      id: 'enterprise.dashboard.page.title',
      defaultMessage: 'Dashboard - {enterpriseName}!',
      description: 'Page title for an enterprise dashboard.',
    },
    {
      enterpriseName: enterpriseConfig.name,
    },
  );
  const allTabs = [
    <Tab
      eventKey="courses"
      title={intl.formatMessage({
        id: 'enterprise.dashboard.tab.courses',
        defaultMessage: 'Courses',
        description: 'Title for courses tab on enterprise dashboard.',
      })}
    >
      <CoursesTabComponent canOnlyViewHighlightSets={canOnlyViewHighlightSets} />
    </Tab>,
    enterpriseConfig.enablePrograms && (
      <Tab
        eventKey="programs"
        title={intl.formatMessage({
          id: 'enterprise.dashboard.tab.programs',
          defaultMessage: 'Programs',
          description: 'Title for programs tab on enterprise dashboard.',
        })}
        disabled={learnerProgramsListData.length === 0}
      >
        <ProgramListingPage
          canOnlyViewHighlightSets={canOnlyViewHighlightSets}
          programsListData={learnerProgramsListData}
          programsFetchError={programsFetchError}
        />
      </Tab>
    ),
    enterpriseConfig.enablePathways && (
      <Tab
        eventKey="pathways"
        title={intl.formatMessage({
          id: 'enterprise.dashboard.tab.pathways',
          defaultMessage: 'Pathways',
          description: 'Title for pathways tab on enterprise dashboard.',
        })}
        disabled={pathwayProgressData.length === 0}
      >
        <PathwayProgressListingPage
          canOnlyViewHighlightSets={canOnlyViewHighlightSets}
          pathwayProgressData={pathwayProgressData}
          pathwayFetchError={pathwayFetchError}
        />
      </Tab>
    ),
    features.FEATURE_ENABLE_MY_CAREER && (
      <Tab
        eventKey="my-career"
        title={intl.formatMessage({
          id: 'enterprise.dashboard.tab.my.career',
          defaultMessage: 'My Career',
          description: 'Title for my career tab on enterprise dashboard.',
        })}
      >
        <MyCareerTab />
      </Tab>
    ),
  ];

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Container size="lg">
        <h2 className="h1 mb-4 mt-4">
          {
            userFirstName
              ? intl.formatMessage(
                {
                  id: 'enterprise.dashboard.user.welcome.message',
                  defaultMessage: 'Welcome, {userFirstName}!',
                  description: 'Welcome message shown when user has first name.',
                },
                {
                  userFirstName,
                },
              )
              : intl.formatMessage({
                id: 'enterprise.dashboard.welcome.message',
                defaultMessage: 'Welcome!',
                description: 'Welcome message shown when user has no first name.',
              })
          }
        </h2>
        <EnterpriseLearnerFirstVisitRedirect />
        <Tabs defaultActiveKey="courses" onSelect={(k) => onSelectHandler(k)}>{allTabs.filter(tab => tab)}</Tabs>
        {enterpriseConfig.showIntegrationWarning && <IntegrationWarningModal isOpen />}
        {subscriptionPlan && showExpirationNotifications && <SubscriptionExpirationModal />}
      </Container>
    </>
  );
};

export default DashboardPage;
