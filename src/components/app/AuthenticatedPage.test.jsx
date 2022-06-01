import { render, screen } from '@testing-library/react';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';

import AuthenticatedPage from './AuthenticatedPage';

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => undefined,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({ search: '?logout=true', pathname: '/test-enterprise-slug' }),
  useParams: jest.fn().mockReturnValue({ enterpriseSlug: 'test-enterprise-slug' }),
}));

describe('AuthenticatedPage tests', () => {
  test('page shows logout component when logout mode is detected and user is logged off', () => {
    render(
      <AuthenticatedPage>
        <div>Your Child, I am but I won&apos;t be rendered!</div>
      </AuthenticatedPage>,
    );
    expect(screen.getByText('You are now logged out.')).toBeInTheDocument();
  });

  test('should render the expected HTML', async () => {
    let tree;
    await renderer.act(async () => {
      tree = await renderer.create(
        <AuthenticatedPage>
          <div>Your Child, I am but I won&apos;t be rendered!</div>
        </AuthenticatedPage>,
      );
    });

    expect(tree.toJSON()).toMatchSnapshot();
  });
});
