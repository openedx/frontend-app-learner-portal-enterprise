import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import EnterpriseBanner from '../EnterpriseBanner';
import AuthenticatedPageContext from '../../app/AuthenticatedPageContext';

const mockEnterpriseSlug = 'test-enterprise-slug';

const defaultAppContextValue = {
  enterpriseConfig: {
    slug: mockEnterpriseSlug,
    uuid: 'uuid',
  },
};

const defaultAuthenticatedPageContextValue = {
  shouldRecommendCourses: false,
};

const EnterpriseBannerWrapper = ({
  appContextValue = defaultAppContextValue,
  authenticatedPageContextValue = defaultAuthenticatedPageContextValue,
}) => (
  <AppContext.Provider value={appContextValue}>
    <AuthenticatedPageContext.Provider value={authenticatedPageContextValue}>
      <EnterpriseBanner />
    </AuthenticatedPageContext.Provider>
  </AppContext.Provider>
);

describe('<EnterpriseBanner />', () => {
  it('does not render recommend courses for me by default', () => {
    renderWithRouter(<EnterpriseBannerWrapper />);
    expect(screen.queryByText('Recommend courses for me')).not.toBeInTheDocument();
  });

  it('renders recommend courses for me when appropriate', () => {
    const mockAuthenticatedPageContextValue = {
      ...defaultAuthenticatedPageContextValue,
      shouldRecommendCourses: true,
    };
    renderWithRouter(<EnterpriseBannerWrapper authenticatedPageContextValue={mockAuthenticatedPageContextValue} />);
    const recommendCoursesCTA = screen.getByText('Recommend courses for me', { selector: 'a' });
    expect(recommendCoursesCTA).toBeInTheDocument();
    expect(recommendCoursesCTA).toHaveAttribute('href', `/${mockEnterpriseSlug}/skills-quiz`);
  });
});
