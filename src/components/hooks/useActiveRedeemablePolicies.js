import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { queryRedeemablePolicies } from '../app/routes/data';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export default function useActiveRedeemablePolicies() {
  const { authenticatedUser: { userId: lmsUserId } } = useContext(AppContext);
  const { uuid: enterpriseUuid } = useEnterpriseCustomer();
  const { data } = useQuery(queryRedeemablePolicies({ enterpriseUuid, lmsUserId }));
  return {
    activeRedeemablePolicies: data.redeemablePolicies.filter(policy => policy.active),
  };
}
