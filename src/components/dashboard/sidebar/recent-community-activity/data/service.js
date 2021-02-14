import qs from 'query-string';
import { getConfig } from '@edx/frontend-platform';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const fetchRecentCommunityActivityFeed = () => {
  const config = getConfig();
  // TODO: limit this to most recent 5 activities
  const url = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-activity/`;
  return getAuthenticatedHttpClient().get(url);
};

export const fetchEnterpriseLearnerCommunityStatus = (options) => {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-learner/?${qs.stringify(options)}`;
  return getAuthenticatedHttpClient().get(url)
    .then((response) => {
      const { results } = camelCaseObject(response.data);
      const enterpriseLearner = results.pop();
      return !!enterpriseLearner?.isCommunityMember;
    });
};

const updateEnterpriseLearnerCommunityStatus = (options) => {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-learner/`;
  return getAuthenticatedHttpClient().post(url, options)
    .then((response) => {
      const enterpriseLearner = camelCaseObject(response.data);
      return !!enterpriseLearner?.isCommunityMember;
    });
};

export const joinEnterpriseCustomerCommunity = (options) => updateEnterpriseLearnerCommunityStatus({
  ...options,
  is_community_member: true,
});

export const leaveEnterpriseCustomerCommunity = (options) => updateEnterpriseLearnerCommunityStatus({
  ...options,
  is_community_member: false,
});
