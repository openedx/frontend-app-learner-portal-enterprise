import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import NotFoundPage from '../NotFoundPage';
import { LoadingSpinner } from '../loading-spinner';

import {
  useEnterpriseCustomersForUser,
  useSelectedEnterpriseUUIDByUserRoles,
  useEnterpriseCustomerSlugByUUID,
} from './data/hooks';

const EnterpriseCustomerRedirect = () => {
  const { authenticatedUser } = useContext(AppContext);
  const { userId, roles } = authenticatedUser;
  const { enterpriseCustomers, isLoading } = useEnterpriseCustomersForUser(userId);
  const selectedEnterpriseUUID = useSelectedEnterpriseUUIDByUserRoles(roles);
  const selectedEnterpriseSlug = useEnterpriseCustomerSlugByUUID(selectedEnterpriseUUID, enterpriseCustomers);

  if (isLoading) {
    return (
      <div className="py-5">
        <LoadingSpinner screenReaderText="loading my linked organizations" />
      </div>
    );
  }

  if (!selectedEnterpriseSlug) {
    return <NotFoundPage />;
  }

  return <Redirect to={`/${selectedEnterpriseSlug}`} />;
};

export default EnterpriseCustomerRedirect;
