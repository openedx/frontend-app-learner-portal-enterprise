import React from 'react';
import renderer from 'react-test-renderer';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import '@testing-library/jest-dom/extend-expect';

import ErrorPage from './ErrorPage';

jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-platform/config');
jest.mock('@edx/frontend-component-footer', () => function () {
  return <div data-testid="site-footer" />;
});

getAuthenticatedUser.mockReturnValue({
  id: 1,
  profileImage: {
    imageUrlMedium: 'htts://img.url',
  },
});

getConfig.mockReturnValue({
  MARKETING_SITE_BASE_URL: 'https://marketing.url',
  LEARNER_SUPPORT_URL: 'https://support.url',
  LOGOUT_URL: 'https://logout.url',
});

describe('ErrorPage', () => {
  test('properly renders page layout with title and subtitle', async () => {
    const tree = renderer
      .create((
        <ErrorPage
          title="Something went wrong"
          subtitle="More details here"
        >
          Here goes the error message.
        </ErrorPage>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('handles optional title', async () => {
    const tree = renderer
      .create((
        <ErrorPage>
          Here goes the error message.
        </ErrorPage>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('handles optional subtitle', async () => {
    const tree = renderer
      .create((
        <ErrorPage>
          Here goes the error message.
        </ErrorPage>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
