import renderer from 'react-test-renderer';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import ErrorPage from './ErrorPage';

jest.mock('@edx/frontend-component-footer', () => ({
  FooterSlot: jest.fn(() => <div data-testid="site-footer" />),
}));

const ErrorPageWrapper = (component) => renderer
  .create((
    <AppContext.Provider value={{
      authenticatedUser: {
        id: 1,
        profileImage: {
          imageUrlMedium: 'htts://img.url',
        },
      },
      config: {
        LEARNER_SUPPORT_URL: 'https://support.url',
        LOGOUT_URL: 'https://logout.url',
      },
    }}
    >
      {component}
    </AppContext.Provider>
  ));

describe('ErrorPage', () => {
  test('properly renders page layout with title and subtitle', async () => {
    const tree = ErrorPageWrapper(
      <ErrorPage
        title="Something went wrong"
        subtitle="More details here"
      >
        Here goes the error message.
      </ErrorPage>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('handles optional title and subtitle', async () => {
    const tree = ErrorPageWrapper(
      <ErrorPage>
        Here goes the error message.
      </ErrorPage>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
