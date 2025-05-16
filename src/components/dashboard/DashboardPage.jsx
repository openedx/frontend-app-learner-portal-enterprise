import { cloneElement, useContext } from 'react';
import { Helmet } from 'react-helmet';
import {
  Alert, Container, Tabs, useToggle,
} from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { IntegrationWarningModal } from '../integration-warning-modal';
import SubscriptionExpirationModal from './SubscriptionExpirationModal';
import { useDashboardTabs } from './data';
import { SESSION_STORAGE_KEY_LICENSE_ACTIVATION_MESSAGE, useEnterpriseCustomer, useSubscriptions } from '../app/data';
import BudgetExpiryNotification from '../budget-expiry-notification';
import CustomSubscriptionExpirationModal from '../custom-expired-subscription-modal';
import BrowseAndRequestAlert from '../course/BrowseAndRequestAlert';

const DashboardPage = () => {
  const intl = useIntl();
  const { authenticatedUser } = useContext(AppContext);
  const userFirstName = authenticatedUser?.name?.split(' ').shift();
  const [shouldShowLicenseActivationSuccessMessageState, , close] = useToggle(
    !!sessionStorage.getItem(SESSION_STORAGE_KEY_LICENSE_ACTIVATION_MESSAGE),
  );
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: subscriptions } = useSubscriptions();
  const handleSubscriptionLicenseActivationAlertClose = (e) => {
    e.preventDefault();
    sessionStorage.removeItem(SESSION_STORAGE_KEY_LICENSE_ACTIVATION_MESSAGE);
    close();
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
        show={shouldShowLicenseActivationSuccessMessageState}
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
      <BrowseAndRequestAlert />
      <Tabs
        activeKey={activeTab}
        onSelect={onSelectHandler}
      >
        {tabs.map((tab) => cloneElement(tab, { key: tab.props.eventKey }))}
      </Tabs>
      <IntegrationWarningModal isEnabled={enterpriseCustomer.showIntegrationWarning} />
      {/* CustomSubscriptionExpirationModal is specifically tailored for learners with an expired license and is
      triggered when the learner has hasCustomLicenseExpirationMessagingV2 enabled.
      Ideally, the existing SubscriptionExpirationModal should be extended or repurposed to incorporate
      this logic and support the custom messaging.
      This is noted as a TO-DO, and a ticket will be created to address this enhancement.
      Ticket: https://2u-internal.atlassian.net/browse/ENT-9512 */}
      <CustomSubscriptionExpirationModal />
      {subscriptions.subscriptionPlan && subscriptions.showExpirationNotifications && <SubscriptionExpirationModal />}
    </Container>
  );
};

export default DashboardPage;
