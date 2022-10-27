import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, fireEvent } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';

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

/* eslint-disable react/prop-types */
const CourseRecommendationsContext = ({
  initialAppState = defaultAppState,
}) => (
  <AppContext.Provider value={initialAppState}>
    <CourseRecommendations />
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<CourseRecommendations />', () => {
  it('renders component correctly', () => {
    renderWithRouter(<CourseRecommendationsContext />);
    expect(screen.getByText('Get course recommendations for you.'));
  });

  it('clicking takes the user to skills quiz page', () => {
    const { history } = renderWithRouter(<CourseRecommendationsContext />);
    const courseRecommendationsButton = screen.getByText('Recommend courses for me');
    fireEvent.click(courseRecommendationsButton);
    expect(history.location.pathname).toEqual('/BearsRUs/skills-quiz');
  });
});
