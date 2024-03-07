import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { fetchPaginatedData } from './utils';

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

describe('fetchPaginatedData', () => {
  const EXAMPLE_ENDPOINT = 'http://example.com/api/v1/data';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty data results', async () => {
    axiosMock.onGet(EXAMPLE_ENDPOINT).reply(200, {
      count: 0,
      prev: null,
      next: null,
      num_pages: 0,
      results: [],
    });
    const results = await fetchPaginatedData(EXAMPLE_ENDPOINT);
    expect(results).toEqual({
      results: [],
      response: {
        count: 0,
        prev: null,
        next: null,
        numPages: 0,
        results: [],
      },
    });
  });

  it('traverses pagination', async () => {
    const urlFirstPage = `${EXAMPLE_ENDPOINT}?page=1`;
    const urlSecondPage = `${EXAMPLE_ENDPOINT}?page=2`;
    const mockResult = {
      uuid: uuidv4(),
    };
    const mockSecondResult = {
      uuid: uuidv4(),
    };
    axiosMock.onGet(urlFirstPage).reply(200, {
      count: 2,
      prev: null,
      next: urlSecondPage,
      num_pages: 2,
      results: [mockResult],
    });
    axiosMock.onGet(urlSecondPage).reply(200, {
      count: 2,
      prev: null,
      next: null,
      num_pages: 2,
      results: [mockSecondResult],
      enterprise_features: {
        feature_a: true,
      },
    });
    const results = await fetchPaginatedData(urlFirstPage);
    expect(results).toEqual({
      results: [mockResult, mockSecondResult],
      response: {
        count: 2,
        prev: null,
        next: null,
        numPages: 2,
        results: [mockSecondResult],
        enterpriseFeatures: {
          featureA: true,
        },
      },
    });
  });
});
