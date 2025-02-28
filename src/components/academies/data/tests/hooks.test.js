import { renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useAcademyMetadata, useAcademies } from '../hooks';
import { getAcademies, getAcademyMetadata } from '../service';

jest.mock('axios');

const ACADEMY_UUID = 'b48ff396-03b4-467f-a4cc-da4327156984';
const ACADEMY_MOCK_DATA = {
  uuid: ACADEMY_UUID,
  title: 'Awesome Academy',
  short_description: 'show description of awesome academy.',
  long_description: 'I am an awesome academy.',
  image: 'example.com/academies/images/awesome-academy.png',
  tags: [
    {
      id: 111,
      title: 'wowwww',
      description: 'description 111',
    },
    {
      id: 222,
      title: 'boooo',
      description: 'description 222',
    },
  ],
};
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
jest.mock('../service.js', () => ({
  getAcademyMetadata: jest.fn(),
  getAcademies: jest.fn(),
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

describe('useAcademyMetadata', () => {
  it('returns academy metadata', async () => {
    getAcademyMetadata.mockReturnValue(ACADEMY_MOCK_DATA);
    const { result, waitForNextUpdate } = renderHook(() => useAcademyMetadata(ACADEMY_UUID));

    expect(result.current[0]).toEqual({});
    expect(result.current[1]).toEqual(true);
    expect(result.current[2]).toEqual(false);
    await waitForNextUpdate();
    expect(result.current[0]).toEqual(ACADEMY_MOCK_DATA);
  });

  it('returns academies list', async () => {
    getAcademies.mockReturnValue([ACADEMY_MOCK_DATA]);
    const { result, waitForNextUpdate } = renderHook(() => useAcademies(ACADEMY_UUID));
    expect(result.current[0]).toEqual([]);
    expect(result.current[1]).toEqual(true);
    expect(result.current[2]).toEqual(null);
    await waitForNextUpdate();
    expect(result.current[0].length).toEqual(1);
    expect(result.current[0][0].uuid).toEqual(ACADEMY_UUID);
  });
});
