import { queries } from '../../../../utils/queryKeyFactory';

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.contentHighlights
 * ._ctx.configuration
 * @returns
 */
export default function queryContentHighlightsConfiguration(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.contentHighlights
    ._ctx.configuration;
}
