import React, { useContext } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AppContext } from '@edx/frontend-platform/react';
import { Alert, Container } from '@edx/paragon';

import { LoadingSpinner } from '../loading-spinner';
import { useLicenseActivation } from './data/hooks';

import { useRenderContactHelpText } from '../../utils/hooks';

export const LOADING_MESSAGE = 'Your enterprise license is being activated! You will be automatically redirected to your organization\'s learner portal shortly.';

export default function LicenseActivation() {
  const { activationKey } = useParams();
  const { enterpriseConfig } = useContext(AppContext);
  const renderContactHelpText = useRenderContactHelpText(enterpriseConfig);

  const [activationSuccess, activationError] = useLicenseActivation(activationKey);

  if (activationSuccess) {
    return (
      <Redirect
        to={{
          pathname: `/${enterpriseConfig.slug}`,
          state: { activationSuccess },
        }}
      />
    );
  }

  const PAGE_TITLE = `License Activation - ${enterpriseConfig.name}`;
  if (activationError) {
    return (
      <>
        <Helmet title={PAGE_TITLE} />
        <Container size="lg" className="mt-3">
          <Alert variant="danger">
            We were unable to activate a license for this user. Please double-check that you have an
            assigned license and verify the email to which it was sent. If you run into further issues,
            please {renderContactHelpText(Alert.Link)} for assistance.
          </Alert>
        </Container>
      </>
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
}
