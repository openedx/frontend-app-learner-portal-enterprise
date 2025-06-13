import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryCanRequest } from '../queries';

/**
 * Retrieves the can_request eligibility for the given enterprise customer and course key.
 * @returns The query results for the can_request eligibility.
 */
export default function useCourseCanRequestEligibility() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  const { courseKey } = useParams();

  return useQuery({
    ...queryCanRequest(enterpriseCustomer.uuid, courseKey!),
  });
}
