import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import CourseImportantDates from '../CourseImportantDates';
import { renderWithRouterProvider } from '../../../../utils/tests';
import { authenticatedUserFactory } from '../../../app/data/services/data/__factories__';
import { useCourseMetadata } from '../../../app/data';
import {
  COURSE_PACING_MAP,
  DATE_FORMAT,
  DATETIME_FORMAT,
  useIsCourseAssigned,
} from '../../data';
import { TEST_OWNER } from '../../tests/data/constants';

const mockAuthenticatedUser = authenticatedUserFactory();

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useCourseMetadata: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  useIsCourseAssigned: jest.fn(),
}));

const futureEarliestExpiration = dayjs().add(5, 'days').toISOString();
const pastEarliestExpiration = dayjs().subtract(5, 'days').toISOString();
const now = dayjs().toISOString();

const mockAllocatedAssignments = [{
  parentContentKey: 'edX+DemoX',
  contentKey: 'course-v1:edX+DemoX+2T2020',
  isAssignedCourseRun: true,
  earliestPossibleExpiration: {
    date: dayjs().add(10, 'days').toISOString(),
    reason: 'subsidy_expired',
  },
},
{
  parentContentKey: 'edX+DemoX',
  contentKey: 'course-v1:edX+DemoX+2018',
  isAssignedCourseRun: true,
  earliestPossibleExpiration: {
    date: now,
    reason: 'subsidy_expired',
  },
},
{
  parentContentKey: null,
  contentKey: 'edX+DemoX',
  isAssignedCourseRun: false,
  earliestPossibleExpiration: {
    date: dayjs().add(20, 'days').toISOString(),
    reason: 'subsidy_expired',
  },
}];

const mockCourseStartDate = dayjs().add(10, 'days').toISOString();

const mockCourseRun = {
  isEnrollable: true,
  key: 'course-v1:edX+DemoX+2018',
  pacingType: COURSE_PACING_MAP.SELF_PACED,
  start: mockCourseStartDate,
  availability: 'Current',
  courseUuid: 'Foo',
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
  availableCourseRuns: [mockCourseRun],
};

const CourseImportantDatesWrapper = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
      <CourseImportantDates />
    </AppContext.Provider>
  </IntlProvider>
);

describe('<CourseImportantDates />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ courseKey: 'edX+DemoX' });
    useCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
    useIsCourseAssigned.mockReturnValue({
      allocatedCourseRunAssignments: mockAllocatedAssignments,
      allocatedCourseRunAssignmentKeys: mockAllocatedAssignments.map((assignment) => assignment.contentKey),
      hasAssignedCourseRuns: mockAllocatedAssignments.length > 0,
    });
  });

  it('does not render without run-based assignments', () => {
    useIsCourseAssigned.mockReturnValue({
      allocatedCourseRunAssignments: [],
      allocatedCourseRunAssignmentKeys: [],
      hasAssignedCourseRuns: false,
    });
    const { container } = renderWithRouterProvider(<CourseImportantDatesWrapper />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders expected dates for run-based assignments', () => {
    renderWithRouterProvider(<CourseImportantDatesWrapper />);

    expect(screen.getByText('Important dates')).toBeInTheDocument();
    expect(screen.getByText('Enroll-by date')).toBeInTheDocument();
    expect(screen.getByText('Course starts')).toBeInTheDocument();

    expect(screen.getByText(dayjs(now).format(DATETIME_FORMAT))).toBeInTheDocument();
    expect(screen.getByText(dayjs(mockCourseStartDate).format(DATE_FORMAT))).toBeInTheDocument();
  });

  it.each([{
    courseStartDate: futureEarliestExpiration,
    expected: 'Course starts',
  },
  {
    courseStartDate: pastEarliestExpiration,
    expected: 'Course started',
  }])('renders the correct tense based on course start date (%s)', ({
    courseStartDate,
    expected,
  }) => {
    const updatedMockCourseRun = {
      ...mockCourseRun,
      start: courseStartDate,
    };
    const updatedMockCourseMetadata = {
      ...mockCourseMetadata,
      activeCourseRun: updatedMockCourseRun,
      courseRuns: [updatedMockCourseRun],
      availableCourseRuns: [updatedMockCourseRun],
    };
    useCourseMetadata.mockReturnValue({ data: updatedMockCourseMetadata });

    renderWithRouterProvider(<CourseImportantDatesWrapper />);

    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
