import React, { useState, useContext, useMemo } from 'react';
import { Container, Alert } from '@openedx/paragon';
import Cookies from 'universal-cookie';
import PropTypes from 'prop-types';

import {
  LICENSE_REQUESTED_ALERT_DISMISSED_COOKIE_NAME,
  LICENSE_REQUESTED_ALERT_HEADING,
  LICENSE_REQUESTED_ALERT_TEXT,
} from './data/constants';
import { SubsidyRequestsContext, SUBSIDY_TYPE } from '../enterprise-subsidy-requests';
import { UserSubsidyContext } from '../enterprise-user-subsidy/UserSubsidy';

/**
 * A component to render an alert when a learner has a license request that is pending review.
 * Once dismissed, the learner will not see this alert again until the cookies are cleared.
 */
const LicenseRequestedAlert = ({ catalogList }) => {
  const cookies = new Cookies();
  const previouslyDismissed = cookies.get(LICENSE_REQUESTED_ALERT_DISMISSED_COOKIE_NAME);
  const [isAlertOpen, setIsAlertOpen] = useState(!previouslyDismissed);

  const {
    requestsBySubsidyType,
  } = useContext(SubsidyRequestsContext);

  const { customerAgreementConfig } = useContext(UserSubsidyContext);

  const hasPendingLicenseRequest = requestsBySubsidyType[SUBSIDY_TYPE.LICENSE].length > 0;

  const subscriptionCatalogUUIDs = useMemo(() => customerAgreementConfig?.subscriptions?.map(
    subscription => subscription.enterpriseCatalogUuid,
  ) ?? [], [customerAgreementConfig]);

  const hasApplicableSubscription = useMemo(() => subscriptionCatalogUUIDs.find(
    uuid => catalogList.includes(uuid),
  ), [catalogList, subscriptionCatalogUUIDs]);

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

LicenseRequestedAlert.propTypes = {
  catalogList: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default LicenseRequestedAlert;
