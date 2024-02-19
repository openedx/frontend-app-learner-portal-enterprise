import React, {
  useContext, useEffect, useMemo,
} from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Tabs } from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useEnterpriseCuration } from '../search/content-highlights/data';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { IntegrationWarningModal } from '../integration-warning-modal';
import SubscriptionExpirationModal from './SubscriptionExpirationModal';
import EnterpriseLearnerFirstVisitRedirect from '../enterprise-redirects/EnterpriseLearnerFirstVisitRedirect';
import useDashboardTabs from './data/useDashboardTabs';

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

  const {
    enterpriseCuration: {
      canOnlyViewHighlightSets,
    },
  } = useEnterpriseCuration(enterpriseConfig.uuid);
  const intl = useIntl();

  const {
    tabs, onSelectHandler, activeTab, prefetchTab,
  } = useDashboardTabs({ canOnlyViewHighlightSets });

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
        <Tabs
          activeKey={activeTab}
          onSelect={onSelectHandler}
          onMouseOverCapture={prefetchTab}
        >
          {tabs}
        </Tabs>
        {enterpriseConfig.showIntegrationWarning && <IntegrationWarningModal isOpen />}
        {subscriptionPlan && showExpirationNotifications && <SubscriptionExpirationModal />}
      </Container>
    </>
  );
};

export default DashboardPage;
