/* eslint-disable no-underscore-dangle */
import { queries } from '../../../../utils/queryKeyFactory';

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseLearner(username, enterpriseSlug)
 * @returns
 */
export default function queryEnterpriseLearner(username, enterpriseSlug) {
  return queries
    .enterprise
    .enterpriseLearner(username, enterpriseSlug);
}
