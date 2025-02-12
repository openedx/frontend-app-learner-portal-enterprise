import '@testing-library/jest-dom/extend-expect';
import { screen, waitFor } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { renderWithRouter } from '../../../utils/tests';
import VideoFeedbackCard from '../VideoFeedbackCard';
import { VIDEO_FEEDBACK_CARD } from '../constants';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

describe('VideoFeedbackCard', () => {
  const mockEnterpriseCustomerUuid = 'mock-uuid';
  const mockVideoData = {
    videoId: 'test-video-id',
    courseRunKey: 'test-course-key',
    videoUsageKey: 'test-usage-key',
  };

  const VideoFeedbackCardWrapper = () => (
    <IntlProvider locale="en">
      <AppContext.Provider value={{}}>
        <VideoFeedbackCard
          videoId={mockVideoData.videoId}
          courseRunKey={mockVideoData.courseRunKey}
          enterpriseCustomerUuid={mockEnterpriseCustomerUuid}
          videoUsageKey={mockVideoData.videoUsageKey}
        />
      </AppContext.Provider>
    </IntlProvider>
  );

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders the feedback prompt', () => {
    renderWithRouter(<VideoFeedbackCardWrapper />);

    expect(screen.getByText(VIDEO_FEEDBACK_CARD.prompt)).toBeInTheDocument();
    expect(screen.getByLabelText('thumbs up')).toBeInTheDocument();
    expect(screen.getByLabelText('thumbs down')).toBeInTheDocument();
  });

  it('handles thumb up click and submits feedback', async () => {
    const user = userEvent.setup();
    renderWithRouter(<VideoFeedbackCardWrapper />);

    const thumbUpButton = screen.getByLabelText('thumbs up');
    await user.click(thumbUpButton);

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseCustomerUuid,
      'edx.ui.enterprise.learner_portal.video.feedback.thumb.submitted',
      {
        videoId: mockVideoData.videoId,
        courseRunKey: mockVideoData.courseRunKey,
        video_usage_key: mockVideoData.videoUsageKey,
        prompt: VIDEO_FEEDBACK_CARD.prompt,
        response: true,
      },
    );
  });

  it('handles thumb down click and renders additional options', async () => {
    const user = userEvent.setup();
    renderWithRouter(<VideoFeedbackCardWrapper />);

    const thumbDownButton = screen.getByLabelText('thumbs down');
    await user.click(thumbDownButton);

    await waitFor(() => {
      expect(screen.getByText(VIDEO_FEEDBACK_CARD.additionalDetailsLabel)).toBeInTheDocument();
    });

    const firstCheckbox = screen.getByRole('checkbox', {
      name: VIDEO_FEEDBACK_CARD.options[0],
    });
    await user.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();
  });

  it('submits feedback with additional options and comments', async () => {
    const user = userEvent.setup();
    renderWithRouter(<VideoFeedbackCardWrapper />);

    const thumbDownButton = screen.getByLabelText('thumbs down');
    await user.click(thumbDownButton);

    const firstCheckbox = screen.getByRole('checkbox', {
      name: VIDEO_FEEDBACK_CARD.options[0],
    });
    await user.click(firstCheckbox);

    const commentInput = screen.getByPlaceholderText(VIDEO_FEEDBACK_CARD.inputPlaceholder);
    await user.type(commentInput, 'test comment');

    const submitButton = screen.getByRole('button', { name: 'Submit feedback' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        mockEnterpriseCustomerUuid,
        'edx.ui.enterprise.learner_portal.video.feedback.response.submitted',
        expect.objectContaining({
          response: false,
          selectedOptions: [VIDEO_FEEDBACK_CARD.options[0]],
          comments: 'test comment',
          courseRunKey: 'test-course-key',
          videoId: 'test-video-id',
          video_usage_key: 'test-usage-key',
        }),
      );
    });
  });

  it('displays thank you message after feedback submission', async () => {
    const user = userEvent.setup();
    renderWithRouter(<VideoFeedbackCardWrapper />);

    const thumbUpButton = screen.getByLabelText('thumbs up');
    await user.click(thumbUpButton);

    await waitFor(() => {
      expect(screen.getByText(VIDEO_FEEDBACK_CARD.thankYouMessage)).toBeInTheDocument();
    });
  });

  it('retrieves feedback submission status from localStorage', () => {
    global.localStorage.setItem('test-video-id-feedbackSubmitted', 'true');
    renderWithRouter(<VideoFeedbackCardWrapper />);

    expect(screen.getByText(VIDEO_FEEDBACK_CARD.thankYouMessage)).toBeInTheDocument();
  });
});
