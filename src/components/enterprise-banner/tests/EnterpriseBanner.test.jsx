import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import EnterpriseBanner from '../EnterpriseBanner';
import {
  useEnterpriseCustomer,
  useRecommendCoursesForMe,
} from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useRecommendCoursesForMe: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();

const defaultAppContextValue = {
  authenticatedUser: mockAuthenticatedUser,
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
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({
      data: mockEnterpriseCustomer,
    });
    useRecommendCoursesForMe.mockReturnValue({
      shouldRecommendCourses: false,
    });
  });

  it('renders the enterprise customer name', () => {
    renderWithRouter(<EnterpriseBannerWrapper />);
    expect(screen.getByText(mockEnterpriseCustomer.name)).toBeInTheDocument();
  });

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
    expect(recommendCoursesCTA).toHaveAttribute('href', `/${mockEnterpriseCustomer.slug}/skills-quiz`);
  });
});
