import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryVideoDetail } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export default function useVideoDetails() {
  const { videoUUID } = useParams();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryVideoDetail(videoUUID, enterpriseCustomer.uuid),
  });
}
