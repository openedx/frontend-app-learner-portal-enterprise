import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { render, act } from '@testing-library/react';
import NoticesProvider from './NoticesProvider';
import { getNotices } from './api';

jest.mock('./api', () => ({
  getNotices: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

describe('NoticesProvider', () => {
  function buildAndRender() {
    render(
      <NoticesProvider>
        <div />
      </NoticesProvider>,
    );
  }
  beforeAll(async () => {
    jest.resetModules();
  });

  it('does not call api if ENABLE_NOTICES is false', () => {
    getConfig.mockImplementation(() => ({ ENABLE_NOTICES: false }));
    buildAndRender();
    expect(getNotices).toHaveBeenCalledTimes(0);
  });

  it('redirects user on notice returned from API', async () => {
    const redirectUrl = 'http://example.com/test_route';
    getConfig.mockImplementation(() => ({ ENABLE_NOTICES: true }));
    getNotices.mockImplementation(() => ({ results: [redirectUrl] }));
    delete window.location;
    window.location = { replace: jest.fn() };
    await act(async () => buildAndRender());
    expect(window.location.replace).toHaveBeenCalledWith(`${redirectUrl}?next=${window.location.href}`);
  });

  it('does not redirect on no data', async () => {
    getNotices.mockImplementation(() => ({}));
    getConfig.mockImplementation(() => ({ ENABLE_NOTICES: true }));
    delete window.location;
    window.location = { replace: jest.fn() };
    await act(async () => buildAndRender());
    expect(window.location.replace).toHaveBeenCalledTimes(0);
    expect(window.location.toString() === 'http://localhost/');
  });
});
