import React from 'react';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { renderWithRouter } from '../../../utils/tests';
import VideoDetailPage from '../VideoDetailPage';
import {
  useVideoDetails, useEnterpriseCustomer, useVideoCourseMetadata,
  useVideoCourseReviews,
} from '../../app/data';
import { COURSE_PACING_MAP } from '../../course/data';

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

jest.mock('@edx/frontend-platform/auth');
getAuthenticatedHttpClient.mockReturnValue(axios);
jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useVideoDetails: jest.fn(),
  useRedeemablePolicies: jest.fn(() => ({ data: { redeemablePolicies: [] } })),
  useVideoCourseMetadata: jest.fn(() => ({ data: { courseKey: 'test-course-key' } })),
  useVideoCourseReviews: jest.fn(() => ({ data: { courseKey: 'test-course-key' } })),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ enterpriseSlug: 'test-enterprise-uuid', videoUUID: VIDEO_UUID }),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => APP_CONFIG),
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

const VideoDetailPageWrapper = () => (
  <IntlProvider locale="en">
    <VideoDetailPage />
  </IntlProvider>
);

describe('VideoDetailPage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useVideoDetails.mockReturnValue({ data: VIDEO_MOCK_DATA });
    useVideoCourseReviews.mockReturnValue({ data: mockCourseReviews });
  });

  it('Renders video details when data is available', () => {
    useVideoCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
    const { container } = renderWithRouter(<VideoDetailPageWrapper />);

    expect(screen.getByTestId('video-title')).toHaveTextContent('Test Video');
    expect(screen.getByText('(10:4 minutes)')).toBeInTheDocument();
    expect(screen.getByText('This is a test video summary.')).toBeInTheDocument();
    expect(screen.getByText('Skill 1')).toBeInTheDocument();
    expect(screen.getByText('Skill 2')).toBeInTheDocument();
    expect(container.querySelector('.video-player-wrapper')).toBeTruthy();
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
});
