import { useParams } from 'react-router-dom';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { queryVideoDetail } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export default function useVideoDetails() {
  const { videoUUID } = useParams();
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  return useSuspenseQuery(
    queryOptions({
      ...queryVideoDetail(videoUUID as string, enterpriseCustomer.uuid),
    }),
  );
}
