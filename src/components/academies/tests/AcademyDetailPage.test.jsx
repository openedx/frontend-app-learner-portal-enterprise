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

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'es-419',
}));

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

  it('clears tag filter when clear button is clicked', async () => {
    renderWithRouter(<AcademyDetailPageWrapper />);

    // Click on a tag to filter
    const tagButton = await screen.findByText('wowwww');
    tagButton.click();

    // Wait for clear filter button to appear
    const clearButton = await screen.findByText('clear tag filter');
    expect(clearButton).toBeInTheDocument();

    // Click clear button
    clearButton.click();

    // Verify search is called without tag filter
    await waitFor(() => {
      expect(mockSearchFn).toHaveBeenCalledWith('', expect.objectContaining({
        facetFilters: expect.not.arrayContaining([
          expect.stringContaining('academy_tags:'),
        ]),
      }));
    });
  });

  it('shows loading spinner while fetching courses', () => {
    const mockSlowSearchFn = jest.fn(() => new Promise(() => {})); // Never resolves
    useAlgoliaSearch.mockReturnValue({
      searchClient: { search: mockSlowSearchFn },
      searchIndex: { search: mockSlowSearchFn },
      shouldUseSecuredAlgoliaApiKey: false,
    });

    renderWithRouter(<AcademyDetailPageWrapper />);

    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('shows "Show more" button when there are more than 4 OCM courses', async () => {
    const manyCoursesData = {
      hits: Array.from({ length: 6 }, (_, i) => ({
        aggregationKey: `course:MAX+CS50x-${i}`,
        learningType: LEARNING_TYPE_COURSE,
        cardImageUrl: `ocm-course-card-url-${i}`,
        title: `OCM Course ${i}`,
      })),
      nbHits: 6,
    };
    mockSearchFn.mockResolvedValue(manyCoursesData);
    useAlgoliaSearch.mockReturnValue({
      searchClient: { search: mockSearchFn },
      searchIndex: { search: mockSearchFn },
      shouldUseSecuredAlgoliaApiKey: false,
    });

    renderWithRouter(<AcademyDetailPageWrapper />);

    // Wait for courses to load
    await screen.findByTestId('academy-ocm-courses-title');

    // Should show "Show more" button
    const showMoreButton = screen.getByRole('button', { name: /Show more Self-paced courses \(6\)/ });
    expect(showMoreButton).toBeInTheDocument();

    // Should only show 4 courses initially
    const courseCards = screen.getAllByTestId('academy-course-card');
    expect(courseCards.length).toBe(4);
  });

  it('expands to show all OCM courses when "Show more" is clicked', async () => {
    const manyCoursesData = {
      hits: Array.from({ length: 6 }, (_, i) => ({
        aggregationKey: `course:MAX+CS50x-${i}`,
        learningType: LEARNING_TYPE_COURSE,
        cardImageUrl: `ocm-course-card-url-${i}`,
        title: `OCM Course ${i}`,
      })),
      nbHits: 6,
    };
    mockSearchFn.mockResolvedValue(manyCoursesData);
    useAlgoliaSearch.mockReturnValue({
      searchClient: { search: mockSearchFn },
      searchIndex: { search: mockSearchFn },
      shouldUseSecuredAlgoliaApiKey: false,
    });

    renderWithRouter(<AcademyDetailPageWrapper />);

    // Wait for courses to load
    await screen.findByTestId('academy-ocm-courses-title');

    // Click "Show more" button
    const showMoreButton = screen.getByRole('button', { name: /Show more Self-paced courses \(6\)/ });
    showMoreButton.click();

    // Should now show all 6 courses
    await waitFor(() => {
      const courseCards = screen.getAllByTestId('academy-course-card');
      expect(courseCards.length).toBe(6);
    });

    // Button text should change to "Show less"
    const showLessButton = screen.getByRole('button', { name: /Show less Self-paced courses/ });
    expect(showLessButton).toBeInTheDocument();
  });

  it('collapses courses when "Show less" is clicked', async () => {
    const manyCoursesData = {
      hits: Array.from({ length: 6 }, (_, i) => ({
        aggregationKey: `course:MAX+CS50x-${i}`,
        learningType: LEARNING_TYPE_COURSE,
        cardImageUrl: `ocm-course-card-url-${i}`,
        title: `OCM Course ${i}`,
      })),
      nbHits: 6,
    };
    mockSearchFn.mockResolvedValue(manyCoursesData);
    useAlgoliaSearch.mockReturnValue({
      searchClient: { search: mockSearchFn },
      searchIndex: { search: mockSearchFn },
      shouldUseSecuredAlgoliaApiKey: false,
    });

    renderWithRouter(<AcademyDetailPageWrapper />);

    // Wait for courses to load
    await screen.findByTestId('academy-ocm-courses-title');

    // Click "Show more" button
    const showMoreButton = screen.getByRole('button', { name: /Show more Self-paced courses \(6\)/ });
    showMoreButton.click();

    // Click "Show less" button
    await waitFor(() => {
      const showLessButton = screen.getByRole('button', { name: /Show less Self-paced courses/ });
      showLessButton.click();
    });

    // Should show only 4 courses again
    await waitFor(() => {
      const courseCards = screen.getAllByTestId('academy-course-card');
      expect(courseCards.length).toBe(4);
    });
  });

  it('does not show "Show more" button when there are 4 or fewer OCM courses', async () => {
    const fewCoursesData = {
      hits: Array.from({ length: 3 }, (_, i) => ({
        aggregationKey: `course:MAX+CS50x-${i}`,
        learningType: LEARNING_TYPE_COURSE,
        cardImageUrl: `ocm-course-card-url-${i}`,
        title: `OCM Course ${i}`,
      })),
      nbHits: 3,
    };
    mockSearchFn.mockResolvedValue(fewCoursesData);
    useAlgoliaSearch.mockReturnValue({
      searchClient: { search: mockSearchFn },
      searchIndex: { search: mockSearchFn },
      shouldUseSecuredAlgoliaApiKey: false,
    });

    renderWithRouter(<AcademyDetailPageWrapper />);

    // Wait for courses to load
    await screen.findByTestId('academy-ocm-courses-title');

    // Should not show "Show more" button
    const showMoreButton = screen.queryByRole('button', { name: /Show more Self-paced courses/ });
    expect(showMoreButton).not.toBeInTheDocument();

    // Should show all 3 courses
    const courseCards = screen.getAllByTestId('academy-course-card');
    expect(courseCards.length).toBe(3);
  });

  it('does not render course section when no courses are found', async () => {
    const noCoursesData = {
      hits: [],
      nbHits: 0,
    };
    mockSearchFn.mockResolvedValue(noCoursesData);
    useAlgoliaSearch.mockReturnValue({
      searchClient: { search: mockSearchFn },
      searchIndex: { search: mockSearchFn },
      shouldUseSecuredAlgoliaApiKey: false,
    });

    renderWithRouter(<AcademyDetailPageWrapper />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('loading')).not.toBeInTheDocument();
    });

    // Should not show OCM courses section
    expect(screen.queryByTestId('academy-ocm-courses-title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('academy-course-card')).not.toBeInTheDocument();
  });

  it('includes enterprise_customer_uuids in facet filters when not using secured API key', async () => {
    useAlgoliaSearch.mockReturnValue({
      searchClient: { search: mockSearchFn },
      searchIndex: { search: mockSearchFn },
      shouldUseSecuredAlgoliaApiKey: false,
    });

    renderWithRouter(<AcademyDetailPageWrapper />);

    await waitFor(() => {
      expect(mockSearchFn).toHaveBeenCalledWith('', expect.objectContaining({
        facetFilters: expect.arrayContaining([
          `enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}`,
        ]),
      }));
    });
  });

  it('excludes enterprise_customer_uuids from facet filters when using secured API key', async () => {
    useAlgoliaSearch.mockReturnValue({
      searchClient: { search: mockSearchFn },
      searchIndex: { search: mockSearchFn },
      shouldUseSecuredAlgoliaApiKey: true,
    });

    renderWithRouter(<AcademyDetailPageWrapper />);

    await waitFor(() => {
      const lastCall = mockSearchFn.mock.calls[mockSearchFn.mock.calls.length - 1];
      const { facetFilters } = lastCall[1];
      expect(facetFilters).not.toContain(`enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}`);
    });
  });

  it('filters courses by metadata_language based on current locale', async () => {
    renderWithRouter(<AcademyDetailPageWrapper />);

    await waitFor(() => {
      expect(mockSearchFn).toHaveBeenCalledWith('', expect.objectContaining({
        facetFilters: expect.arrayContaining([
          'metadata_language:es',
        ]),
      }));
    });
  });

  it('resets showAllOcmCourses when clearing tag filter', async () => {
    const manyCoursesData = {
      hits: Array.from({ length: 6 }, (_, i) => ({
        aggregationKey: `course:MAX+CS50x-${i}`,
        learningType: LEARNING_TYPE_COURSE,
        cardImageUrl: `ocm-course-card-url-${i}`,
        title: `OCM Course ${i}`,
      })),
      nbHits: 6,
    };
    mockSearchFn.mockResolvedValue(manyCoursesData);
    useAlgoliaSearch.mockReturnValue({
      searchClient: { search: mockSearchFn },
      searchIndex: { search: mockSearchFn },
      shouldUseSecuredAlgoliaApiKey: false,
    });

    renderWithRouter(<AcademyDetailPageWrapper />);

    // Wait for courses to load
    await screen.findByTestId('academy-ocm-courses-title');

    // Expand to show all courses
    const showMoreButton = screen.getByRole('button', { name: /Show more Self-paced courses \(6\)/ });
    showMoreButton.click();

    await waitFor(() => {
      const courseCards = screen.getAllByTestId('academy-course-card');
      expect(courseCards.length).toBe(6);
    });

    // Select a tag
    const tagButton = screen.getByText('wowwww');
    tagButton.click();

    // Clear the tag filter
    const clearButton = await screen.findByText('clear tag filter');
    clearButton.click();

    // Should collapse back to showing only 4 courses
    await waitFor(() => {
      const courseCards = screen.getAllByTestId('academy-course-card');
      expect(courseCards.length).toBe(4);
    });
  });

  it('renders all academy tags as buttons', async () => {
    renderWithRouter(<AcademyDetailPageWrapper />);

    const tagButtons = await screen.findAllByTestId('academy-tag');
    expect(tagButtons).toHaveLength(2);
    expect(tagButtons[0]).toHaveTextContent('wowwww');
    expect(tagButtons[1]).toHaveTextContent('boooo');
  });

  it('applies correct facet filters with selected tag', async () => {
    renderWithRouter(<AcademyDetailPageWrapper />);

    // Select second tag
    const secondTagButton = await screen.findByText('boooo');
    secondTagButton.click();

    await waitFor(() => {
      expect(mockSearchFn).toHaveBeenCalledWith('', expect.objectContaining({
        facetFilters: expect.arrayContaining([
          ['content_type:course'],
          `academy_uuids:${ACADEMY_UUID}`,
          'academy_tags:boooo_en',
          'metadata_language:es',
          `enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}`,
        ]),
      }));
    });
  });
});
