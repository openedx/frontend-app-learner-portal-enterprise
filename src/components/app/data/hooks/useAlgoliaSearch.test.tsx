import { Suspense } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { getConfig } from '@edx/frontend-platform';
import dayjs from 'dayjs';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import { generateTestPermutations, queryClient } from '../../../../utils/tests';
import {
  fetchEnterpriseLearnerAcademy,
  fetchEnterpriseLearnerDashboard,
  fetchEnterpriseLearnerSearch,
  fetchEnterpriseLearnerSkillsQuiz,
} from '../services';
import useAlgoliaSearch from './useAlgoliaSearch';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useEnterpriseFeatures from './useEnterpriseFeatures';

// config
const APP_CONFIG = {
  ALGOLIA_SEARCH_API_KEY: 'test-algolia-api-key',
  ALGOLIA_INDEX_NAME_JOBS: 'unsupported-index-name',
  ALGOLIA_INDEX_NAME: 'test-algolia-index',
  ALGOLIA_APP_ID: 'test-algolia-app-id',
};

jest.mock('./useEnterpriseCustomer');
jest.mock('./useEnterpriseFeatures');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseLearnerDashboard: jest.fn(),
  fetchEnterpriseLearnerSearch: jest.fn(),
  fetchEnterpriseLearnerAcademy: jest.fn(),
  fetchEnterpriseLearnerSkillsQuiz: jest.fn(),
}));
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(),
}));
const mockedUseEnterpriseCustomer = useEnterpriseCustomer as jest.Mock;
const mockedUseEnterpriseFeatures = useEnterpriseFeatures as jest.Mock;

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const mockCatalogUuidsToCatalogQueryUuids = Array.from({ length: 3 }, () => [uuidv4(), uuidv4()]);
const mockEmptyBaseAlgoliaData = {
  algolia: {
    securedAlgoliaApiKey: null,
    validUntil: null,
  },
  catalogUuidsToCatalogQueryUuids: {},
};
const mockBaseAlgoliaData = {
  catalogUuidsToCatalogQueryUuids: Object.fromEntries(mockCatalogUuidsToCatalogQueryUuids),
  algolia: {
    securedAlgoliaApiKey: 'test-algolia-api-key',
    validUntil: dayjs().add(1, 'hour'),
  },
};
const mockBaseBFFData = {
  ...mockBaseAlgoliaData,
  enterpriseCustomer: mockEnterpriseCustomer,
  errors: [],
  warnings: [],
};

const mockBFFSearchData = {
  ...mockBaseBFFData,
};

const mockBFFAcademyData = {
  ...mockBaseBFFData,
};

const mockBFFSkillsQuizData = {
  ...mockBaseBFFData,
};

const expectedOutputBasedOnIndex = ({ isMatchedRoute, isCatalogQueryFiltersEnabled, indexName }) => {
  const unsupportedIndexes = [APP_CONFIG.ALGOLIA_INDEX_NAME_JOBS];
  const isIndexSupported = !unsupportedIndexes.includes(indexName);
  return isCatalogQueryFiltersEnabled && isIndexSupported && isMatchedRoute
    ? {
      catalogUuidsToCatalogQueryUuids: mockBaseAlgoliaData.catalogUuidsToCatalogQueryUuids,
      searchClient: expect.objectContaining({
        appId: APP_CONFIG.ALGOLIA_APP_ID,
      }),
      searchIndex: expect.objectContaining({
        appId: APP_CONFIG.ALGOLIA_APP_ID,
      }),
      shouldUseSecuredAlgoliaApiKey: true,
    }
    : {
      catalogUuidsToCatalogQueryUuids: mockEmptyBaseAlgoliaData.catalogUuidsToCatalogQueryUuids,
      searchClient: expect.objectContaining({
        appId: APP_CONFIG.ALGOLIA_APP_ID,
      }),
      searchIndex: expect.objectContaining({
        appId: APP_CONFIG.ALGOLIA_APP_ID,
      }),
      shouldUseSecuredAlgoliaApiKey: false,
    };
};

