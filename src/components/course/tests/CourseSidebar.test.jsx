import { AppContext } from '@edx/frontend-platform/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import CourseSidebar from '../CourseSidebar';
import CourseSidebarListItem from '../CourseSidebarListItem';
import { CourseContext } from '../CourseContextProvider';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useCourseSubjects: jest.fn(() => ({
    primarySubject: {
      url: 'https://test.org/subject',
      name: 'Test Subject',
    },
  })),
  useCoursePartners: jest.fn(() => [
    [{
      key: 'Test Partner',
      marketingUrl: 'https://test.org/partner',
    }],
    'Institution',
  ]),
  useCourseRunWeeksToComplete: jest.fn(() => [
    8, 'Weeks',
  ]),
  useCourseTranscriptLanguages: jest.fn(() => [
    ['en-us'],
    'Transcript Language',
  ]),
  useCoursePacingType: jest.fn(() => [
    'instructor_paced',
    'Instructor Paced',
  ]),
}));

jest.mock('../CourseSidebarListItem', () => jest.fn(({ content }) => (
  <div data-testid="course-sidebar-list-item">
    {content}
  </div>
)));

jest.mock('../CourseAssociatedPrograms', () => jest.fn(() => (
  <div data-testid="course-associated-programs" />
)));

jest.mock('../CourseSidebarPrice', () => jest.fn(() => (
  <div data-testid="course-sidebar-price" />
)));

const baseAppContextValue = {
  enterpriseConfig: { uuid: 'test-enterprise-uuid' },
};

const mockCourse = {
  uuid: 'test-course-uuid',
  programs: [{ uuid: 'test-program-uuid' }],
  prerequisitesRaw: '<p>Test Prerequisites</p>',
};
const mockActiveCourseRun = {
  uuid: 'test-course-run-uuid',
  levelType: 'Introductory',
  weeksToComplete: 8,
  minEffort: 1,
  maxEffort: 2,
  contentLanguage: 'en-us',
};
const baseCourseContextValue = {
  state: {
    activeCourseRun: mockActiveCourseRun,
    course: mockCourse,
  },
};

const CourseSidebarWrapper = ({
  appContextValue = baseAppContextValue,
  courseContextValue = baseCourseContextValue,
}) => (
  <AppContext.Provider value={appContextValue}>
    <CourseContext.Provider value={courseContextValue}>
      <CourseSidebar />
    </CourseContext.Provider>
  </AppContext.Provider>
);

describe('CourseSidebarWrapper', () => {
  it('renders', () => {
    render(<CourseSidebarWrapper />);

    // length
    expect(CourseSidebarListItem).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.any(Object),
        label: 'Length',
        content: '8 Weeks',
      }),
      {},
    );

    // effort
    expect(CourseSidebarListItem).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.any(Object),
        label: 'Effort',
        content: '1-2 hours per week',
      }),
      {},
    );

    // price
    expect(CourseSidebarListItem).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.any(Object),
        label: 'Price',
        content: expect.any(Object),
      }),
      {},
    );
    expect(screen.getByTestId('course-sidebar-price')).toBeInTheDocument();

    // institution
    expect(CourseSidebarListItem).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.any(Object),
        label: 'Institution',
        content: expect.any(Array),
      }),
      {},
    );
    const partner = screen.getByText('Test Partner');
    expect(partner).toBeInTheDocument();
    userEvent.click(partner);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      'test-enterprise-uuid',
      'edx.ui.enterprise.learner_portal.course.sidebar.partner.clicked',
      {
        partner_name: 'Test Partner',
      },
    );

    // subject
    expect(CourseSidebarListItem).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.any(Object),
        label: 'Subject',
        content: expect.any(Object),
      }),
      {},
    );
    const subject = screen.getByText('Test Subject');
    expect(subject).toBeInTheDocument();
    userEvent.click(subject);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      'test-enterprise-uuid',
      'edx.ui.enterprise.learner_portal.course.sidebar.subject.clicked',
      {
        subject: 'Test Subject',
      },
    );

    // level type
    expect(CourseSidebarListItem).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.any(Object),
        label: 'Level',
        content: 'Introductory',
      }),
      {},
    );

    // language
    expect(CourseSidebarListItem).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.any(Object),
        label: 'Language',
        content: 'English',
      }),
      {},
    );

    // transcript language
    expect(CourseSidebarListItem).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.any(Object),
        label: 'Transcript Language',
        content: 'English',
      }),
      {},
    );

    // pacing type
    expect(CourseSidebarListItem).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.any(Object),
        label: 'Course Type',
        content: 'Instructor Paced',
      }),
      {},
    );

    // associated programs
    expect(screen.getByTestId('course-associated-programs')).toBeInTheDocument();

    // prerequisites
    expect(screen.getByText('Prerequisites')).toBeInTheDocument();
    expect(screen.getByText('Test Prerequisites')).toBeInTheDocument();
  });
});
