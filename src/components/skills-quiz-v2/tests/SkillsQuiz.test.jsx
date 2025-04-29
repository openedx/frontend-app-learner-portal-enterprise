import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContextProvider } from '../../skills-quiz/SkillsContextProvider';
import { renderWithRouter } from '../../../utils/tests';
import SkillsQuizV2 from '../SkillsQuiz';
import { useAlgoliaSearch, useDefaultSearchFilters, useEnterpriseCustomer } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { setFakeHits } from '../../skills-quiz/__mocks__/react-instantsearch-dom';

// [tech debt] We appear to attempting to call legit Algolia APIs in these tests; lots
// of test output related to Algolia errors. Does not appear to impact the test results.

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useAlgoliaSearch: jest.fn(),
  useDefaultSearchFilters: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();
const mockAlgoliaSearch = {
  searchClient: {
    search: jest.fn(), appId: 'test-app-id',
  },
  searchIndex: {
    indexName: 'mock-index-name',
  },
};

const defaultAppState = {
  authenticatedUser: mockAuthenticatedUser,
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
setFakeHits(hits);
describe('<SkillsQuizV2 />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useAlgoliaSearch.mockReturnValue(mockAlgoliaSearch);
    useDefaultSearchFilters.mockReturnValue(`enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}`);
  });

  it('renders SkillsQuizV2 component correctly', () => {
    renderWithRouter(
      <IntlProvider locale="en">
        <SearchData>
          <SkillsContextProvider>
            <AppContext.Provider value={defaultAppState}>
              <SkillsQuizV2 />
            </AppContext.Provider>
          </SkillsContextProvider>
        </SearchData>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );

    expect(screen.getByText('Skills Builder')).toBeInTheDocument();
    expect(screen.getByText('Let edX be your guide')).toBeInTheDocument();
    expect(screen.getByText('What roles are you interested in ?')).toBeInTheDocument();
    expect(screen.getByText('Show advanced options')).toBeInTheDocument();
  });
});
