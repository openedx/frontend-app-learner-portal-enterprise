import { queries } from '../../../../../../utils/queryKeyFactory';

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.subsidies
 * ._ctx.subscriptions
 * @returns
 */
export default function querySubscriptions(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.subscriptions;
}
