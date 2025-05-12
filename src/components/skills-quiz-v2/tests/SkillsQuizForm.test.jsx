import algoliasearch from 'algoliasearch/lite';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { renderWithRouter } from '../../../utils/tests';
import { SkillsContext } from '../../skills-quiz/SkillsContextProvider';
import { GOAL_DROPDOWN_DEFAULT_OPTION } from '../../skills-quiz/constants';
import SkillQuizForm from '../SkillsQuizForm';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { useAlgoliaSearch, useDefaultSearchFilters, useEnterpriseCustomer } from '../../app/data';
import { resetMockReactInstantSearch, setFakeHits } from '../../skills-quiz/__mocks__/react-instantsearch-dom';

jest.mock('algoliasearch/lite', () => jest.fn());
const mockSearch = jest.fn().mockResolvedValue({ hits: [] });
const mockInitIndex = jest.fn().mockReturnValue({
  search: mockSearch,
});
algoliasearch.mockReturnValue({
  initIndex: mockInitIndex,
});

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useAlgoliaSearch: jest.fn(),
  useDefaultSearchFilters: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();

const defaultAppState = {
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: mockAuthenticatedUser,
};

const skillsQuizContextInitialState = {
  state: { goal: GOAL_DROPDOWN_DEFAULT_OPTION },
  dispatch: jest.fn(),
};

const searchContext = {
  refinements: {},
  dispatch: () => null,
};

const SkillsQuizFormWrapper = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={defaultAppState}>
      <SearchContext.Provider value={{ ...searchContext }}>
        <SkillsContext.Provider value={skillsQuizContextInitialState}>
          <SkillQuizForm />
        </SkillsContext.Provider>
      </SearchContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const mockAlgoliaSearch = {
  searchClient: {
    search: jest.fn(), appId: 'test-app-id',
  },
  searchIndex: {
    indexName: 'mock-index-name',
    search: jest.fn().mockReturnValue({ hits: [] }),
  },
};

const hits = [
  {
    skills: [
      'JavaScript',
      'React',
      'Node.js',
      'Python',
      'Django',
      'SQL',
      'AWS',
    ],
  },
];
describe('<SkillQuizForm />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useAlgoliaSearch.mockReturnValue(mockAlgoliaSearch);
    useDefaultSearchFilters.mockReturnValue(`enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}`);
    setFakeHits(hits);
  });
  afterEach(() => {
    resetMockReactInstantSearch();
  });
  it('renders skills quiz v2 page', async () => {
    renderWithRouter(
      <SkillsQuizFormWrapper />,
      { route: '/test/skills-quiz/' },
    );
    await waitFor(() => {
      expect(screen.getByText('What roles are you interested in ?')).toBeInTheDocument();
    });
  });

  it('toggles advanced options visibility on button click', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <SkillsQuizFormWrapper />,
      { route: '/test/skills-quiz/' },
    );
    await waitFor(() => {
      expect(screen.getByText('Show advanced options')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Show advanced options'));
    expect(screen.getByText('Hide advanced options')).toBeInTheDocument();
    expect(screen.getByText('Search and select your current job title')).toBeInTheDocument();
    expect(screen.getByText('What industry are you interested in ?')).toBeInTheDocument();
  });
});
