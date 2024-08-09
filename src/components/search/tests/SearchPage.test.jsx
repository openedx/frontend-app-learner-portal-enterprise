import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useSubscriptions } from '../../app/data';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import SearchPage from '../SearchPage';
import { features } from '../../../config';
import { renderWithRouter } from '../../../utils/tests';

jest.mock('../../app/data', () => ({
  useSubscriptions: jest.fn(),
}));

jest.mock('../utils', () => ({
  getSearchFacetFilters: jest.fn().mockReturnValue([]),
  hasActivatedAndCurrentSubscription: jest.fn().mockReturnValue(true),
}));

jest.mock('../Search', () => function Search() {
  return <div>Mock Search Component</div>;
});

const initialAppState = {
  authenticatedUser: { userId: 'test-user-id', username: 'test-username' },
};

const renderSearchPage = () => renderWithRouter(
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <SearchPage />
    </AppContext.Provider>
  </IntlProvider>,
);

describe('SearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    features.FEATURE_ENABLE_VIDEO_CATALOG = true;
  });

  it('renders SearchPage component', () => {
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionLicense: {
          status: LICENSE_STATUS.ACTIVATED,
          subscriptionPlan: { isCurrent: true },
        },
      },
    });

    renderSearchPage();
    expect(screen.queryByText('Mock Search Component')).toBeInTheDocument();
  });
});
