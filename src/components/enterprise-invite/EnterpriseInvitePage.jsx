import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container } from '@edx/paragon';
import { LoginRedirect } from '@edx/frontend-enterprise-logistration';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import InviteError from './InviteError';
import { LoadingSpinner } from '../loading-spinner';

import { postLinkEnterpriseLearner } from './data/service';

export const LOADING_MESSAGE = 'Processing edX invite from your organization.';

const EnterpriseInvitePage = () => {
  const { enterpriseCustomerInviteKey } = useParams();
  const [inviteError, setInviteError] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();
  const authenticatedUser = getAuthenticatedUser();

  useEffect(() => {
    if (authenticatedUser?.id) {
      const linkEnterpriseLearner = async () => {
        try {
          const response = await postLinkEnterpriseLearner(enterpriseCustomerInviteKey);
          const result = camelCaseObject(response.data);
          const { enterpriseCustomerSlug } = result;
          history.replace(`/${enterpriseCustomerSlug}`);
        } catch (error) {
          logError(error);
          setInviteError(error);
        } finally {
          setIsLoading(false);
        }
      };
      linkEnterpriseLearner();
    }
  }, []);

  return (
    <LoginRedirect>
      {isLoading && (
        <Container className="py-5">
          <LoadingSpinner screenReaderText={LOADING_MESSAGE} />
        </Container>
      )}
      {inviteError && <InviteError />}
    </LoginRedirect>
  );
};

export default EnterpriseInvitePage;
