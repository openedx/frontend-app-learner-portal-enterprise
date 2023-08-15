import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

import { fetchEnterpriseOffers } from '../service';
import { ENTERPRISE_OFFER_STATUS, ENTERPRISE_OFFER_USAGE_TYPE } from '../constants';

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onAny().reply(200);
axios.get = jest.fn();

const TEST_ENTERPRISE_UUID = 'enterprise-uuid';

describe('fetchEnterpriseOffers', () => {
  const config = getConfig();

  it('fetches enterprise offers with the correct query params', () => {
    const queryParams = new URLSearchParams({
      usage_type: ENTERPRISE_OFFER_USAGE_TYPE.PERCENTAGE,
      discount_value: 100,
      status: ENTERPRISE_OFFER_STATUS.OPEN,
      page_size: 100,
    });
    const url = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/${TEST_ENTERPRISE_UUID}/enterprise-learner-offers/?${queryParams.toString()}`;
    fetchEnterpriseOffers(TEST_ENTERPRISE_UUID);
    expect(axios.get).toBeCalledWith(url);
  });
});
