import { queries } from '../../../../../utils/queryKeyFactory';

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.course
 * ._ctx.contentMetadata(courseKey)
 * @returns
 */
export default function queryCourseMetadata(enterpriseUuid, courseKey) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.course
    ._ctx.contentMetadata(courseKey);
}
