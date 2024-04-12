import React from 'react';
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
import { authenticatedUserFactory } from '../../app/data/services/data/__factories__';

jest.mock('algoliasearch/lite', () => jest.fn());
const mockSearch = jest.fn().mockResolvedValue({ hits: [] });
const mockInitIndex = jest.fn().mockReturnValue({
  search: mockSearch,
});
algoliasearch.mockReturnValue({
  initIndex: mockInitIndex,
});

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

describe('<SkillQuizForm />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    renderWithRouter(
      <SkillsQuizFormWrapper />,
      { route: '/test/skills-quiz/' },
    );
    await waitFor(() => {
      expect(screen.getByText('Show advanced options')).toBeInTheDocument();
    });
    userEvent.click(screen.getByText('Show advanced options'));
    expect(screen.getByText('Hide advanced options')).toBeInTheDocument();
    expect(screen.getByText('Search and select your current job title')).toBeInTheDocument();
    expect(screen.getByText('What industry are you interested in ?')).toBeInTheDocument();
  });
});
