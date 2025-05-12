import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';
import { transformVideoData } from '../../../microlearning/data/utils';

export const fetchVideoDetail = async (edxVideoID) => {
  const { ENTERPRISE_CATALOG_API_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/videos/${edxVideoID}`;

  const result = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(transformVideoData(result?.data || {}));
};
