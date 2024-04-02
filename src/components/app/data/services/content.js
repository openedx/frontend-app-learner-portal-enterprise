import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { validate as isValidUUID } from 'uuid';

/**
  * This API call will *only* obtain the enterprise's catalog(s) whose catalog queries
  * contain the specified `contentIdentifier`.
  *
  * The API currently supports either `course_run_ids` or `program_uuids` as the query
  * parameters. Course keys are compatible with the `course_run_ids` parameter, as the
  * `parent_content_key` is checked by the API.
  * */
export async function fetchEnterpriseCustomerContainsContent(enterpriseId, contentIdentifiers) {
  const contentIdentifiersMap = {
    course: [],
    program: [],
  };
  contentIdentifiers.forEach((contentIdentifier) => {
    if (isValidUUID(contentIdentifier)) {
      contentIdentifiersMap.program.push(contentIdentifier);
    } else {
      contentIdentifiersMap.course.push(contentIdentifier);
    }
  });
  const queryParams = new URLSearchParams({
    get_catalogs_containing_specified_content_ids: true,
  });
  if (contentIdentifiersMap.course.length > 0) {
    queryParams.append('course_run_ids', contentIdentifiersMap.course.join(','));
  }
  if (contentIdentifiersMap.program.length > 0) {
    queryParams.append('program_uuids', contentIdentifiersMap.program.join(','));
  }

  const url = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${enterpriseId}/contains_content_items/?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(response.data);
  } catch (error) {
    logError(error);
    return {
      containsContentItems: false,
      catalogList: [],
    };
  }
}
