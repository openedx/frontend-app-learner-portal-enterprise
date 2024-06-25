import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { useQueryClient } from '@tanstack/react-query';
import {
  Alert, Container, Tabs,
} from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { IntegrationWarningModal } from '../integration-warning-modal';
import SubscriptionExpirationModal from './SubscriptionExpirationModal';
import { useDashboardTabs } from './data';
import {
  querySubscriptions,
  useEnterpriseCustomer,
  useSubscriptions,
} from '../app/data';
import BudgetExpiryNotification from '../budget-expiry-notification';

const DashboardPage = () => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { authenticatedUser } = useContext(AppContext);
  const userFirstName = authenticatedUser?.name?.split(' ').shift();

  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: subscriptions } = useSubscriptions();

  const handleSubscriptionLicenseActivationAlertClose = () => {
    queryClient.setQueryData(
      querySubscriptions(enterpriseCustomer.uuid).queryKey,
      {
        ...subscriptions,
        shouldShowActivationSuccessMessage: false,
      },
    );
  };

  const {
    tabs,
    onSelectHandler,
    activeTab,
  } = useDashboardTabs();

  const PAGE_TITLE = intl.formatMessage(
    {
      id: 'enterprise.dashboard.page.title',
      defaultMessage: 'Dashboard - {enterpriseName}',
      description: 'Page title for an enterprise dashboard.',
    },
    {
      enterpriseName: enterpriseCustomer.name,
    },
  );

  return (
    <Container size="lg" className="py-4">
      <Helmet title={PAGE_TITLE} />
      <BudgetExpiryNotification />
      <h2 className="h1 mb-4">
        {userFirstName
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
          })}
      </h2>
      <Alert
        variant="success"
        show={subscriptions.shouldShowActivationSuccessMessage}
        onClose={handleSubscriptionLicenseActivationAlertClose}
        className="mt-3"
        dismissible
      >
        <FormattedMessage
          id="enterprise.dashboard.tab.courses.license.activated"
          defaultMessage="Your license was successfully activated."
          description="Alert message shown to a learner on enterprise dashboard courses tab."
        />
      </Alert>
      <Tabs
        activeKey={activeTab}
        onSelect={onSelectHandler}
      >
        {tabs.map((tab) => React.cloneElement(tab, { key: tab.props.eventKey }))}
      </Tabs>
      <IntegrationWarningModal isEnabled={enterpriseCustomer.showIntegrationWarning} />
      {subscriptions.subscriptionPlan && subscriptions.showExpirationNotifications && <SubscriptionExpirationModal />}
    </Container>
  );
};

export default DashboardPage;
