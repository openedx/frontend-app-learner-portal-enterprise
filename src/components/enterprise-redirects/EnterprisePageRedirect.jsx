import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import NotFoundPage from '../NotFoundPage';
import { LoadingSpinner } from '../loading-spinner';

import {
  useEnterpriseCustomerByUUID,
  useSelectedEnterpriseUUIDByUserRoles,
} from './data/hooks';

const EnterprisePageRedirect = () => {
  const { authenticatedUser } = useContext(AppContext);
  const { pathname } = useLocation();
  const redirectPath = pathname.substring(3);
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

  if (!redirectPath) {
    return <Navigate to={`/${enterpriseCustomer.slug}`} />;
  }

  return <Navigate to={`/${enterpriseCustomer.slug}/${redirectPath}`} />;
};

export default EnterprisePageRedirect;
