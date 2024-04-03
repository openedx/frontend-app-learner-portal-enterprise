import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryEnterpriseProgram } from '../queries';

/**
 * Retrieves the course details related to the programs page.
 * @param {Types.UseQueryOptions} queryOptions - The query options.
 * @returns {Types.UseQueryResult} The query results for the browse and request configuration.
 */
export default function useProgramDetails(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { programUUID } = useParams();
  return useQuery({
    ...queryEnterpriseProgram(enterpriseCustomer.uuid, programUUID),
    ...queryOptions,
  });
}
