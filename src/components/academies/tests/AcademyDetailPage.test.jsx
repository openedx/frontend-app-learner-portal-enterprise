import axios from 'axios';
import { screen, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom/extend-expect';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { LEARNING_TYPE_COURSE } from '@edx/frontend-enterprise-catalog-search/data/constants';
import { AppContext } from '@edx/frontend-platform/react';
import { generateTestPermutations, renderWithRouter } from '../../../utils/tests';

import AcademyDetailPage from '../AcademyDetailPage';
import { useAcademyDetails, useAlgoliaSearch, useEnterpriseCustomer } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { messages } from '../../search-unavailable-alert/SearchUnavailableAlert';

// config
const APP_CONFIG = {
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
};

// test data
const ACADEMY_UUID = 'b48ff396-03b4-467f-a4cc-da4327156984';
const ACADEMY_MOCK_DATA = {
  uuid: ACADEMY_UUID,
  title: 'My Awesome Academy',
  longDescription: 'I am an awesome academy.',
  image: 'example.com/academies/images/awesome-academy.png',
  tags: [
    {
      id: 111,
      title: 'wowwww',
      titleEn: 'wowwww_en',
      description: 'description 111',
    },
    {
      id: 222,
      title: 'boooo',
      titleEn: 'boooo_en',
      description: 'description 222',
    },
  ],
};
const ALOGLIA_MOCK_DATA = {
  hits: [
    {
      aggregationKey: 'course:MAX+CS50x',
      learningType: LEARNING_TYPE_COURSE,
      cardImageUrl: 'ocm-course-card-url',
      title: 'ocm course title',
    },
  ],
  nbHits: 1,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ enterpriseSlug: 'test-enterprise-uuid', academyUUID: ACADEMY_UUID }),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => APP_CONFIG),
}));
jest.mock('@edx/frontend-platform/auth');
getAuthenticatedHttpClient.mockReturnValue(axios);

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useAlgoliaSearch: jest.fn(),
  useAcademyDetails: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();

const appContextValue = {
  authenticatedUser: mockAuthenticatedUser,
};

const AcademyDetailPageWrapper = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={appContextValue}>
      <AcademyDetailPage />
    </AppContext.Provider>
  </IntlProvider>
);

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockSearchFn = jest.fn().mockResolvedValue(ALOGLIA_MOCK_DATA);

describe('<AcademyDetailPage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useAlgoliaSearch.mockReturnValue({
      searchClient: { search: mockSearchFn },
      searchIndex: { search: mockSearchFn },
      shouldUseSecuredAlgoliaApiKey: false,
    });
    useAcademyDetails.mockReturnValue({ data: ACADEMY_MOCK_DATA });
  });

  it('renders academy detail page', async () => {
    renderWithRouter(<AcademyDetailPageWrapper />);

    const headingElement = await screen.findByTestId('academy-all-courses-title');
    const expectedHeadingElement = `All ${ACADEMY_MOCK_DATA.title} Academy Courses`;
    expect(headingElement.textContent).toBe(expectedHeadingElement);
    const academyTags = screen.getAllByTestId('academy-tag').map((tag) => tag.textContent);
    expect(academyTags).toEqual(['wowwww', 'boooo']);
    expect(screen.getByTestId('academy-ocm-courses-title')).toHaveTextContent('Self-paced courses');
    expect(screen.getByTestId('academy-ocm-courses-subtitle')).toHaveTextContent(
      'A collection of courses that cover essential knowledge on the subject. These courses offer flexible schedules and independent study.',
    );
    expect(screen.getAllByTestId('academy-course-card').length).toEqual(1);
    expect(screen.getByText(ALOGLIA_MOCK_DATA.hits[0].title)).toBeInTheDocument();
  });

  it('renders a not found page', () => {
    useAcademyDetails.mockReturnValue({ data: null });
    renderWithRouter(<AcademyDetailPageWrapper />);
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });

  it.each(
    generateTestPermutations({
      shouldUseSecuredAlgoliaApiKey: [true, false],
      searchClient: [null, { search: mockSearchFn }],
    }),
  )('renders a search client failure error if the search client fails (%s)', async ({
    shouldUseSecuredAlgoliaApiKey,
    searchClient,
  }) => {
    useAlgoliaSearch.mockReturnValue({
      searchIndex: { search: mockSearchFn },
      shouldUseSecuredAlgoliaApiKey,
      searchClient,
    });
    useAcademyDetails.mockReturnValue({ data: ACADEMY_MOCK_DATA });
    renderWithRouter(<AcademyDetailPageWrapper />);

    await waitFor(() => {
      if (!searchClient) {
        expect(screen.getByText(messages.alertHeading.defaultMessage)).toBeInTheDocument();
        expect(screen.getByText(messages.alertText.defaultMessage)).toBeInTheDocument();
        expect(screen.getByText(messages.alertTextOptionsHeader.defaultMessage)).toBeInTheDocument();
        expect(screen.getByText(messages.alertTextOptionRefresh.defaultMessage)).toBeInTheDocument();
        expect(screen.getByText(messages.alertTextOptionNetwork.defaultMessage)).toBeInTheDocument();
        expect(screen.getByText(messages.alertTextOptionSupport.defaultMessage)).toBeInTheDocument();
      } else {
        expect(screen.queryByText(messages.alertHeading.defaultMessage)).not.toBeInTheDocument();
        expect(screen.queryByText(messages.alertText.defaultMessage)).not.toBeInTheDocument();
        expect(screen.queryByText(messages.alertTextOptionsHeader.defaultMessage)).not.toBeInTheDocument();
        expect(screen.queryByText(messages.alertTextOptionRefresh.defaultMessage)).not.toBeInTheDocument();
        expect(screen.queryByText(messages.alertTextOptionNetwork.defaultMessage)).not.toBeInTheDocument();
        expect(screen.queryByText(messages.alertTextOptionSupport.defaultMessage)).not.toBeInTheDocument();
      }
    });
  });

  it('filters courses by tag using titleEn', async () => {
    renderWithRouter(<AcademyDetailPageWrapper />);

    const tagButton = await screen.findByText('wowwww');
    tagButton.click();

    await waitFor(() => {
      expect(mockSearchFn).toHaveBeenCalledWith('', expect.objectContaining({
        facetFilters: expect.arrayContaining([
          'academy_tags:wowwww_en',
        ]),
      }));
    });
  });
});
