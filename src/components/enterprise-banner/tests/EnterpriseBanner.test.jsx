import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { useLocation } from 'react-router-dom';
import EnterpriseBanner from '../EnterpriseBanner';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

describe('<EnterpriseBanner />', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders recommend courses for me button if the user is on the search page', () => {
    useLocation.mockImplementation(() => ({
      pathname: '/slug/search',
    }));

    const name = 'Dojo Alpha';

    render(
      <AppContext.Provider
        value={{
          enterpriseConfig: {
            slug: 'slug',
            uuid: 'uuid',
            name,
          },
        }}
      >
        <EnterpriseBanner />
      </AppContext.Provider>,
    );

    expect(screen.getByText(name));
  });
});
