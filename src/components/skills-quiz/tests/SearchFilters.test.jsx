import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchData } from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SkillsContextProvider } from '../SkillsContextProvider';
import {
  DESIRED_JOB_FACET,
  INDUSTRY_FACET,
  CURRENT_JOB_FACET,
  GOAL_DROPDOWN_DEFAULT_OPTION,
  DROPDOWN_OPTION_GET_PROMOTED,
} from '../constants';

import SkillsQuizStepper from '../SkillsQuizStepper';
import { useEnterpriseCustomer } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

const defaultAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const facetsToTest = [DESIRED_JOB_FACET, INDUSTRY_FACET, CURRENT_JOB_FACET];

describe('<SearchFilters />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  test('renders skills and jobs dropdown with a label', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={defaultAppState}>
          <SearchData>
            <SkillsContextProvider>
              <SkillsQuizStepper />
            </SkillsContextProvider>
          </SearchData>
        </AppContext.Provider>
      </IntlProvider>,
      { route: '/test/skills-quiz/' },
    );
    const goalDropdownDefaultOption = screen.getByText(GOAL_DROPDOWN_DEFAULT_OPTION);
    expect(goalDropdownDefaultOption).toBeInTheDocument();
    await user.click(goalDropdownDefaultOption);
    await user.click(screen.getByText(DROPDOWN_OPTION_GET_PROMOTED));
    await waitFor(() => {
      facetsToTest.forEach((filter) => {
        expect(screen.getByText(filter.title)).toBeInTheDocument();
      });
    });
  });
});
