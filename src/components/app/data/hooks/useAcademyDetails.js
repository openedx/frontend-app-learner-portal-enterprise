import { useParams } from 'react-router-dom';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { queryAcademiesDetail } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export default function useAcademyDetails() {
  const { academyUUID } = useParams();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useSuspenseQuery(
    queryOptions({
      ...queryAcademiesDetail(academyUUID, enterpriseCustomer.uuid),
    }),
  );
}
