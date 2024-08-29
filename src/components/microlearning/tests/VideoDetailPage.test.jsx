import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { renderWithRouter } from '../../../utils/tests';
import VideoDetailPage from '../VideoDetailPage';
import {
  useVideoDetails, useEnterpriseCustomer, useVideoCourseMetadata,
  useVideoCourseReviews,
  useSubscriptions,
} from '../../app/data';
import { COURSE_PACING_MAP } from '../../course/data';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { features } from '../../../config';

const APP_CONFIG = {
  USE_API_CACHE: true,
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
};

const VIDEO_UUID = '3307f1bb-8b2d-43af-a5d5-030e2f8c81bd';

const VIDEO_MOCK_DATA = {
  courseTitle: 'Test Video',
  videoDuration: '10:4',
  videoSummary: 'This is a test video summary.',
  videoSkills: [{ skill_id: 1, name: 'Skill 1' }, { skill_id: 2, name: 'Skill 2' }],
  transcriptUrls: {
    en: 'https://prod-edx-video-transcripts.edx-video.net/video-transcripts/4149c8bc684d4c01a0d82bca3acd8047.sjson',
  },
  videoUrl: 'test-video-url.mp4',
  institutionLogo: 'test-institution-logo.png',
  courseKey: 'test-course-key',
};
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

jest.mock('@edx/frontend-platform/auth');
getAuthenticatedHttpClient.mockReturnValue(axios);
jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useVideoDetails: jest.fn(),
  useRedeemablePolicies: jest.fn(() => ({ data: { redeemablePolicies: [] } })),
  useVideoCourseMetadata: jest.fn(() => ({ data: { courseKey: 'test-course-key' } })),
  useVideoCourseReviews: jest.fn(() => ({ data: { courseKey: 'test-course-key' } })),
  useSubscriptions: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ enterpriseSlug: 'test-enterprise-uuid', videoUUID: VIDEO_UUID }),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => APP_CONFIG),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
  getMessages: () => ({}),
}));

const mockCourseRun = {
  isEnrollable: true,
  key: 'test-course-run-key',
  pacingType: COURSE_PACING_MAP.SELF_PACED,
  start: '2020-09-09T04:00:00Z',
  availability: 'Current',
  courseUuid: 'Foo',
  weeksToComplete: 4,
  minEffort: 2,
  maxEffort: 4,
  levelType: 'Introductory',
};
const mockCourseMetadata = {
  key: 'test-course-key',
  outcome: '<ul><li>hello i am descritpion</li></ul>',
  title: 'Test Course Title',
  activeCourseRun: mockCourseRun,
  courseRuns: [mockCourseRun],
};
const mockCourseReviews = {
  course_key: 'course-test-key',
  reviewsCount: 345,
  avgCourseRating: 3,
  confidentLearnersPercentage: 33,
  mostCommonGoal: 'Job advancement',
  mostCommonGoalLearnersPercentage: 34,
  totalEnrollments: 4444,
};

const defaultAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const VideoDetailPageWrapper = ({
  initialAppState = defaultAppState,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <VideoDetailPage />
    </AppContext.Provider>
  </IntlProvider>
);

describe('VideoDetailPage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useVideoDetails.mockReturnValue({ data: VIDEO_MOCK_DATA });
    useVideoCourseReviews.mockReturnValue({ data: mockCourseReviews });
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionLicense: {
          status: LICENSE_STATUS.ACTIVATED,
          subscriptionPlan: {
            enterpriseCatalogUuid: 'test-catalog-uuid',
            isCurrent: true,
          },
        },
      },
    });
    features.FEATURE_ENABLE_VIDEO_CATALOG = true;
  });

  it('Renders video details when data is available', () => {
    useVideoCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
    const { container } = renderWithRouter(<VideoDetailPageWrapper />);

    expect(screen.getByTestId('video-title')).toHaveTextContent('Test Video');
    expect(screen.getByText('(10:4 minutes)')).toBeInTheDocument();
    expect(screen.getByText('This is a test video summary.')).toBeInTheDocument();
    // Skills that we are currently retrieving for videos are inaccurate, so we are
    // temporarily hiding this section.
    // expect(screen.getByText('Skill 1')).toBeInTheDocument();
    // expect(screen.getByText('Skill 2')).toBeInTheDocument();
    expect(container.querySelector('.video-player-wrapper')).toBeTruthy();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(4);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.video.detail_page_viewed',
      {
        userId: mockAuthenticatedUser.userId,
        video: VIDEO_MOCK_DATA.videoUrl,
        courseKey: VIDEO_MOCK_DATA.courseKey,
        title: VIDEO_MOCK_DATA.courseTitle,
      },
    );
  });
  it('renders a video detail page when course level type is Intermediate', () => {
    useVideoCourseMetadata.mockReturnValue({ data: { ...mockCourseMetadata, activeCourseRun: { ...mockCourseRun, levelType: 'Intermediate' } } });
    renderWithRouter(<VideoDetailPageWrapper />);
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
  });

  it('renders a video detail page when course level type is Advanced', () => {
    useVideoCourseMetadata.mockReturnValue({ data: { ...mockCourseMetadata, activeCourseRun: { ...mockCourseRun, levelType: 'Advanced' } } });
    renderWithRouter(<VideoDetailPageWrapper />);
    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  it('renders a video detail page when course level is not from listed ones', () => {
    useVideoCourseMetadata.mockReturnValue({ data: { ...mockCourseMetadata, activeCourseRun: { ...mockCourseRun, levelType: 'Unknown' } } });
    renderWithRouter(<VideoDetailPageWrapper />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('renders a not found page when video data is not found', () => {
    useVideoDetails.mockReturnValue({ data: null });
    renderWithRouter(<VideoDetailPageWrapper />);
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });
  it('renders a not found page when user do not have active subscription', () => {
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionLicense: {
          status: LICENSE_STATUS.ACTIVATED,
          subscriptionPlan: {
            enterpriseCatalogUuid: 'test-catalog-uuid',
            isCurrent: false,
          },
        },
      },
    });
    renderWithRouter(<VideoDetailPageWrapper />);
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });
  it('Sends observability events for view course details click', () => {
    useVideoCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
    renderWithRouter(<VideoDetailPageWrapper />);
    userEvent.click(screen.getByText('View course details'));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(5);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.video.view_course_button.clicked',
      {
        userId: mockAuthenticatedUser.userId,
        video: VIDEO_MOCK_DATA.videoUrl,
        courseKey: VIDEO_MOCK_DATA.courseKey,
        title: VIDEO_MOCK_DATA.courseTitle,
      },
    );
  });
  it('Sends observability events for view more on course page click', () => {
    useVideoCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
    renderWithRouter(<VideoDetailPageWrapper />);
    userEvent.click(screen.getByText('View more on course page'));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(5);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.video.view_course_link.clicked',
      {
        userId: mockAuthenticatedUser.userId,
        video: VIDEO_MOCK_DATA.videoUrl,
        courseKey: VIDEO_MOCK_DATA.courseKey,
        title: VIDEO_MOCK_DATA.courseTitle,
      },
    );
  });
  it('Sends observability events for view more on course page hover', async () => {
    useVideoCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
    renderWithRouter(<VideoDetailPageWrapper />);
    userEvent.hover(screen.getByText('View more on course page'));
    userEvent.unhover(screen.getByText('View more on course page'));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(5);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.video.view_course_link.hovered',
      {
        userId: mockAuthenticatedUser.userId,
        video: VIDEO_MOCK_DATA.videoUrl,
        courseKey: VIDEO_MOCK_DATA.courseKey,
        title: VIDEO_MOCK_DATA.courseTitle,
      },
    );
  });
  it('Sends observability events for view course details hover', async () => {
    useVideoCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
    renderWithRouter(<VideoDetailPageWrapper />);
    userEvent.hover(screen.getByText('View course details'));
    userEvent.unhover(screen.getByText('View course details'));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(5);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      mockEnterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.video.view_course_button.hovered',
      {
        userId: mockAuthenticatedUser.userId,
        video: VIDEO_MOCK_DATA.videoUrl,
        courseKey: VIDEO_MOCK_DATA.courseKey,
        title: VIDEO_MOCK_DATA.courseTitle,
      },
    );
  });
});
