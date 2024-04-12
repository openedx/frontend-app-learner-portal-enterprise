import renderer from 'react-test-renderer';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import CourseMainContent from '../CourseMainContent';
import { useCourseMetadata } from '../../app/data';
import { TEST_OWNER } from './data/constants';
import { COURSE_PACING_MAP } from '../data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useCourseMetadata: jest.fn(),
}));
jest.mock('../CourseSidebar', () => jest.fn(() => <div data-testid="course-sidebar" />));
jest.mock('../../preview-expand', () => ({
  PreviewExpand: jest.fn(({ children }) => (
    <div data-testid="preview-expand">
      {children}
    </div>
  )),
}));

jest.mock('../CreatedBy', () => jest.fn(() => <div data-testid="created-by" />));

jest.mock('../VerifiedCertPitch', () => jest.fn(() => <div data-testid="verified-cert-pitch" />));

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn().mockReturnValue({
    MARKETING_SITE_BASE_URL: 'https://test-marketing-site-base-url',
  }),
}));

const CourseMainContentWrapper = () => (
  <IntlProvider locale="en">
    <CourseMainContent />
  </IntlProvider>
);

const mockCourseRun = {
  isEnrollable: true,
  key: 'test-course-run-key',
  pacingType: COURSE_PACING_MAP.SELF_PACED,
  start: '2020-09-09T04:00:00Z',
  availability: 'Current',
  courseUuid: 'Foo',
  type: 'verified',
  hasOfacRestrictions: true,
};

const mockCourseMetadata = {
  key: 'test-course-key',
  subjects: [{
    name: 'Test Subject 1',
    slug: 'test-subject-slug',
  }],
  shortDescription: 'Course short description.',
  title: 'Test Course Title',
  owners: [TEST_OWNER],
  programs: [],
  image: {
    src: 'http://test-image.url',
  },
  skills: [],
  activeCourseRun: mockCourseRun,
  courseRuns: [mockCourseRun],
  fullDescription: '<p>Test Description</p>',
  sponsors: [{
    name: 'Test Sponsor',
    marketingUrl: 'https://test.org',
    logoImageUrl: 'https://test.org/logo.png',
  }],
  outcome: '<p>Test Outcome</p>',
  syllabusRaw: '<p>Test Syllabus</p>',
  learnerTestimonials: '<p>Test Testimonials</p>',
  faq: '<p>Test FAQ</p>',
  additionalInformation: '<p>Test Additional Information</p>',
};

describe('ExternalCourseEnrollment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
  });
  it('renders and matches snapshot', () => {
    const tree = renderer.create(<CourseMainContentWrapper />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('handles 2 sponsors', () => {
    const updatedCourseMetadata = {
      ...mockCourseMetadata,
      sponsors: [{
        name: 'Test Sponsor',
        marketingUrl: 'https://test.org',
        logoImageUrl: 'https://test.org/logo.png',
      }, {
        name: 'Another Sponsor',
        marketingUrl: 'https://test.org',
        logoImageUrl: 'https://test.org/logo.png',
      }],
    };
    useCourseMetadata.mockReturnValue({ data: updatedCourseMetadata });
    render(<CourseMainContentWrapper />);
    expect(screen.getByText('Test Sponsor and Another Sponsor', { exact: false })).toBeInTheDocument();
  });

  it('handles 3+ sponsors', () => {
    const updatedCourseMetadata = {
      ...mockCourseMetadata,
      sponsors: [{
        name: 'Test Sponsor',
        marketingUrl: 'https://test.org',
        logoImageUrl: 'https://test.org/logo.png',
      }, {
        name: 'Another Sponsor',
        marketingUrl: 'https://test.org',
        logoImageUrl: 'https://test.org/logo.png',
      }, {
        name: 'Plus One Sponsor',
        marketingUrl: 'https://test.org',
        logoImageUrl: 'https://test.org/logo.png',
      }],
    };
    useCourseMetadata.mockReturnValue({ data: updatedCourseMetadata });
    render(<CourseMainContentWrapper />);
    expect(screen.getByText('Test Sponsor, Another Sponsor, and Plus One Sponsor', { exact: false })).toBeInTheDocument();
  });
});
