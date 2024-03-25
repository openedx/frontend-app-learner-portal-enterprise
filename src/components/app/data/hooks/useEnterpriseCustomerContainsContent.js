import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { queryEnterpriseCustomerCatalogsContainsContent } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

/**
 * TODO
 * @returns
 */
export default function useEnterpriseCustomerContainsContent(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { courseKey } = useParams();
  return useQuery({
    ...queryEnterpriseCustomerCatalogsContainsContent(enterpriseCustomer.uuid, courseKey),
    ...queryOptions,
  });
}