const matchQueryFnToURLPattern = ({ enterpriseSlug, queryFnToMatch }) => {
  const queryFnToURLPattern = [{
    route: `/${enterpriseSlug}`,
    queryFn: fetchEnterpriseLearnerDashboard,
  },
  {
    route: `/${enterpriseSlug}/search/`,
    queryFn: fetchEnterpriseLearnerSearch,
  },
  {
    route: `/${enterpriseSlug}/academies/academy-uuid`,
    queryFn: fetchEnterpriseLearnerAcademy,
  },
  {
    route: `/${enterpriseSlug}/skills-quiz`,
    queryFn: fetchEnterpriseLearnerSkillsQuiz,
  },
  ];
  const matchedQueryFnToRoute = queryFnToURLPattern.find(({ queryFn }) => queryFn === queryFnToMatch);
  return matchedQueryFnToRoute?.route;
};

describe('useAlgoliaSearch', () => {
  const Wrapper = ({
    initialEntries = [], children,
  }: { initialEntries?: string[] | undefined; children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient()}>
      <Suspense fallback={<div>Loading...</div>}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path=":enterpriseSlug" element={children} />
            <Route path=":enterpriseSlug/search" element={children} />
            <Route path=":enterpriseSlug/academies/:academyUUID" element={children} />
            <Route path=":enterpriseSlug/skills-quiz" element={children} />
            <Route path=":enterpriseSlug/unsupported-bff-route" element={children} />
          </Routes>
        </MemoryRouter>
      </Suspense>
    </QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseEnterpriseCustomer.mockReturnValue({
      data: mockEnterpriseCustomer,
    });
    (fetchEnterpriseLearnerDashboard as jest.Mock).mockResolvedValue(mockBaseBFFData);
    (fetchEnterpriseLearnerSearch as jest.Mock).mockResolvedValue(mockBFFSearchData);
    (fetchEnterpriseLearnerAcademy as jest.Mock).mockResolvedValue(mockBFFAcademyData);
    (fetchEnterpriseLearnerSkillsQuiz as jest.Mock).mockResolvedValue(mockBFFSkillsQuizData);
    getConfig.mockReturnValue(APP_CONFIG);
  });

  it.each([
    // BFF Disabled Routes
    ...generateTestPermutations({
      isMatchedBFFRoute: [false],
      indexName: [
        APP_CONFIG.ALGOLIA_INDEX_NAME,
        APP_CONFIG.ALGOLIA_INDEX_NAME_JOBS,
      ],
      isCatalogQueryFiltersEnabled: [true],
    }),
    // BFF Enabled Routes
    ...generateTestPermutations({
      isMatchedBFFRoute: [true],
      bffServiceFn: [
        fetchEnterpriseLearnerDashboard,
        fetchEnterpriseLearnerSearch,
        fetchEnterpriseLearnerAcademy,
        fetchEnterpriseLearnerSkillsQuiz,
      ],
      indexName: [
        APP_CONFIG.ALGOLIA_INDEX_NAME,
        APP_CONFIG.ALGOLIA_INDEX_NAME_JOBS,
      ],
      isCatalogQueryFiltersEnabled: [true],
    }),
  ])('should handle resolved value correctly for based on route (%s)', async ({
    isMatchedBFFRoute,
    bffServiceFn,
    indexName,
    isCatalogQueryFiltersEnabled,
  }) => {
    const initialEntries = isMatchedBFFRoute ? [matchQueryFnToURLPattern({
      enterpriseSlug: mockEnterpriseCustomer.slug,
      queryFnToMatch: bffServiceFn,
    })] : ['/test-enterprise/unsupported-bff-route'];
    const expectedData = expectedOutputBasedOnIndex(
      {
        isMatchedRoute: isMatchedBFFRoute,
        isCatalogQueryFiltersEnabled,
        indexName,
      },
    );
    const mockedEnterpriseFeatures = {
      catalogQuerySearchFiltersEnabled: isCatalogQueryFiltersEnabled,
    };
    (mockedUseEnterpriseFeatures as jest.Mock).mockReturnValue({
      data: mockedEnterpriseFeatures,
    });

    const { result } = renderHook(
      () => useAlgoliaSearch(indexName),
      {
        wrapper: ({ children }) => (
          <Wrapper initialEntries={initialEntries.filter((entry): entry is string => entry !== undefined)}>
            {children}
          </Wrapper>
        ),
      },
    );
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining(expectedData),
      );
    });
  });
});
