import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryRedeemablePolicies } from '../queries';

export default function useRedeemablePolicies(queryOptions = {}) {
  const { authenticatedUser: { userId: lmsUserId } } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryRedeemablePolicies({
      enterpriseUuid: enterpriseCustomer.uuid,
      lmsUserId,
    }),
    ...queryOptions,
  });
}
