import { useParams } from 'react-router-dom';
import { useSuspenseQuery } from '@tanstack/react-query';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryEnterpriseProgram } from '../queries';

/**
 * Retrieves the course details related to the programs page.
 * @returns The query results for the browse and request configuration.
 */
export default function useProgramDetails() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  const params = useParams();
  const programUUID = params.programUUID!;
  return useSuspenseQuery({
    ...queryEnterpriseProgram(enterpriseCustomer.uuid, programUUID),
  });
}
