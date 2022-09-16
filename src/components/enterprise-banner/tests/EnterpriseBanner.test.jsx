import React, { useMemo } from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { useLocation } from 'react-router-dom';
import EnterpriseBanner from '../EnterpriseBanner';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

function BannerWrapper() {
  const contextValue = useMemo(() => ({
    enterpriseConfig: {
      slug: 'slug',
      uuid: 'uuid',
    },
  }), []);
  return (
    <AppContext.Provider
      value={contextValue}
    >
      <EnterpriseBanner />
    </AppContext.Provider>
  );
}

describe('<EnterpriseBanner />', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders recommend courses for me button if the user is on the search page', () => {
    useLocation.mockImplementation(() => ({
      pathname: '/slug/search',
    }));

    render(<BannerWrapper />);

    expect(screen.getByText('Recommend courses for me'));
  });
});
