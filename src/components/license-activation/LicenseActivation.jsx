import React, { useContext, useEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AppContext } from '@edx/frontend-platform/react';
import { Alert, Container } from '@openedx/paragon';

import { LoadingSpinner } from '../loading-spinner';

import { useRenderContactHelpText } from '../../utils/hooks';
import LicenseActivationErrorAlert from './LicenseActivationErrorAlert';
import { UserSubsidyContext } from '../enterprise-user-subsidy/UserSubsidy';

export const LOADING_MESSAGE = 'Your enterprise license is being activated! You will be automatically redirected to your organization\'s learner portal shortly.';

const LicenseActivation = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const renderContactHelpText = useRenderContactHelpText(enterpriseConfig);
  const location = useLocation();
  const fromLocation = location.state?.from;
  const { activateUserLicense } = useContext(UserSubsidyContext);
  const [activationSuccess, setActivationSuccess] = useState();

  useEffect(() => {
    const activateLicense = async () => {
      const autoActivated = !!fromLocation;
      try {
        await activateUserLicense(autoActivated);
        setActivationSuccess(true);
      } catch (error) {
        setActivationSuccess(false);
      }
    };

    activateLicense();
  }, [activateUserLicense, fromLocation]);

  if (activationSuccess) {
    const redirectToPath = location.state?.from ?? `/${enterpriseConfig.slug}`;

    return (
      <Redirect
        to={{
          pathname: redirectToPath,
          state: { activationSuccess },
        }}
      />
    );
  }

  const PAGE_TITLE = `License Activation - ${enterpriseConfig.name}`;

  if (activationSuccess === false) {
    return (
      <LicenseActivationErrorAlert
        title={`License Activation - ${enterpriseConfig.name}`}
        contactHelpText={renderContactHelpText(Alert.Link)}
      />
    );
  }

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Container className="py-5">
        <LoadingSpinner screenReaderText={LOADING_MESSAGE} />
      </Container>
    </>
  );
};

export default LicenseActivation;
