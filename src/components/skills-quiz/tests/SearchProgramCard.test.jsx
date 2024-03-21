import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SearchProgramCard from '../SearchProgramCard';
import { renderWithRouter } from '../../../utils/tests';
import { NO_PROGRAMS_ALERT_MESSAGE } from '../constants';
import { SkillsContext } from '../SkillsContextProvider';
import { useEnterpriseCustomer } from '../../app/data';
import { useDefaultSearchFilters } from '../../search';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));
jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));
jest.mock('../../search', () => ({
  ...jest.requireActual('../../search'),
  useDefaultSearchFilters: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

const PROGRAM_UUID = 'a9cbdeb6-5fc0-44ef-97f7-9ed605a149db';
const PROGRAM_TITLE = 'Intro to BatVerse';
const PROGRAM_TYPE_DISPLAYED = 'MicroMasters® Program';
const PROGRAM_CARD_IMG_URL = 'http://card.image';
const PROGRAM_PARTNER_LOGO_IMG_URL = 'http://logo.image';
const PROGRAM_COURSES_COUNT_TEXT = '2 Courses';
const PROGRAM_AUTHOR_ORG = {
  key: 'Hogwarts',
  name: 'Hogwarts',
  logo_image_url: PROGRAM_PARTNER_LOGO_IMG_URL,
};
const TEST_COURSE_KEYS = ['HarvardX+CS50x', 'HarvardX+CS50AI'];

const programs = {
  hits: [
    {
      aggregation_key: `program:${PROGRAM_UUID}`,
      authoring_organizations: [
        PROGRAM_AUTHOR_ORG,
      ],
      card_image_url: PROGRAM_CARD_IMG_URL,
      course_keys: TEST_COURSE_KEYS,
      title: PROGRAM_TITLE,
      type: 'MicroMasters',
      skill_names: [],
    },
  ],
  nbHits: 1,
};

const testIndex = {
  indexName: 'test-index-name',
  search: jest.fn().mockImplementation(() => Promise.resolve(programs)),
};

const defaultAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const defaultSearchContext = {
  refinements: { },
  dispatch: () => null,
};

const defaultSkillsState = {
  state: {
    goal: 'Goal',
    selectedJob: 'job-1',
    interestedJobs: [
      {
        name: 'job-1',
        skills: [
          {
            name: 'test-skill-1',
          },
          {
            name: 'test-skill-2',
          },
        ],
      },
    ],
  },
};

const SearchProgramCardWithContext = ({
  initialAppState = defaultAppState,
  initialSkillsState = defaultSkillsState,
  initialSearchContext = defaultSearchContext,
  index,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <SearchContext.Provider value={initialSearchContext}>
        <SkillsContext.Provider value={initialSkillsState}>
          <SearchProgramCard index={index} />
        </SkillsContext.Provider>
      </SearchContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('<SearchProgramCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useDefaultSearchFilters.mockReturnValue({ filters: `enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}` });
  });

  test('renders the correct data', async () => {
    const { container } = renderWithRouter(
      <SearchProgramCardWithContext
        index={testIndex}
      />,
    );

    const searchProgramCard = await screen.findByTestId('search-program-card');
    expect(searchProgramCard).toBeInTheDocument();

    expect(screen.getByText(PROGRAM_TITLE)).toBeInTheDocument();
    expect(screen.getByAltText(PROGRAM_AUTHOR_ORG.name)).toBeInTheDocument();
    expect(screen.getByText(PROGRAM_AUTHOR_ORG.name)).toBeInTheDocument();

    expect(screen.getByTestId('program-type-badge')).toHaveTextContent(PROGRAM_TYPE_DISPLAYED);
    expect(screen.getByText(PROGRAM_COURSES_COUNT_TEXT)).toBeInTheDocument();

    // should show both logo image and card image with proper URLs
    const cardImages = container.querySelectorAll('img');
    expect(cardImages).toHaveLength(2);
    expect(cardImages[0]).toHaveAttribute('src', PROGRAM_CARD_IMG_URL);
    expect(cardImages[1]).toHaveAttribute('src', PROGRAM_PARTNER_LOGO_IMG_URL);

    // handles click
    userEvent.click(searchProgramCard);
    expect(window.location.pathname).toEqual(`/${mockEnterpriseCustomer.slug}/program/${PROGRAM_UUID}`);
  });

  test('renders the correct data with skills', async () => {
    const skillNames = ['test-skill-1', 'test-skill-2'];
    const programWithSkills = {
      hits: [
        {
          aggregation_key: `program:${PROGRAM_UUID}`,
          authoring_organizations: [
            PROGRAM_AUTHOR_ORG,
          ],
          card_image_url: PROGRAM_CARD_IMG_URL,
          course_keys: TEST_COURSE_KEYS,
          title: PROGRAM_TITLE,
          type: 'MicroMasters',
          skill_names: skillNames,
        },
      ],
      nbHits: 1,
    };
    const index = {
      indexName: 'test-index-name',
      search: jest.fn().mockImplementation(() => Promise.resolve(programWithSkills)),
    };

    renderWithRouter(
      <SearchProgramCardWithContext
        index={index}
      />,
    );
    expect(await screen.findByText(skillNames[0])).toBeInTheDocument();
    expect(screen.getByText(skillNames[1])).toBeInTheDocument();
  });

  test('only show course skills that match job-skills', async () => {
    const irrelevantSkill = 'test-skills-3';
    const skillNames = ['test-skill-1', 'test-skill-2'];
    skillNames.push(irrelevantSkill);
    const programWithSkills = {
      hits: [
        {
          aggregation_key: `program:${PROGRAM_UUID}`,
          authoring_organizations: [
            PROGRAM_AUTHOR_ORG,
          ],
          card_image_url: PROGRAM_CARD_IMG_URL,
          course_keys: TEST_COURSE_KEYS,
          title: PROGRAM_TITLE,
          type: 'MicroMasters',
          skill_names: skillNames,
        },
      ],
      nbHits: 1,
    };
    const index = {
      indexName: 'test-index-name',
      search: jest.fn().mockImplementation(() => Promise.resolve(programWithSkills)),
    };
    renderWithRouter(
      <SearchProgramCardWithContext
        index={index}
      />,
    );
    expect(await screen.findByText(skillNames[0])).toBeInTheDocument();
    expect(screen.getByText(skillNames[1])).toBeInTheDocument();
    expect(screen.queryByText(irrelevantSkill)).not.toBeInTheDocument();
  });

  test('renders an alert in case of no programs returned', async () => {
    const noPrograms = {
      hits: [],
      nbHits: 0,
    };
    const index = {
      indexName: 'test-index-name',
      search: jest.fn().mockImplementation(() => Promise.resolve(noPrograms)),
    };
    renderWithRouter(
      <SearchProgramCardWithContext
        index={index}
      />,
    );
    expect(await screen.findByText(NO_PROGRAMS_ALERT_MESSAGE)).toBeInTheDocument();
  });
});
