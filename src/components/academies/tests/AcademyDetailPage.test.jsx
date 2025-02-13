import axios from 'axios';
import { screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom/extend-expect';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  LEARNING_TYPE_COURSE,
  LEARNING_TYPE_EXECUTIVE_EDUCATION,
} from '@edx/frontend-enterprise-catalog-search/data/constants';
import { renderWithRouter } from '../../../utils/tests';

import AcademyDetailPage from '../AcademyDetailPage';
import { useAcademyDetails, useEnterpriseCustomer } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { useAcademyPathwayData } from '../data/hooks';

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
      description: 'description 111',
    },
    {
      id: 222,
      title: 'boooo',
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
    {
      aggregationKey: 'course:MAX+DSA50x',
      learningType: LEARNING_TYPE_EXECUTIVE_EDUCATION,
      cardImageUrl: 'exec-ed-card-url',
      title: 'exec-ed course title',
    },
  ],
  nbHits: 2,
};

const mockPathwayResponse = [
  {
    title: 'Pathway Title',
    overview: 'Pathway Overview',
    pathwayUuid: '9d7c7c42-682d-4fa4-a133-2913e939f771',
  },
  false,
  null,
];
// endpoints

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

// Mock the 'algoliasearch' module
jest.mock('algoliasearch/lite', () => {
  // Mock the 'initIndex' function
  const mockInitIndex = jest.fn(() => {
    // Mock the 'search' function of the index
    const mockSearch = jest.fn(() => ({
      hits: [
        {
          aggregation_key: 'course:MAX+CS50x',
          learning_type: 'course',
          card_image_url: 'ocm-course-card-url',
          title: 'ocm course title',
        },
        {
          aggregation_key: 'course:MAX+DSA50x',
          learning_type: 'Executive Education',
          card_image_url: 'exec-ed-card-url',
          title: 'exec-ed course title',
        },
      ],
      nbHits: 2,
    }));

    return { search: mockSearch };
  });

  // Mock the 'algoliasearch' function
  return jest.fn(() => ({ initIndex: mockInitIndex }));
});

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useAcademyDetails: jest.fn(),
}));
jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useAcademyPathwayData: jest.fn(),
}));

const AcademyDetailPageWrapper = () => (
  <IntlProvider locale="en">
    <AcademyDetailPage />
  </IntlProvider>
);

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<AcademyDetailPage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useAcademyDetails.mockReturnValue({ data: ACADEMY_MOCK_DATA });
    useAcademyPathwayData.mockReturnValue(mockPathwayResponse);
  });
  it('renders academy detail page', async () => {
    renderWithRouter(<AcademyDetailPageWrapper />);

    const headingElement = await screen.getByTestId('academy-all-courses-title');
    const expectedHeadingElement = `All ${ACADEMY_MOCK_DATA.title} Academy Courses`;
    expect(headingElement.textContent).toBe(expectedHeadingElement);
    const academyTags = screen.getAllByTestId('academy-tag').map((tag) => tag.textContent);
    expect(academyTags).toEqual(['wowwww', 'boooo']);
    expect(screen.getByTestId('academy-exec-ed-courses-title')).toHaveTextContent('Executive Education');
    expect(screen.getByTestId('academy-exec-ed-courses-subtitle')).toHaveTextContent(
      'A selection of high-impact graduate-level courses that follow a structured schedule and include active interaction with educators and peers.',
    );
    expect(screen.getByTestId('academy-ocm-courses-title')).toHaveTextContent('Self-paced courses');
    expect(screen.getByTestId('academy-ocm-courses-subtitle')).toHaveTextContent(
      'A collection of courses that cover essential knowledge on the subject. These courses offer flexible schedules and independent study.',
    );
    expect(screen.getAllByTestId('academy-course-card').length).toEqual(2);
    expect(screen.getByText(ALOGLIA_MOCK_DATA.hits[0].title)).toBeInTheDocument();
    expect(screen.getByText(ALOGLIA_MOCK_DATA.hits[1].title)).toBeInTheDocument();
  });
  it('renders a not found page', () => {
    useAcademyDetails.mockReturnValue({ data: null });
    renderWithRouter(<AcademyDetailPageWrapper />);
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });
});
