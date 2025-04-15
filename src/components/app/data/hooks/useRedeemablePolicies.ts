import { useSuspenseQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryRedeemablePolicies } from '../queries';

type UseRedeemablePoliciesQueryOptions = {
  select?: (data: unknown) => unknown;
};

export default function useRedeemablePolicies(queryOptions: UseRedeemablePoliciesQueryOptions = {}) {
  const { authenticatedUser: { userId: lmsUserId } }: AppContextValue = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  const { select } = queryOptions;
  return useSuspenseQuery({
    ...queryRedeemablePolicies({
      enterpriseUuid: enterpriseCustomer.uuid,
      lmsUserId,
    }),
    select,
  });
}
