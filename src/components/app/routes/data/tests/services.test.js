/* eslint-disable react/jsx-filename-extension */
import { render, waitFor, screen } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { Button } from '@openedx/paragon';
import { fetchNotices } from '../services';

const APP_CONFIG = {
  USE_API_CACHE: true,
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
  LMS_BASE_URL: 'http://localhost:18000',
};
jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => APP_CONFIG),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(() => ({ id: 12345 })),
  getAuthenticatedHttpClient: jest.fn(),
}));

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

describe('fetchNotices', () => {
  const NOTICES_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL }/notices/api/v1/unacknowledged`;
  const ComponentWithNotices = () => {
    const [output, setOuput] = useState(null);
    const onClickHandler = async () => {
      const apiOutput = await fetchNotices();
      if (apiOutput?.results.length > 0) {
        setOuput(apiOutput.results[0]);
        return;
      }
      setOuput('No Results');
    };
    return (
      <Button data-testid="fetchNotices" onClick={onClickHandler}>{output || 'hi'}</Button>
    );
  };

  // Preserves original window location, and swaps it back after test is completed
  const currentLocation = window.location;
  beforeAll(() => {
    delete window.location;
    window.location = { ...currentLocation, assign: jest.fn() };
  });
  afterAll(() => {
    window.location = currentLocation;
  });
  it('returns empty data results and does not assign the window location', async () => {
    axiosMock.onGet(NOTICES_ENDPOINT).reply(200, { results: [] });
    render(<ComponentWithNotices />);
    userEvent.click(screen.getByTestId('fetchNotices'));
    await waitFor(() => expect(window.location.assign).not.toHaveBeenCalled());
  });
  it('returns logInfo on 404', async () => {
    axiosMock.onGet(NOTICES_ENDPOINT).reply(404, {});
    render(<ComponentWithNotices />);
    userEvent.click(screen.getByTestId('fetchNotices'));
    await waitFor(() => expect(window.location.assign).not.toHaveBeenCalled());
  });
  it('assigns the window location on successful API response', async () => {
    const currentHref = window.location.href;
    axiosMock.onGet(NOTICES_ENDPOINT).reply(200, { results: [APP_CONFIG.LMS_BASE_URL] });
    render(<ComponentWithNotices />);
    userEvent.click(screen.getByTestId('fetchNotices'));
    await waitFor(() => expect(window.location.assign).toHaveBeenCalledWith(
      `${APP_CONFIG.LMS_BASE_URL }?next=${currentHref}`,
    ));
  });
});
