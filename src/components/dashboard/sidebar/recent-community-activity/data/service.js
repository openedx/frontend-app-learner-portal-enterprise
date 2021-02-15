import qs from 'query-string';
import { getConfig } from '@edx/frontend-platform';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const fetchRecentCommunityActivityFeed = () => {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-community-activity/`;
  return getAuthenticatedHttpClient().get(url)
    .then((response) => {
      const data = camelCaseObject(response.data);
      return data;
    });
};

export const fetchEnterpriseLearnerCommunityStatus = (options) => {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_customer_user/?${qs.stringify(options)}`;
  return getAuthenticatedHttpClient().get(url)
    .then((response) => {
      const enterpriseLearner = camelCaseObject(response.data);
      return !!enterpriseLearner?.isCommunityMember;
    });
};

const updateEnterpriseLearnerCommunityStatus = (options) => {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_customer_user/?${qs.stringify(options)}`;
  return getAuthenticatedHttpClient().patch(url)
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
