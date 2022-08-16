import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import UserSubsidy from '../UserSubsidy';

import { renderWithRouter } from '../../../utils/tests';
import { LOADING_SCREEN_READER_TEXT } from '../data/constants';

jest.mock('../data/service');
jest.mock('../../../config', () => ({
  features: {
    ENROLL_WITH_CODES: true,
    ENABLE_AUTO_APPLIED_LICENSES: true,
  },
}));

const TEST_ENTERPRISE_SLUG = 'test-enterprise-slug';
const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

/* eslint-disable react/prop-types */
const UserSubsidyWithAppContext = ({
  enterpriseConfig = {},
  contextValue = {},
  children,
}) => (
  <AppContext.Provider
    value={{
      enterpriseConfig: {
        slug: TEST_ENTERPRISE_SLUG,
        uuid: TEST_ENTERPRISE_UUID,
        ...enterpriseConfig,
      },
      ...contextValue,
    }}
  >
    <UserSubsidy>
      {children}
    </UserSubsidy>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

const SubscriptionLicenseConsumer = () => <div>License status: none</div>;

const OffersConsumer = () => <div>Offers count: none</div>;

describe('UserSubsidy', () => {
  describe('without subsidy', () => {
    beforeEach(() => {});

    afterEach(() => {
      jest.resetAllMocks();
    });

    test('shows no portal access', async () => {
      const Component = (
        <UserSubsidyWithAppContext>
          <SubscriptionLicenseConsumer />
          <OffersConsumer />
        </UserSubsidyWithAppContext>
      );
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });

      // assert component is initially loading
      expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('License status: none')).toBeInTheDocument();
        expect(screen.queryByText('Offers count: none')).toBeInTheDocument();
      });

      // assert component is no longer loading
      expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).not.toBeInTheDocument();
    });
  });

  describe('with subsidy', () => {
    describe('existing activated license, no offers', () => {
      beforeEach(() => {});

      afterEach(() => {
        jest.resetAllMocks();
      });

      test('activated license status and no offers', async () => {
        const Component = (
          <UserSubsidyWithAppContext>
            <SubscriptionLicenseConsumer />
            <OffersConsumer />
          </UserSubsidyWithAppContext>
        );
        renderWithRouter(Component, {
          route: `/${TEST_ENTERPRISE_SLUG}`,
        });

        // assert component is initially loading
        expect(screen.getByText(LOADING_SCREEN_READER_TEXT)).toBeInTheDocument();

        await waitFor(() => {
          expect(screen.queryByText('Offers count: none')).toBeInTheDocument();
        });

        // assert component is no longer loading
        expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).not.toBeInTheDocument();
      });
    });

    describe('with auto-applied license, no offers', () => {
      beforeEach(() => {});

      afterEach(() => {
        jest.resetAllMocks();
      });

      test('no existing license, requests auto-applied license and has portal access', async () => {
        const Component = (
          <UserSubsidyWithAppContext
            enterpriseConfig={{
              identityProvider: 'test-provider',
            }}
          >
            <SubscriptionLicenseConsumer />
            <OffersConsumer />
          </UserSubsidyWithAppContext>
        );
        renderWithRouter(Component, {
          route: `/${TEST_ENTERPRISE_SLUG}`,
        });

        // assert component is initially loading
        expect(screen.getByText(LOADING_SCREEN_READER_TEXT)).toBeInTheDocument();

        await waitFor(() => {
          expect(screen.queryByText('Offers count: none')).toBeInTheDocument();
        });

        // assert component is no longer loading
        expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).not.toBeInTheDocument();
      });
    });
  });
});
