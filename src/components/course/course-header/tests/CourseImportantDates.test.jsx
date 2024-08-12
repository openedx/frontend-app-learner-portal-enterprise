import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import CourseImportantDates from '../CourseImportantDates';
import { renderWithRouterProvider } from '../../../../utils/tests';
import { authenticatedUserFactory } from '../../../app/data/services/data/__factories__';
import { useCourseMetadata, useRedeemablePolicies } from '../../../app/data';
import { COURSE_PACING_MAP, DATE_FORMAT } from '../../data';
import { TEST_OWNER } from '../../tests/data/constants';

const mockAuthenticatedUser = authenticatedUserFactory();

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useRedeemablePolicies: jest.fn(),
  useCourseMetadata: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

const mockBaseRedeemablePolicies = {
  redeemablePolicies: [],
  expiredPolicies: [],
  unexpiredPolicies: [],
  learnerContentAssignments: {
    assignments: [],
    hasAssignments: false,
    allocatedAssignments: [],
    hasAllocatedAssignments: false,
    acceptedAssignments: [],
    hasAcceptedAssignments: false,
    canceledAssignments: [],
    hasCanceledAssignments: false,
    expiredAssignments: [],
    hasExpiredAssignments: false,
    erroredAssignments: [],
    hasErroredAssignments: false,
    assignmentsForDisplay: [],
    hasAssignmentsForDisplay: false,
  },
};

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
    useRedeemablePolicies.mockReturnValue({ data: mockBaseRedeemablePolicies });
    useCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
  });
  it('renders without crashing', () => {
    const earliestExpiration = dayjs().add(5, 'days').toISOString();
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
        date: earliestExpiration,
        reason: 'subsidy_expired',
      },
    }, {
      parentContentKey: null,
      contentKey: 'edX+DemoX',
      isAssignedCourseRun: false,
      earliestPossibleExpiration: {
        date: dayjs().add(20, 'days').toISOString(),
        reason: 'subsidy_expired',
      },
    }];
    const mockLearnerContentAssignments = {
      allocatedAssignments: mockAllocatedAssignments,
      hasAllocatedAssignments: mockAllocatedAssignments.length > 0,
    };
    useRedeemablePolicies.mockReturnValue({
      data: {
        ...mockBaseRedeemablePolicies,
        learnerContentAssignments: {
          ...mockBaseRedeemablePolicies.learnerContentAssignments, ...mockLearnerContentAssignments,
        },
      },
    });

    renderWithRouterProvider(<CourseImportantDatesWrapper />);

    expect(screen.getByText('Important dates')).toBeTruthy();
    expect(screen.getByText('Enroll-by date')).toBeTruthy();
    expect(screen.getByText('Course starts')).toBeTruthy();

    expect(screen.getByText(dayjs(earliestExpiration).format(`${DATE_FORMAT} h:mm A`))).toBeTruthy();
    expect(screen.getByText(dayjs(mockCourseStartDate).format(DATE_FORMAT))).toBeTruthy();
  });
});
