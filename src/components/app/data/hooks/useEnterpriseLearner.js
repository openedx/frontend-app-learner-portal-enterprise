import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { queryEnterpriseLearner } from '../queries';
import useBFF from './useBFF';

/**
 * Retrieves the enterprise learner data for the authenticated user.
 * @param {Types.UseQueryOptions} queryOptions - The query options.
 * @returns {Types.UseQueryResult} The query results for the enterprise learner data.
 */
export default function useEnterpriseLearner(queryOptions = {}) {
  const { authenticatedUser } = useContext(AppContext);
  const { enterpriseSlug } = useParams();
  const { select, ...queryOptionsRest } = queryOptions;

  return useBFF({
    bffQueryOptions: {
      ...queryOptionsRest,
      select: (data) => {
        const transformedData = {
          enterpriseCustomer: data.enterpriseCustomer,
          allLinkedEnterpriseCustomerUsers: data.allLinkedEnterpriseCustomerUsers,
          enterpriseFeatures: data.enterpriseFeatures,
        };
        // When custom `select` function is provided in `queryOptions`, call it with original and transformed data.
        if (select) {
          return select({
            original: data,
            transformed: transformedData,
          });
        }

        // Otherwise, return the transformed data.
        return transformedData;
      },
    },
    fallbackQueryConfig: {
      ...queryEnterpriseLearner(authenticatedUser.username, enterpriseSlug),
      ...queryOptions,
    },
  });
}
