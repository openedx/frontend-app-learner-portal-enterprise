import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import NotFoundPage from '../NotFoundPage';
import { LoadingSpinner } from '../loading-spinner';

import {
  useEnterpriseCustomerByUUID,
  useSelectedEnterpriseUUIDByUserRoles,
} from './data/hooks';

const EnterpriseCustomerRedirect = () => {
  const { authenticatedUser } = useContext(AppContext);
  const { roles } = authenticatedUser;
  const selectedEnterpriseUUID = useSelectedEnterpriseUUIDByUserRoles(roles);
  const [enterpriseCustomer, isLoading] = useEnterpriseCustomerByUUID(selectedEnterpriseUUID);

  if (isLoading) {
    return (
      <div className="py-5">
        <LoadingSpinner screenReaderText="loading linked organizations" />
      </div>
    );
  }

  if (!enterpriseCustomer?.slug) {
    return <NotFoundPage />;
  }

  return <Redirect to={`/${enterpriseCustomer.slug}`} />;
};

export default EnterpriseCustomerRedirect;
