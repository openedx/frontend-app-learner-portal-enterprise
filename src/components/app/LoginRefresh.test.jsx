import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, act } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';

import renderer from 'react-test-renderer';
import LoginRefresh from './LoginRefresh';
import * as utils from '../../utils/common';

jest.mock('../../utils/common');

// eslint-disable-next-line react/prop-types
const LoginRefreshWithContext = ({ roles = [] }) => (
  <AppContext.Provider value={{
    authenticatedUser: {
      userId: 1,
      roles,
    },
  }}
  >
    <LoginRefresh>
      <div>Hello!</div>
    </LoginRefresh>
  </AppContext.Provider>
); /* eslint-enable react/prop-types */

describe('<LoginRefresh />', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call loginRefresh if the user has no roles', async () => {
    await act(async () => render(
      <LoginRefreshWithContext />,
    ));

    expect(utils.loginRefresh).toHaveBeenCalledTimes(1);
  });

  it('should not call loginRefresh if the user has roles', async () => {
    await act(async () => render(
      <LoginRefreshWithContext roles={['role-1']} />,
    ));

    expect(utils.loginRefresh).not.toHaveBeenCalled();
  });

  it('should render the expected HTML', async () => {
    let tree;
    await renderer.act(async () => {
      tree = await renderer.create(
        <LoginRefreshWithContext />,
      );
    });

    expect(tree.toJSON()).toMatchSnapshot();
  });
});
