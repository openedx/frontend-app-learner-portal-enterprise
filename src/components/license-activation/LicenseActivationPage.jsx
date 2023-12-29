import React, { useContext } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { logInfo } from '@edx/frontend-platform/logging';
import { Alert } from '@openedx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { UserSubsidyContext } from '../enterprise-user-subsidy/UserSubsidy';
import { LICENSE_STATUS } from '../enterprise-user-subsidy/data/constants';
import LicenseActivation from './LicenseActivation';
import LicenseActivationErrorAlert from './LicenseActivationErrorAlert';

import { useRenderContactHelpText } from '../../utils/hooks';

export const LOADING_MESSAGE = 'Your enterprise license is being activated! You will be automatically redirected to your organization\'s learner portal shortly.';

const LicenseActivationPage = () => {
  const user = getAuthenticatedUser();
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionLicense } = useContext(UserSubsidyContext);
  const { activationKey } = useParams();
  const renderContactHelpText = useRenderContactHelpText(enterpriseConfig);

  if (!subscriptionLicense || subscriptionLicense.status !== LICENSE_STATUS.ASSIGNED) {
    if (!subscriptionLicense) {
      logInfo(`User ${user.id} attempted to activate a license with activation key ${activationKey}, but has no license.`);
    } else {
      logInfo(
        `User ${user.id} attempted to activate a license with activation key ${activationKey}`
       + ` but their license ${subscriptionLicense.uuid} is ${subscriptionLicense.status}.`,
      );
    }

    return (
      <Redirect
        to={{
          pathname: `/${enterpriseConfig.slug}`,
        }}
      />
    );
  }

  if (activationKey !== subscriptionLicense.activationKey) {
    logInfo(
      `User ${user.id} attempted to activate a license with activation key ${activationKey}`
      + ` but their license ${subscriptionLicense.uuid} has activation key ${subscriptionLicense.activationKey}.`,
    );
    // User will be redirected to the correct activation link due to AutoActivateLicense.
    return (
      <LicenseActivationErrorAlert
        title={`License Activation - ${enterpriseConfig.name}`}
        contactHelpText={renderContactHelpText(Alert.Link)}
      />
    );
  }

  return <LicenseActivation />;
};

export default LicenseActivationPage;
