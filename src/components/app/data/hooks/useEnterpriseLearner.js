import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { queryEnterpriseLearner } from '../queries';
import { useSuspenseBFF } from './useBFF';

/**
 * Retrieves the enterprise learner data for the authenticated user.
 * @param {object} queryOptions - The query options.
 * @returns The query results for the enterprise learner data.
 */
export default function useEnterpriseLearner(queryOptions = {}) {
  const { authenticatedUser } = useContext(AppContext);
  const { enterpriseSlug } = useParams();
  const { select } = queryOptions;

  return useSuspenseBFF({
    bffQueryOptions: {
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
      select: (data) => {
        // To maintain parity with BFF-enabled routes in the function signature passed to the custom `select`
        // function, the legacy `queryEnterpriseLearner` also passes its `data` to the custom `select` function
        // as both the `original` and `transformed` properties, since no data transformations occur here.
        if (select) {
          return select({
            original: data,
            transformed: data,
          });
        }
        return data;
      },
    },
  });
}
