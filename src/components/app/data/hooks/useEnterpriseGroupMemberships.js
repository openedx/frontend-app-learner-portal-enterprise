import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';

import { queryEnterpriseGroupMemberships } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export default function useEnterpriseGroupMemberships(queryOptions = {}) {
  const { authenticatedUser: { email } } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryEnterpriseGroupMemberships(enterpriseCustomer.uuid, email),
    ...queryOptions,
  });
}
