import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import userEvent from '@testing-library/user-event';
import {
  renderWithRouter,
} from '../../../utils/tests';
import { CourseRecommendations } from '../main-content';

const mockAuthenticatedUser = { username: 'myspace-tom', name: 'John Doe' };

const defaultAppState = {
  enterpriseConfig: {
    name: 'BearsRUs',
    uuid: 'BearsRUs',
    slug: 'BearsRUs',
    disableSearch: false,
    adminUsers: [{ email: 'admin@foo.com' }],
  },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: mockAuthenticatedUser,
};

const CourseRecommendationsContext = ({
  initialAppState = defaultAppState,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <CourseRecommendations />
    </AppContext.Provider>
  </IntlProvider>
);

describe('<CourseRecommendations />', () => {
  it('renders component correctly', () => {
    renderWithRouter(<CourseRecommendationsContext />);
    expect(screen.getByText('Get course recommendations for you.'));
  });

  it('clicking takes the user to skills quiz page', () => {
    renderWithRouter(<CourseRecommendationsContext />);
    const courseRecommendationsButton = screen.getByText('Recommend courses for me');
    userEvent.click(courseRecommendationsButton);
    expect(window.location.pathname).toEqual('/BearsRUs/skills-quiz');
  });
});
