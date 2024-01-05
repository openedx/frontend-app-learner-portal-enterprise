import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Hyperlink } from '@edx/paragon';
import { LoginRedirect } from '@edx/frontend-enterprise-logistration';
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import { ErrorPage } from '../error-page';
import { LoadingSpinner } from '../loading-spinner';

import { postLinkEnterpriseLearner } from './data/service';
import { loginRefresh } from '../../utils/common';

export const LOADING_MESSAGE = 'Processing edX invite from your organization.';
export const CTA_BUTTON_TEXT = 'Continue to edX.org';

/**
 * React component for the `/invite/:enterpriseCustomerInviteKey` route.
 *
 * Redirects user to enterprise logistration flow to create a new account or
 * login to an existing account, then get redirected back to this route. At this
 * point, we attempt to link the user to the EnterpriseCustomer associated with
 * the `enterpriseCustomerInviteKey`.
 *
 * If successful, the user is redirected to their enterprise customer's Learner Portal
 * slug. If an error occurred, an appropriate error page is shown and an error is logged.
 */
const EnterpriseInvitePage = () => {
  const { enterpriseCustomerInviteKey } = useParams();
  const [inviteError, setInviteError] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { authenticatedUser, config } = useContext(AppContext);

  useEffect(() => {
    // Note: `authenticatedUser.id` is a property that is added once the user account has finished
    // resolving its async request. By using `id` instead of `userId`, we are ensuring the user data
    // is hydrated before showing error page that requires hydrated user data.
    if (authenticatedUser?.userId) {
      const linkEnterpriseLearner = async () => {
        let redirectTo;

        try {
          const response = await postLinkEnterpriseLearner(enterpriseCustomerInviteKey);
          const result = camelCaseObject(response.data);
          const { enterpriseCustomerSlug } = result;
          redirectTo = `/${enterpriseCustomerSlug}`;
        } catch (error) {
          logError(error);
          setInviteError(error);
        }

        if (redirectTo) {
          try {
            // Refresh login so that the user's roles get updated.
            // There is not much we can do if login refresh fails here, log the error and move on.
            await loginRefresh();
          } catch (error) {
            logError(error);
          }

          navigate(redirectTo, { replace: true });
        }

        setIsLoading(false);
      };
      linkEnterpriseLearner();
    }
  }, [authenticatedUser, enterpriseCustomerInviteKey, navigate]);

  return (
    <LoginRedirect>
      {isLoading && (
        <Container className="py-5">
          <LoadingSpinner screenReaderText={LOADING_MESSAGE} />
        </Container>
      )}
      {inviteError && (
        <ErrorPage subtitle="We couldn't link your edX account to your organization">
          <p className="mb-5">
            Please reach out to your edX administrator or visit the{' '}
            <Hyperlink
              destination={config.LEARNER_SUPPORT_URL}
              target="_blank"
            >
              edX Help Center
            </Hyperlink>{' '}
            to resolve the error and gain access to subsidized content, or continue to{' '}
            <Hyperlink
              destination={config.MARKETING_SITE_BASE_URL}
              target="_blank"
            >
              edX.org
            </Hyperlink>{' '}
            to start learning on your own.
          </p>
          <Button
            as={Hyperlink}
            target="_blank"
            destination={config.MARKETING_SITE_BASE_URL}
            variant="primary"
            size="sm"
          >
            {CTA_BUTTON_TEXT}
          </Button>
        </ErrorPage>
      )}
    </LoginRedirect>
  );
};

export default EnterpriseInvitePage;
