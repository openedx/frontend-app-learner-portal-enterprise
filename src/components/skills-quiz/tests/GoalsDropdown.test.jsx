import React from 'react';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { Provider as ReduxProvider } from 'react-redux';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import {
  GOAL_DROPDOWN_DEFAULT_OPTION,
} from '../constants';
import {
  renderWithRouter, fakeReduxStore,
} from '../../../utils/tests';
import GoalDropdown from '../GoalDropdown';
import { SkillsContextProvider } from '../SkillsContextProvider';

const mockStore = configureMockStore([thunk]);

/* eslint-disable react/prop-types */
const GoalDropdownWithContext = ({
  initialAppState = {},
  initialUserSubsidyState = {},
  initialReduxStore = fakeReduxStore,
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <ReduxProvider store={mockStore(initialReduxStore)}>
        <SkillsContextProvider>
          <GoalDropdown />
        </SkillsContextProvider>
      </ReduxProvider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

const mockLocation = {
  pathname: '/welcome',
  hash: '',
  search: '',
  state: { activationSuccess: true },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => (mockLocation),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ username: 'myspace-tom' }),
}));

describe('<GoalDropdown />', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders goal dropdown successfully.', () => {
    renderWithRouter(
      <GoalDropdownWithContext />,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText(GOAL_DROPDOWN_DEFAULT_OPTION)).toBeTruthy();
  });
});
