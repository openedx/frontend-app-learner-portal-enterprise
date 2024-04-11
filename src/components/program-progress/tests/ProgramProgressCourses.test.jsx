import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { AppContext } from '@edx/frontend-platform/react';
import dayjs from '../../../utils/dayjs';
import ProgramProgressCourses from '../ProgramProgressCourses';
import { NotCurrentlyAvailable } from '../data/constants';
import { useEnterpriseCustomer, useHasAvailableSubsidiesOrRequests } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useHasAvailableSubsidiesOrRequests: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const mockAppContext = authenticatedUserFactory();

const ProgramProgressCoursesWithContext = ({
  courseData,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={mockAppContext}>
      <ProgramProgressCourses courseData={courseData} />
    </AppContext.Provider>
  </IntlProvider>
);

const mockUseActiveSubsidiesOrRequestsData = {
  mockHasAssignedCodesOrCodeRequests: false,
  mockHasActiveLicenseOrLicenseRequest: false,
  mockLearnerCreditSummaryCardData: {},
};
const mockUseHasAvailableSubsidiesOrRequests = ({
  mockHasAssignedCodesOrCodeRequests,
  mockHasActiveLicenseOrLicenseRequest,
  mockLearnerCreditSummaryCardData,
}) => ({
  hasAvailableLearnerCreditPolicies: false,
  hasAssignedCodesOrCodeRequests: mockHasAssignedCodesOrCodeRequests,
  learnerCreditSummaryCardData: mockLearnerCreditSummaryCardData,
  hasActiveLicenseOrLicenseRequest: mockHasActiveLicenseOrLicenseRequest,
  hasAvailableSubsidyOrRequests: mockHasAssignedCodesOrCodeRequests
    || mockHasActiveLicenseOrLicenseRequest
    || mockLearnerCreditSummaryCardData,
});

describe('<ProgramProgressCourses />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(
      mockUseHasAvailableSubsidiesOrRequests(mockUseActiveSubsidiesOrRequestsData),
    );
  });

  it('displays the completed course with enrolled course run', () => {
    const courseDataCompletedCourse = {
      inProgress: [],
      notStarted: [],
      completed: [
        {
          key: 'HarvardX+CS50x',
          title: 'Introduction to Computer Science',
          courseRuns: [
            {
              key: 'HarvardX/CS50x/2012',
              title: 'Introduction to Computer Science1',
              start: '2015-10-15T00:00:00Z',
              isEnrolled: true,
              end: null,
              pacingType: 'instructor_paced',
              uuid: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: null,
            },
            {
              key: 'HarvardX/CS50x/2012',
              title: 'Introduction to Computer Science2',
              start: '2019-10-15T00:00:00Z',
              isEnrolled: false,
              end: null,
              pacingType: 'instructor_paced',
              uuid: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: 'url',
            },
          ],
        },
      ],
    };
    render(<ProgramProgressCoursesWithContext courseData={courseDataCompletedCourse} />);
    const courseLink = `/${mockEnterpriseCustomer.slug}/course/${courseDataCompletedCourse.completed[0].key}`;
    expect(screen.getByText(courseDataCompletedCourse.completed[0].courseRuns[0].title)).toBeInTheDocument();
    expect(screen.getByText('View Course').closest('a')).toHaveAttribute('href', courseLink);
  });
  it('displays the in progress course', () => {
    const courseDataCompletedCourse = {
      completed: [],
      notStarted: [],
      inProgress: [
        {
          key: 'HarvardX+CS50x',
          title: 'Introduction to Computer Science',
          courseRuns: [
            {
              key: 'HarvardX/CS50x/2012',
              title: 'Introduction to Computer Science1',
              start: '2015-10-15T00:00:00Z',
              isEnrolled: true,
              isEnrollmentOpen: true,
              isCourseEnded: false,
              status: 'published',
              end: null,
              pacingType: 'instructor_paced',
              uuid: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: null,
            },
            {
              key: 'HarvardX/CS50x/2012',
              title: 'Introduction to Computer Science2',
              start: '2019-10-15T00:00:00Z',
              isEnrolled: false,
              end: null,
              pacingType: 'instructor_paced',
              uuid: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: 'url',
            },
          ],
        },
      ],
    };
    render(<ProgramProgressCoursesWithContext courseData={courseDataCompletedCourse} />);
    const courseLink = `/${mockEnterpriseCustomer.slug}/course/${courseDataCompletedCourse.inProgress[0].key}`;
    expect(screen.getByText(courseDataCompletedCourse.inProgress[0].courseRuns[0].title)).toBeInTheDocument();
    expect(screen.getByText('View Course').closest('a')).toHaveAttribute('href', courseLink);
  });

  it('displays the only one in progress course when enrolled in multiple runs', () => {
    const courseDataCompletedCourse = {
      completed: [],
      notStarted: [],
      inProgress: [
        {
          key: 'HarvardX+CS50x',
          title: 'Introduction to Computer Science',
          courseRuns: [
            {
              key: 'HarvardX/CS50x/2012',
              title: 'Introduction to Computer Science1',
              start: '2015-10-15T00:00:00Z',
              isEnrolled: true,
              isEnrollmentOpen: false,
              isCourseEnded: false,
              status: 'published',
              end: null,
              pacingType: 'instructor_paced',
              uuid: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: null,
            },
            {
              key: 'HarvardX/CS50x/2012',
              title: 'Introduction to Computer Science2',
              start: '2019-10-15T00:00:00Z',
              isEnrolled: true,
              isEnrollmentOpen: true,
              end: null,
              pacingType: 'instructor_paced',
              uuid: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: 'url',
            },
          ],
        },
      ],
    };
    render(<ProgramProgressCoursesWithContext courseData={courseDataCompletedCourse} />);

    const courseLink = `/${mockEnterpriseCustomer.slug}/course/${courseDataCompletedCourse.inProgress[0].key}`;
    expect(screen.getByText(courseDataCompletedCourse.inProgress[0].courseRuns[1].title)).toBeInTheDocument();
    expect(screen.queryByText(courseDataCompletedCourse.inProgress[0].courseRuns[0].title)).toBeNull();
    expect(screen.getByText('View Course').closest('a')).toHaveAttribute('href', courseLink);
  });

  it('displays the in progress course which can be upgrade to verified certificate with license', () => {
    const courseDataCompletedCourse = {
      completed: [],
      notStarted: [],
      inProgress: [
        {
          key: 'HarvardX+CS50x',
          title: 'Introduction to Computer Science',
          courseRuns: [
            {
              key: 'HarvardX/CS50x/2012',
              title: 'Introduction to Computer Science1',
              upgradeUrl: 'https://www.edx.org/course/introduction-computer-science-harvardx-cs50x',
              start: '2015-10-15T00:00:00Z',
              isEnrollmentOpen: false,
              isCourseEnded: true,
              status: 'archived',
              end: null,
              pacingType: 'instructor_paced',
              uuid: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              isEnrolled: true,
              expired: false,
              certificate_url: null,
              seats: [
                {
                  type: 'verified',
                  price: '149.00',
                  currency: 'USD',
                  upgradeDeadline: '2022-04-06T06:36:26.667883Z',
                  sku: '8CF08E5',
                  bulk_sku: 'A5B6DBE',
                },
                {
                  type: 'audit',
                  price: '0.00',
                  currency: 'USD',
                  sku: '68EFFFF',
                  bulk_sku: null,
                },
              ],
            },
            {
              key: 'HarvardX/CS50x/2012',
              title: 'Introduction to Computer Science2',
              start: '2019-10-15T00:00:00Z',
              isEnrolled: false,
              end: null,
              pacingType: 'instructor_paced',
              uuid: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: 'url',
            },
          ],
        },
      ],
    };

    useHasAvailableSubsidiesOrRequests.mockReturnValue(mockUseHasAvailableSubsidiesOrRequests({
      mockHasActiveLicenseOrLicenseRequest: true,
    }));
    render((
      <ProgramProgressCoursesWithContext courseData={courseDataCompletedCourse} />
    ));
    const courseLink = `/${mockEnterpriseCustomer.slug}/course/${courseDataCompletedCourse.inProgress[0].key}`;
    expect(screen.getByText(courseDataCompletedCourse.inProgress[0].courseRuns[0].title)).toBeInTheDocument();
    expect(screen.getByText('View Archived Course').closest('a')).toHaveAttribute('href', courseLink);
    expect(screen.getByText('Upgrade to Verified').closest('a')).toHaveAttribute('href', courseLink);
    expect(screen.getByText(`Sponsored by ${mockEnterpriseCustomer.name}`)).toBeInTheDocument();
  });

  it('displays the in progress course which is not open for enrollment anymore', () => {
    const courseDataCompletedCourse = {
      completed: [],
      notStarted: [],
      inProgress: [
        {
          key: 'HarvardX+CS50x',
          title: 'Introduction to Computer Science',
          courseRuns: [
            {
              key: 'HarvardX/CS50x/2012',
              title: 'Introduction to Computer Science1',
              start: '2015-10-15T00:00:00Z',
              isEnrolled: true,
              isEnrollmentOpen: false,
              isCourseEnded: true,
              status: 'archived',
              end: null,
              pacingType: 'instructor_paced',
              uuid: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: null,
            },
            {
              key: 'HarvardX/CS50x/2012',
              title: 'Introduction to Computer Science2',
              start: '2019-10-15T00:00:00Z',
              isEnrolled: false,
              end: null,
              pacingType: 'instructor_paced',
              uuid: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: 'url',
            },
          ],
        },
      ],
    };
    render(<ProgramProgressCoursesWithContext courseData={courseDataCompletedCourse} />);
    const courseLink = `/${mockEnterpriseCustomer.slug}/course/${courseDataCompletedCourse.inProgress[0].key}`;
    expect(screen.getByText(courseDataCompletedCourse.inProgress[0].courseRuns[0].title)).toBeInTheDocument();
    expect(screen.getByText('View Archived Course').closest('a')).toHaveAttribute('href', courseLink);
  });
  it('displays the not started course with single course run available', () => {
    const courseDataNotStartedCourse = {
      inProgress: [],
      completed: [],
      notStarted: [
        {
          key: 'edx+edx1',
          title: 'Introduction to edX',
          courseRuns: [
            {
              key: 'edx+edx1/2018',
              title: 'Introduction to edX1',
              start: '2018-10-15T00:00:00Z',
              isEnrolled: false,
              isEnrollmentOpen: true,
              isCourseEnded: false,
              status: 'published',
              end: '2024-10-15T00:00:00Z',
              pacingType: 'instructor_paced',
              uuid: '182c3c80-6bc5-41c4-aa11-bd6e90c3f534',
              certificate_url: null,
            },
          ],
        },
      ],
    };
    const courseRunEnrollable = courseDataNotStartedCourse.notStarted[0].courseRuns;
    render(<ProgramProgressCoursesWithContext courseData={courseDataNotStartedCourse} />);
    const courseLink = `/${mockEnterpriseCustomer.slug}/course/${courseDataNotStartedCourse.notStarted[0].key}`;
    expect(screen.getByText(courseRunEnrollable[0].title)).toBeInTheDocument();
    expect(screen.getByText('Enroll now').closest('a')).toHaveAttribute('href', courseLink);
  });

  it('displays the not started course with no course run available for enrollment', () => {
    const courseDataNotStartedCourse = {
      inProgress: [],
      completed: [],
      notStarted: [
        {
          key: 'edx+edx1',
          title: 'Introduction to edX1',
          courseRuns: [
            {
              key: 'edx+edx1/2018',
              title: 'Introduction to edX1',
              start: '2018-10-15T00:00:00Z',
              isEnrolled: false,
              isEnrollmentOpen: false,
              isCourseEnded: false,
              status: 'published',
              end: '2024-10-15T00:00:00Z',
              pacingType: 'instructor_paced',
              uuid: '182c3c80-6bc5-41c4-aa11-bd6e90c3f534',
              certificate_url: null,
            },
          ],
        },
      ],
    };

    render(<ProgramProgressCoursesWithContext courseData={courseDataNotStartedCourse} />);
    expect(screen.getByText(courseDataNotStartedCourse.notStarted[0].title)).toBeInTheDocument();
    expect(screen.getByText(NotCurrentlyAvailable)).toBeInTheDocument();
  });

  it('displays the not started course with multiple runs and one of them is enrollable', () => {
    const courseDataNotStartedCourse = {
      inProgress: [],
      completed: [],
      notStarted: [
        {
          key: 'HarvardX+CS10x',
          title: 'Introduction to Science',
          courseRuns: [
            {
              key: 'HarvardX/CS10x/2013',
              title: 'Introduction to Science',
              start: '2013-10-15T00:00:00Z',
              isEnrolled: false,
              isEnrollmentOpen: false,
              isCourseEnded: true,
              status: 'published',
              end: '2021-11-01T00:00:00Z',
              pacingType: 'instructor_paced',
              uuid: '282c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: null,
            },
            {
              key: 'HarvardX/CS10x/2014',
              title: 'Introduction to Computer Science',
              start: '2014-10-15T00:00:00Z',
              end: '2024-10-15T00:00:00Z',
              pacingType: 'instructor_paced',
              uuid: '282c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: null,
              isEnrolled: false,
              isEnrollmentOpen: true,
              isCourseEnded: false,
              status: 'published',
            },
          ],
        },
      ],
    };
    const courseRun = courseDataNotStartedCourse.notStarted[0].courseRuns;
    const courseRunDateNotEnrollable = `${dayjs(courseRun[0].start)
      .format('MMMM Do, YYYY')} - ${dayjs(courseRun[0].end).format('MMMM Do, YYYY')}`;
    render(<ProgramProgressCoursesWithContext courseData={courseDataNotStartedCourse} />);
    const courseLink1 = `/${mockEnterpriseCustomer.slug}/course/${courseDataNotStartedCourse.notStarted[0].key}`;
    expect(screen.getByText(courseDataNotStartedCourse.notStarted[0].title)).toBeInTheDocument();
    expect(screen.queryByText(courseRunDateNotEnrollable)).not.toBeInTheDocument();
    expect(screen.getByTestId('course-run-single-date')).toBeVisible();
    expect(screen.getByText('Learn more').closest('a')).toHaveAttribute('href', courseLink1);
  });

  it('displays the not started course with multiple course runs', () => {
    const courseDataNotStartedCourse = {
      inProgress: [],
      completed: [],
      notStarted: [
        {
          key: 'HarvardX+CS10x',
          title: 'Introduction to Science',
          courseRuns: [
            {
              key: 'HarvardX/CS10x/2013',
              title: 'Introduction to Science1',
              start: '2013-10-15T00:00:00Z',
              isEnrolled: false,
              isEnrollmentOpen: true,
              isCourseEnded: false,
              status: 'published',
              end: null,
              pacingType: 'instructor_paced',
              uuid: '282c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: null,
            },
            {
              key: 'HarvardX/CS10x/2014',
              title: 'Introduction to Computer Science2',
              start: '2014-10-15T00:00:00Z',
              isEnrolled: false,
              isEnrollmentOpen: true,
              isCourseEnded: false,
              status: 'published',
              end: '2024-10-15T00:00:00Z',
              pacingType: 'instructor_paced',
              uuid: '282c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: null,
            },
          ],
        },
        {
          key: 'edx+edx1',
          title: 'Introduction to edX',
          courseRuns: [
            {
              key: 'edx+edx1/2018',
              title: 'Introduction to edX1',
              start: '2018-10-15T00:00:00Z',
              isEnrolled: false,
              isEnrollmentOpen: true,
              isCourseEnded: false,
              status: 'published',
              end: '2024-10-15T00:00:00Z',
              pacingType: 'instructor_paced',
              uuid: '182c3c80-6bc5-41c4-aa11-bd6e90c3f534',
              certificate_url: null,
            },
          ],
        },
      ],
    };
    const courseRun = courseDataNotStartedCourse.notStarted[0].courseRuns;
    const courseRunDateWithOutEnd = `${dayjs(courseRun[0].start).format('MMMM Do, YYYY')}`;
    const courseRunDateWithEnd = `${dayjs(courseRun[1].start)
      .format('MMMM Do, YYYY')} - ${dayjs(courseRun[1].end).format('MMMM Do, YYYY')}`;
    render(<ProgramProgressCoursesWithContext courseData={courseDataNotStartedCourse} />);
    const courseLink1 = `/${mockEnterpriseCustomer.slug}/course/${courseDataNotStartedCourse.notStarted[0].key}`;
    const courseLink2 = `/${mockEnterpriseCustomer.slug}/course/${courseDataNotStartedCourse.notStarted[1].key}`;
    expect(screen.getByText(courseDataNotStartedCourse.notStarted[0].title)).toBeInTheDocument();
    expect(screen.getByText(courseDataNotStartedCourse.notStarted[1].courseRuns[0].title)).toBeInTheDocument();
    expect(screen.getByText(courseRunDateWithOutEnd)).toBeInTheDocument();
    expect(screen.getByText(courseRunDateWithEnd)).toBeInTheDocument();
    expect(screen.getByText('Learn more').closest('a')).toHaveAttribute('href', courseLink1);
    expect(screen.getByText('Enroll now').closest('a')).toHaveAttribute('href', courseLink2);
  });
});
