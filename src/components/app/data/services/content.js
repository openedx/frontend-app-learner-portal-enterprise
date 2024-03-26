import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';

/**
  * This API call will *only* obtain the enterprise's catalog(s) whose catalog queries
  * contain the specified `contentIdentifier`.
  *
  * The API currently supports either `course_run_ids` or `program_uuids` as the query
  * parameters. Course keys are compatible with the `course_run_ids` parameter, as the
  * `parent_content_key` is checked by the API.
  * */
export async function fetchEnterpriseCustomerContainsContent(enterpriseId, contentIdentifers) {
  const courseRunIds = contentIdentifers;
  const queryParams = new URLSearchParams({
    course_run_ids: courseRunIds,
    get_catalogs_containing_specified_content_ids: true,
  });

  const url = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${enterpriseId}/contains_content_items/?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(response.data);
  } catch (error) {
    logError(error);
    return null;
  }
}
