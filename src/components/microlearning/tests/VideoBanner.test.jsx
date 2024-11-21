import { screen, waitFor } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import { useEnterpriseCustomer } from '../../app/data';
import VideoBanner from '../VideoBanner';
import { renderWithRouter } from '../../../utils/tests';
import '@testing-library/jest-dom/extend-expect';

jest.mock('../../app/data', () => ({
  useEnterpriseCustomer: jest.fn(),
}));
jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

describe('VideoBanner', () => {
  const mockEnterpriseCustomer = {
    uuid: 'mock-uuid',
  };

  const mockAuthenticatedUser = {
    userId: 'test-user-id',
  };
  const VideoBannerWrapper = () => (
    <IntlProvider locale="en">
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        <VideoBanner />
      </AppContext.Provider>
    </IntlProvider>
  );

  beforeEach(() => {
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  it('renders the video banner with correct title and description', () => {
    renderWithRouter(<VideoBannerWrapper />);

    expect(screen.getByText('New!')).toBeInTheDocument();
    expect(screen.getByText('Videos Now Available with Your Subscription')).toBeInTheDocument();
    expect(screen.getByText('Transform your potential into success.')).toBeInTheDocument();
  });

  it('renders the explore videos button', () => {
    renderWithRouter(<VideoBannerWrapper />);

    expect(screen.getByText('Explore videos')).toBeInTheDocument();
  });

  it('calls sendEnterpriseTrackEvent when banner is rendered', () => {
    renderWithRouter(<VideoBannerWrapper />);

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.video_banner.viewed',
    );
  });

  it('calls sendEnterpriseTrackEvent when explore videos button is clicked', () => {
    renderWithRouter(<VideoBannerWrapper />);

    const exploreVideosButton = screen.getByText('Explore videos');
    exploreVideosButton.click();

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.video_banner.explore_videos_clicked',
    );
  });
  it('hover on Beta badge', async () => {
    renderWithRouter(<VideoBannerWrapper />);
    userEvent.hover(screen.getByText('Beta'));
    await waitFor(() => {
      expect(screen.getByText('Beta version of the Videos.')).toBeVisible();
    });
  });
});
