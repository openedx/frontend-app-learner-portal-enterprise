import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryAcademiesDetail } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export default function useAcademyDetails(queryOptions = {}) {
  const { academyUUID } = useParams();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryAcademiesDetail(academyUUID, enterpriseCustomer.uuid),
    ...queryOptions,
  });
}
