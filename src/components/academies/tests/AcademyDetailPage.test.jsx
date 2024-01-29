import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  LEARNING_TYPE_COURSE, LEARNING_TYPE_EXECUTIVE_EDUCATION,
} from '@edx/frontend-enterprise-catalog-search/data/constants';
import { renderWithRouter } from '../../../utils/tests';

import AcademyDetailPage from '../AcademyDetailPage';
import { EXECUTIVE_EDUCATION_SECTION, SELF_PACED_SECTION } from '../data/constants';

// config
const APP_CONFIG = {
  USE_API_CACHE: true,
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
};

// test data
const ACADEMY_UUID = 'b48ff396-03b4-467f-a4cc-da4327156984';
const ACADEMY_MOCK_DATA = {
  uuid: ACADEMY_UUID,
  title: 'My Awesome Academy',
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
const ALOGLIA_MOCK_DATA = {
  hits: [
    {
      aggregation_key: 'course:MAX+CS50x',
      learning_type: LEARNING_TYPE_COURSE,
      card_image_url: 'ocm-course-card-url',
      title: 'ocm course title',
    },
    {
      aggregation_key: 'course:MAX+DSA50x',
      learning_type: LEARNING_TYPE_EXECUTIVE_EDUCATION,
      card_image_url: 'exec-ed-card-url',
      title: 'exec-ed course title',
    },
  ],
  nbHits: 2,
};

// endpoints
const ACADEMY_API_ENDPOINT = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies/${ACADEMY_UUID}/`;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ enterpriseSlug: 'test-enterprise-uuid', academyUUID: ACADEMY_UUID }),
}));
jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => APP_CONFIG),
}));
jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onGet(ACADEMY_API_ENDPOINT).reply(200, ACADEMY_MOCK_DATA);

// Mock the 'algoliasearch' module
jest.mock('algoliasearch/lite', () => {
  // Mock the 'initIndex' function
  const mockInitIndex = jest.fn(() => {
    // Mock the 'search' function of the index
    const mockSearch = jest.fn(async () => ({
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

const AcademyDetailPageWithContext = ({
  initialAppState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <AcademyDetailPage />
  </AppContext.Provider>
);

describe('<AcademyDetailPage />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
      uuid: '11111111-1111-1111-1111-111111111111',
    },
  };

  it('renders academy detail page', async () => {
    await act(async () => renderWithRouter(
      <AcademyDetailPageWithContext
        initialAppState={initialAppState}
      />,
    ));

    const headingElement = screen.getByRole('heading', { level: 2 });
    expect(headingElement.textContent).toBe(ACADEMY_MOCK_DATA.title);
    expect(screen.getByTestId('academy-description')).toHaveTextContent(ACADEMY_MOCK_DATA.long_description);
    const academyTags = screen.getAllByTestId('academy-tag').map((tag) => tag.textContent);
    expect(academyTags).toEqual(['wowwww', 'boooo']);
    expect(screen.getByTestId('academy-exec-ed-courses-title')).toHaveTextContent(EXECUTIVE_EDUCATION_SECTION.title);
    expect(screen.getByTestId('academy-exec-ed-courses-subtitle')).toHaveTextContent(EXECUTIVE_EDUCATION_SECTION.subtitle);
    expect(screen.getByTestId('academy-ocm-courses-title')).toHaveTextContent(SELF_PACED_SECTION.title);
    expect(screen.getByTestId('academy-ocm-courses-subtitle')).toHaveTextContent(SELF_PACED_SECTION.subtitle);
    expect(screen.getAllByTestId('academy-course-card').length).toEqual(2);
    expect(screen.getByText(ALOGLIA_MOCK_DATA.hits[0].title)).toBeInTheDocument();
    expect(screen.getByText(ALOGLIA_MOCK_DATA.hits[1].title)).toBeInTheDocument();
  });
});
