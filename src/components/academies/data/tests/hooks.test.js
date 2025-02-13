import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useAcademyPathwayData } from '../hooks';

jest.mock('axios');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: jest.fn(),
  getAuthenticatedHttpClient: jest.fn(),
}));
jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => ({
    LMS_BASE_URL: process.env.LMS_BASE_URL,
    ENTERPRISE_CATALOG_API_BASE_URL: process.env.ENTERPRISE_CATALOG_API_BASE_URL,
  })),
}));

jest.mock('@edx/frontend-platform/auth');
getAuthenticatedHttpClient.mockReturnValue(axios);

jest.mock('../../../pathway/data/service', () => jest.fn().mockImplementation(() => ({
  fetchLearnerPathwayData: jest.fn().mockResolvedValue({
    title: 'Pathway Title',
    overview: 'Pathway Overview',
    pathwayUuid: '1234',
  }),
})));

describe('useAcademyPathwayData', () => {
  const academyUUID = '123456';
  const courseIndex = {
    search: jest.fn(),
  };

  beforeEach(() => {
    axios.mockClear();
    courseIndex.search.mockClear();
  });

  it('fetches pathway data successfully', async () => {
    courseIndex.search.mockResolvedValue({
      hits: [{ uuid: '1234' }],
      nbHits: 1,
    });

    const { result } = renderHook(() => useAcademyPathwayData(academyUUID, courseIndex));
    expect(result.current).toEqual([{ title: undefined, overview: undefined, pathwayUuid: undefined }, true, null]);
    await waitFor(() => {
      expect(result.current).toEqual([{ title: 'Pathway Title', overview: 'Pathway Overview', pathwayUuid: '1234' }, false, null]);
    });
  });

  it('handles error during data fetching', async () => {
    const errorMessage = 'Failed to fetch data';
    courseIndex.search.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAcademyPathwayData(academyUUID, courseIndex));
    expect(result.current).toEqual([{ title: undefined, overview: undefined, pathwayUuid: undefined }, true, null]);
    await waitFor(() => {
      expect(result.current).toEqual([
        { title: undefined, overview: undefined, pathwayUuid: undefined },
        false, new Error(errorMessage),
      ]);
    });
  });

  it('handle case when we not get any pathway data from algolia', async () => {
    courseIndex.search.mockResolvedValue({
      hits: [],
      nbHits: 0,
    });

    const { result } = renderHook(() => useAcademyPathwayData(academyUUID, courseIndex));
    expect(result.current).toEqual([{ title: undefined, overview: undefined, pathwayUuid: undefined }, true, null]);
    await waitFor(() => {
      expect(result.current).toEqual([
        {},
        false, null,
      ]);
    });
  });
});
