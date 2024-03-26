import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { v4 as uuidv4 } from 'uuid';

import { enterpriseCustomerFactory } from './data/__factories__';
import { fetchEnterpriseCustomerContainsContent } from './content';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const APP_CONFIG = {
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
};
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => APP_CONFIG),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));

const mockCourseKey = 'test-course-key-1';
const mockCatalogUUID = uuidv4();

describe('fetchEnterpriseCustomerContainsContent', () => {
  const queryParams = new URLSearchParams({
    get_catalogs_containing_specified_content_ids: true,
    course_run_ids: mockCourseKey,
  });
  const CONTAINS_CONTENT_ITEMS_URL = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${mockEnterpriseCustomer.uuid}/contains_content_items/?${queryParams.toString()}`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('returns expected contains_content_items response', async () => {
    const mockResponse = {
      containsContentItems: true,
      catalogList: [mockCatalogUUID],
    };
    axiosMock.onGet(CONTAINS_CONTENT_ITEMS_URL).reply(200, mockResponse);
    const result = await fetchEnterpriseCustomerContainsContent(mockEnterpriseCustomer.uuid, [mockCourseKey]);
    expect(result).toEqual(mockResponse);
  });

  it('catches error and returns empty list', async () => {
    axiosMock.onGet(CONTAINS_CONTENT_ITEMS_URL).reply(500);
    const result = await fetchEnterpriseCustomerContainsContent(mockEnterpriseCustomer.uuid, [mockCourseKey]);
    expect(result).toEqual({
      containsContentItems: false,
      catalogList: [],
    });
  });
});
