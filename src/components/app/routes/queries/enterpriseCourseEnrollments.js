import { queries } from '../../../../utils/queryKeyFactory';

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.enrollments
 * @returns
 */
export default function queryEnterpriseCourseEnrollments(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.enrollments;
}
