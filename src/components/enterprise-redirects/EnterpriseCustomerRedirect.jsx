import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import NotFoundPage from '../NotFoundPage';
import { LoadingSpinner } from '../loading-spinner';

import {
  useEnterpriseCustomerByUUID,
  useSelectedEnterpriseUUIDByUserRoles,
} from './data/hooks';

const EnterpriseCustomerRedirect = () => {
  const { authenticatedUser: { roles } } = useContext(AppContext);
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

  return <Navigate to={`/${enterpriseCustomer.slug}`} replace />;
};

export default EnterpriseCustomerRedirect;
