import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resolveBFFQuery } from '../../routes/data/utils';

/**
 * Uses the route to determine which API call to make for the BFF
 * Populates the queryKey with the appropriate enterprise customer uuid once BFF call is resolved
 * @param queryOptions
 * @returns  {Types.UseQueryResult}} The query results for the routes BFF.
 */
export function useBFF(queryOptions = {}) {
  const { select, ...queryOptionsRest } = queryOptions;
  const location = useLocation();
  const params = useParams();
  // Determine the BFF query to use based on the current location
  const matchedBFFQuery = resolveBFFQuery(location.pathname);
  return useQuery({
    ...matchedBFFQuery(params),
    ...queryOptionsRest,
    select: (data) => {
      if (!data) {
        return data;
      }

      // TODO: Determine if returned data needs further transformations
      const transformedData = structuredClone(data);
      if (select) {
        return select({
          original: data,
          transformed: transformedData,
        });
      }
      return transformedData;
    },
  });
}
