import { queries } from '../../../../utils/queryKeyFactory';

/**
 * Helper function to assist querying with useQuery package
 *
 * @returns {QueryObject} - The query object for notices.
 * @property {[string]} QueryObject.queryKey - The query key for the object
 * @property {func} QueryObject.queryFn - The asynchronous API request "fetchNotices"
 */
export default function queryNotices() {
  return queries.notices.unacknowledged;
}
