import { Skeleton, Tab } from '@edx/paragon';
import React, { useContext, useState } from 'react';
import loadable from '@loadable/component';

import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useIntl } from '@edx/frontend-platform/i18n';
import CoursesTabComponent from '../main-content/CoursesTabComponent';
import { ProgramListingPage } from '../../program-progress';
import PathwayProgressListingPage from '../../pathway-progress/PathwayProgressListingPage';
import { features } from '../../../config';

import {
  DASHBOARD_COURSES_TAB, DASHBOARD_MY_CAREER_TAB,
  DASHBOARD_PATHWAYS_TAB,
  DASHBOARD_PROGRAMS_TAB,
  DASHBOARD_TABS_SEGMENT_KEY, PREFETCH_TAB_ENABLED,
} from './constants';
import { useInProgressPathwaysData } from '../../pathway-progress/data/hooks';
import { useLearnerProgramsListData } from '../../program-progress/data/hooks';

const MyCareerTab = loadable(() => import(
  '../../my-career/MyCareerTab'
), {
  fallback: <Skeleton height={30} />,
});

const useDashboardTabs = ({
  canOnlyViewHighlightSets,
}) => {
  const { enterpriseConfig } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState(DASHBOARD_COURSES_TAB);
  const intl = useIntl();

  const [learnerProgramsListData, programsFetchError] = useLearnerProgramsListData(enterpriseConfig.uuid);
  const [pathwayProgressData, pathwayFetchError] = useInProgressPathwaysData(enterpriseConfig.uuid);

  const onSelectHandler = (tabName) => {
    setActiveTab(tabName);
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
          `edx.ui.enterprise.learner_portal.${DASHBOARD_TABS_SEGMENT_KEY[tabName]}.page_visit`,
    );
  };

  // Creates prefetch logic based on loadable-components, "component splitting" capability expose to Tabs component
  const prefetchTab = (e) => {
    const eventTarget = e.target;
    const eventKey = eventTarget.dataset.rbEventKey;
    if (PREFETCH_TAB_ENABLED[eventKey] && eventKey === DASHBOARD_MY_CAREER_TAB) {
      MyCareerTab.preload();
    }
  };

  // Defines the tab components and rendered child, and filters based on active features
  const allTabs = [
    <Tab
      eventKey={DASHBOARD_COURSES_TAB}
      title={intl.formatMessage({
        id: 'enterprise.dashboard.tab.courses',
        defaultMessage: 'Courses',
        description: 'Title for courses tab on enterprise dashboard.',
      })}
    >
      {activeTab === DASHBOARD_COURSES_TAB && (
        <CoursesTabComponent
          canOnlyViewHighlightSets={canOnlyViewHighlightSets}
        />
      )}
    </Tab>,
    enterpriseConfig.enablePrograms && (
      <Tab
        eventKey={DASHBOARD_PROGRAMS_TAB}
        title={intl.formatMessage({
          id: 'enterprise.dashboard.tab.programs',
          defaultMessage: 'Programs',
          description: 'Title for programs tab on enterprise dashboard.',
        })}
        disabled={learnerProgramsListData.length === 0}
      >
        {activeTab === DASHBOARD_PROGRAMS_TAB && (
          <ProgramListingPage
            canOnlyViewHighlightSets={canOnlyViewHighlightSets}
            programsListData={learnerProgramsListData}
            programsFetchError={programsFetchError}
          />
        )}
      </Tab>
    ),
    enterpriseConfig.enablePathways && (
      <Tab
        eventKey={DASHBOARD_PATHWAYS_TAB}
        title={intl.formatMessage({
          id: 'enterprise.dashboard.tab.pathways',
          defaultMessage: 'Pathways',
          description: 'Title for pathways tab on enterprise dashboard.',
        })}
        disabled={pathwayProgressData.length === 0}
      >
        {activeTab === DASHBOARD_PATHWAYS_TAB && (
          <PathwayProgressListingPage
            canOnlyViewHighlightSets={canOnlyViewHighlightSets}
            pathwayProgressData={pathwayProgressData}
            pathwayFetchError={pathwayFetchError}
          />
        )}
      </Tab>
    ),
    features.FEATURE_ENABLE_MY_CAREER && (
      <Tab
        eventKey={DASHBOARD_MY_CAREER_TAB}
        title={intl.formatMessage({
          id: 'enterprise.dashboard.tab.my.career',
          defaultMessage: 'My Career',
          description: 'Title for my career tab on enterprise dashboard.',
        })}
      >
        {activeTab === DASHBOARD_MY_CAREER_TAB && <MyCareerTab />}
      </Tab>
    ),
  ].filter(tab => tab); // Filtering for truthy values

  return {
    tabs: allTabs,
    onSelectHandler,
    activeTab,
    prefetchTab,
  };
};

export default useDashboardTabs;
