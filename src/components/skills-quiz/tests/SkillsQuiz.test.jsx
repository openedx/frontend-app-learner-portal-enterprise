import React from 'react';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { Provider as ReduxProvider } from 'react-redux';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

import {
  renderWithRouter, fakeReduxStore,
} from '../../../utils/tests';
import SkillsQuiz from '../SkillsQuiz';

const mockStore = configureMockStore([thunk]);

/* eslint-disable react/prop-types */
const SkillsQuizWithContext = ({
  initialAppState = {},
  initialUserSubsidyState = {},
  initialReduxStore = fakeReduxStore,
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <ReduxProvider store={mockStore(initialReduxStore)}>
        <SkillsQuiz />
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

describe('<SkillsQuiz />', () => {
  const defaultOffersState = {
    offers: [],
    loading: false,
    offersCount: 0,
  };
  const initialAppState = {
    enterpriseConfig: {
      name: 'BearsRUs',
    },
    config: {
      LMS_BASE_URL: process.env.LMS_BASE_URL,
    },
  };
  const initialUserSubsidyState = {
    hasAccessToPortal: true,
    offers: defaultOffersState,
  };

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders skills quiz page successfully.', () => {
    const SILLS_QUIZ_PAGE_MESSAGE = 'edX is here to help you find the course(s) or program(s) to help you take the next step in your career. Tell us a bit about your current role, and skills or jobs you\'re interested in.';
    renderWithRouter(
      <SkillsQuizWithContext initialAppState={initialAppState} initialUserSubsidyState={initialUserSubsidyState} />,
      { route: '/test/skills-quiz/' },
    );
    expect(screen.getByText('Skills Quiz')).toBeTruthy();
    expect(screen.getByText(SILLS_QUIZ_PAGE_MESSAGE)).toBeTruthy();
  });
});
