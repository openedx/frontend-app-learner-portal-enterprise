import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryAcademiesDetail } from '../queries';

export default function useAcademyDetails(queryOptions = {}) {
  const { academyUUID } = useParams();
  return useQuery({
    ...queryAcademiesDetail(academyUUID),
    ...queryOptions,
  });
}
