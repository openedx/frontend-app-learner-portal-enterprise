import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { useLocation } from 'react-router-dom';
import EnterpriseBanner from '../EnterpriseBanner';
import { useEnterpriseCuration } from '../../search/content-highlights/data';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

jest.mock('../../search/content-highlights/data', () => ({
  useEnterpriseCuration: jest.fn(() => ({
    enterpriseCuration: {
      canOnlyViewHighlightSets: jest.fn(),
    },
  })),
}));

describe('<EnterpriseBanner />', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  it('renders recommend courses for me button if the user is on the search page', () => {
    useLocation.mockImplementation(() => ({
      pathname: '/slug/search',
    }));
    useEnterpriseCuration.mockImplementation(() => ({
      enterpriseCuration: {
        canOnlyViewHighlightSets: false,
      },
    }));
    render(
      <AppContext.Provider
        value={{
          enterpriseConfig: {
            slug: 'slug',
            uuid: 'uuid',
          },
        }}
      >
        <EnterpriseBanner />
      </AppContext.Provider>,
    );

    expect(screen.getByText('Recommend courses for me'));
  });
  it('hides button when canOnlyViewHighlightSets is true', () => {
    useLocation.mockImplementation(() => ({
      pathname: '/slug/search',
    }));
    useEnterpriseCuration.mockImplementation(() => ({
      enterpriseCuration: {
        canOnlyViewHighlightSets: true,
      },
    }));
    render(
      <AppContext.Provider
        value={{
          enterpriseConfig: {
            slug: 'slug',
            uuid: 'uuid',
          },
        }}
      >
        <EnterpriseBanner />
      </AppContext.Provider>,
    );

    expect(screen.queryByText('Recommend courses for me')).toBeNull();
  });
});
