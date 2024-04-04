import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { Container, Alert } from '@openedx/paragon';

import {
  LICENSE_REQUESTED_ALERT_DISMISSED_COOKIE_NAME,
  LICENSE_REQUESTED_ALERT_HEADING,
  LICENSE_REQUESTED_ALERT_TEXT,
} from './data/constants';
import { useBrowseAndRequest, useEnterpriseCustomerContainsContent, useSubscriptions } from '../app/data';

/**
 * A component to render an alert when a learner has a license request that is pending review.
 * Once dismissed, the learner will not see this alert again until the cookies are cleared.
 */
const LicenseRequestedAlert = () => {
  const { courseKey } = useParams();
  const { data: { catalogList } } = useEnterpriseCustomerContainsContent([courseKey]);
  const cookies = new Cookies();
  const previouslyDismissed = cookies.get(LICENSE_REQUESTED_ALERT_DISMISSED_COOKIE_NAME);
  const [isAlertOpen, setIsAlertOpen] = useState(!previouslyDismissed);

  const { data: browseAndRequest } = useBrowseAndRequest();
  const hasPendingLicenseRequest = browseAndRequest.requests.subscriptionLicenses.length > 0;

  const { data: { customerAgreement } } = useSubscriptions();

  const subscriptionCatalogUUIDs = customerAgreement?.availableSubscriptionCatalogs;
  const hasApplicableSubscription = !!subscriptionCatalogUUIDs?.find(uuid => catalogList.includes(uuid));

  // Do not show the alert if there is no applicable subscription or no pending license request
  if (!(hasApplicableSubscription && hasPendingLicenseRequest && isAlertOpen)) {
    return null;
  }

  const handleClose = () => {
    cookies.set(LICENSE_REQUESTED_ALERT_DISMISSED_COOKIE_NAME, true, { sameSite: 'strict' });
    setIsAlertOpen(false);
  };

  return (
    <Container size="lg" className="pt-3">
      <Alert variant="info" dismissible onClose={handleClose}>
        <Alert.Heading>{LICENSE_REQUESTED_ALERT_HEADING}</Alert.Heading>
        <p>
          {LICENSE_REQUESTED_ALERT_TEXT}
        </p>
      </Alert>
    </Container>
  );
};

export default LicenseRequestedAlert;
