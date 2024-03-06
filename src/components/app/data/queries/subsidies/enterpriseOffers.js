import queries from '../queryKeyFactory';

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.subsidies
 * ._ctx.enterpriseOffers
 * @returns
 */
export default function queryEnterpriseLearnerOffers(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.enterpriseOffers;
}
