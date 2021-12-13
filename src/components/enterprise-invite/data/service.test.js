import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { postLinkEnterpriseLearner } from './service';

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onAny().reply(200);
axios.post = jest.fn();

const TEST_INVITE_KEY_UUID = 'test-invite-key-uuid';

describe('enterprise customer invite key service', () => {
  it('links user', () => {
    const url = `http://localhost:18000/enterprise/api/v1/enterprise-customer-invite-key/${TEST_INVITE_KEY_UUID}/link-user/`;
    postLinkEnterpriseLearner(TEST_INVITE_KEY_UUID);
    expect(axios.post).toBeCalledWith(url);
  });
});
