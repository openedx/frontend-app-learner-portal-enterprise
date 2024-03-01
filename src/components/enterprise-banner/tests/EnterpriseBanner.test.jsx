import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import EnterpriseBanner from '../EnterpriseBanner';
import {
  useEnterpriseLearner,
  useRecommendCoursesForMe,
} from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseLearner: jest.fn(),
  useRecommendCoursesForMe: jest.fn(),
}));
useEnterpriseLearner.mockReturnValue({
  data: {
    enterpriseCustomer: {
      name: 'Test Enterprise',
      slug: 'test-enterprise-slug',
    },
  },
});
useRecommendCoursesForMe.mockReturnValue({
  shouldRecommendCourses: false,
});

const mockEnterpriseSlug = 'test-enterprise-slug';

const defaultAppContextValue = {
  authenticatedUser: {
    username: 'edx',
    userId: 3,
  },
  enterpriseConfig: {
    slug: mockEnterpriseSlug,
    uuid: 'uuid',
  },
};

const EnterpriseBannerWrapper = ({
  appContextValue = defaultAppContextValue,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={appContextValue}>
      <EnterpriseBanner />
    </AppContext.Provider>
  </IntlProvider>
);

describe('<EnterpriseBanner />', () => {
  it('does not render recommend courses for me by default', () => {
    renderWithRouter(<EnterpriseBannerWrapper />);
    expect(screen.queryByText('Recommend courses for me')).not.toBeInTheDocument();
  });

  it('renders recommend courses for me when appropriate', () => {
    useRecommendCoursesForMe.mockReturnValue({
      shouldRecommendCourses: true,
    });
    renderWithRouter(<EnterpriseBannerWrapper />);
    const recommendCoursesCTA = screen.getByText('Recommend courses for me', { selector: 'a' });
    expect(recommendCoursesCTA).toBeInTheDocument();
    expect(recommendCoursesCTA).toHaveAttribute('href', `/${mockEnterpriseSlug}/skills-quiz`);
  });
});
