import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { useParams, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import CourseImportantDates from '../CourseImportantDates';
import { generateTestPermutations, renderWithRouterProvider } from '../../../../utils/tests';
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
  useSearchParams: jest.fn(),
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
    useSearchParams.mockReturnValue([new URLSearchParams(), jest.fn()]);
    useCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
    const hasAllocatedAssignments = mockAllocatedAssignments.length > 0;
    useIsCourseAssigned.mockReturnValue({
      isCourseAssigned: hasAllocatedAssignments,
      shouldDisplayAssignmentsOnly: hasAllocatedAssignments,
      allocatedCourseRunAssignments: mockAllocatedAssignments,
      allocatedCourseRunAssignmentKeys: mockAllocatedAssignments.map((assignment) => assignment.contentKey),
      hasAssignedCourseRuns: hasAllocatedAssignments,
    });
  });

  it.each(
    generateTestPermutations({
      isCourseAssigned: [false, true],
      shouldDisplayAssignmentsOnly: [false, true],
      hasAssignedCourseRuns: [false, true],
    }),
  )('renders depending on whether run-based assignments are allocated/prioritized (%s)', ({
    isCourseAssigned,
    shouldDisplayAssignmentsOnly,
    hasAssignedCourseRuns,
  }) => {
    const mockAllocatedCourseRunAssignments = [];
    if (hasAssignedCourseRuns) {
      mockAllocatedCourseRunAssignments.push(...mockAllocatedAssignments);
    }
    const mockAllocatedCourseRunAssignmentKeys = mockAllocatedCourseRunAssignments.map(
      (assignment) => assignment.contentKey,
    );
    useIsCourseAssigned.mockReturnValue({
      isCourseAssigned,
      shouldDisplayAssignmentsOnly,
      allocatedCourseRunAssignments: mockAllocatedCourseRunAssignments,
      allocatedCourseRunAssignmentKeys: mockAllocatedCourseRunAssignmentKeys,
      hasAssignedCourseRuns,
    });
    const shouldDisplayImportantDates = isCourseAssigned && shouldDisplayAssignmentsOnly && hasAssignedCourseRuns;
    const { container } = renderWithRouterProvider(<CourseImportantDatesWrapper />);
    if (shouldDisplayImportantDates) {
      expect(container).not.toBeEmptyDOMElement();
      expect(screen.getByText('Important dates')).toBeInTheDocument();
      expect(screen.getByText('Enroll-by date')).toBeInTheDocument();
      expect(screen.getByText('Course starts')).toBeInTheDocument();

      expect(screen.getByText(dayjs(now).format(DATETIME_FORMAT))).toBeInTheDocument();
      expect(screen.getByText(dayjs(mockCourseStartDate).format(DATE_FORMAT))).toBeInTheDocument();
    } else {
      expect(container).toBeEmptyDOMElement();
    }
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
