import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, act } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';

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
  });

  expect(utils.loginRefresh).not.toHaveBeenCalled();
});
