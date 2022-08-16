import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { snakeCaseObject, camelCaseObject } from '@edx/frontend-platform/utils';

/**
 * Retrieves the executive education (2U) course content metadata for the specified course uuid.
 *
 * @param {string} courseUUID Course UUID to retreieve the course content metadata for
 * @param {object} options Optional options. Keys will automatically be snakecased.
 *
 * @returns An object containing the course content metadata for the specified course.
 */
export async function getExecutiveEducation2UContentMetadata(courseUUID, options = {}) {
  const config = getConfig();
  const queryParams = new URLSearchParams({
    uuids: courseUUID,
    ...snakeCaseObject(options),
  });
  const url = `${config.DISCOVERY_API_BASE_URL}/api/v1/courses/?${queryParams.toString()}}`;
  const res = await getAuthenticatedHttpClient().get(url);
  const contentMetadata = camelCaseObject(res.data.results[0]);
  return contentMetadata;
}
