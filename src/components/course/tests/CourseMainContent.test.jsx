import renderer from 'react-test-renderer';
import { AppContext } from '@edx/frontend-platform/react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import CourseMainContent from '../CourseMainContent';
import { CourseContext } from '../CourseContextProvider';

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

const baseCourseContextValue = {
  state: {
    activeCourseRun: {
      type: 'verified',
      hasOfacRestrictions: true,
    },
    course: {
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
    },
  },
};

const baseAppContextValue = {
  config: {
    MARKETING_SITE_BASE_URL: 'https://test.org',
  },
};

const CourseMainContentWrapper = ({
  appContextValue = baseAppContextValue,
  courseContextValue = baseCourseContextValue,
}) => (
  <AppContext.Provider value={appContextValue}>
    <CourseContext.Provider value={courseContextValue}>
      <CourseMainContent />
    </CourseContext.Provider>
  </AppContext.Provider>
);

describe('ExternalCourseEnrollment', () => {
  it('renders and matches snapshot', () => {
    const tree = renderer.create(<CourseMainContentWrapper />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('handles 2 sponsors', () => {
    const courseContextValue = {
      ...baseCourseContextValue,
      state: {
        ...baseCourseContextValue.state,
        course: {
          ...baseCourseContextValue.state.course,
          sponsors: [{
            name: 'Test Sponsor',
            marketingUrl: 'https://test.org',
            logoImageUrl: 'https://test.org/logo.png',
          }, {
            name: 'Another Sponsor',
            marketingUrl: 'https://test.org',
            logoImageUrl: 'https://test.org/logo.png',
          }],
        },
      },
    };
    render(<CourseMainContentWrapper courseContextValue={courseContextValue} />);
    expect(screen.getByText('Test Sponsor and Another Sponsor', { exact: false })).toBeInTheDocument();
  });

  it('handles 3+ sponsors', () => {
    const courseContextValue = {
      ...baseCourseContextValue,
      state: {
        ...baseCourseContextValue.state,
        course: {
          ...baseCourseContextValue.state.course,
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
        },
      },
    };
    render(<CourseMainContentWrapper courseContextValue={courseContextValue} />);
    expect(screen.getByText('Test Sponsor, Another Sponsor, and Plus One Sponsor', { exact: false })).toBeInTheDocument();
  });
});
