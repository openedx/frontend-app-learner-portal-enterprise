import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';

import { AppContext } from '@edx/frontend-platform/react';
import dayjs from '../../../utils/dayjs';
import ProgramProgressCourses from '../ProgramProgressCourses';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { NotCurrentlyAvailable } from '../data/constants';
import { SUBSIDY_REQUEST_STATE, SUBSIDY_TYPE, SubsidyRequestsContext } from '../../enterprise-subsidy-requests';

const mockCatalogUUID = 'uuid';
const initialSubscriptions = [
  {
    enterpriseCatalogUuid: mockCatalogUUID,
  },
];

const initialLicenseRequests = [
  {
    state: SUBSIDY_REQUEST_STATE.REQUESTED,
  },
];
const userSubsidyState = {
  subscriptionLicense: {
    uuid: 'test-license-uuid',
  },
  couponCodes: {
    couponCodes: [],
    couponCodesCount: 0,
  },
};
const appState = {
  enterpriseConfig: {
    slug: 'test-enterprise-slug',
    name: 'test',
  },
};
const subsidyRequestsState = {
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
};

const ProgramProgressCoursesWithContext = ({
  initialAppState, initialUserSubsidyState, courseData, initialSubsidyRequestsState,
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
        <ProgramProgressCourses courseData={courseData} />
      </SubsidyRequestsContext.Provider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

describe('<ProgramProgressCourses />', () => {
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
    render(<ProgramProgressCoursesWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      initialSubsidyRequestsState={subsidyRequestsState}
      courseData={courseDataCompletedCourse}
    />);
    const courseLink = `/${appState.enterpriseConfig.slug}/course/${courseDataCompletedCourse.completed[0].key}`;
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
    render(<ProgramProgressCoursesWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      initialSubsidyRequestsState={subsidyRequestsState}
      courseData={courseDataCompletedCourse}
    />);
    const courseLink = `/${appState.enterpriseConfig.slug}/course/${courseDataCompletedCourse.inProgress[0].key}`;
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
    render(<ProgramProgressCoursesWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      initialSubsidyRequestsState={subsidyRequestsState}
      courseData={courseDataCompletedCourse}
    />);

    const courseLink = `/${appState.enterpriseConfig.slug}/course/${courseDataCompletedCourse.inProgress[0].key}`;
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
    const customUserSubsidyState = {
      couponCodes: {
        couponCodes: [],
        couponCodesCount: 0,
      },
      subscriptionLicense: {},
      customerAgreementConfig: {
        subscriptions: initialSubscriptions,
      },
    };
    const customSubsidyRequestsState = {
      subsidyRequestConfiguration: null,
      requestsBySubsidyType: {
        [SUBSIDY_TYPE.LICENSE]: initialLicenseRequests,
        [SUBSIDY_TYPE.COUPON]: [],
      },
    };

    render((
      <ProgramProgressCoursesWithContext
        initialAppState={appState}
        initialUserSubsidyState={customUserSubsidyState}
        initialSubsidyRequestsState={customSubsidyRequestsState}
        courseData={courseDataCompletedCourse}
      />
    ));
    const courseLink = `/${appState.enterpriseConfig.slug}/course/${courseDataCompletedCourse.inProgress[0].key}`;
    expect(screen.getByText(courseDataCompletedCourse.inProgress[0].courseRuns[0].title)).toBeInTheDocument();
    expect(screen.getByText('View Archived Course').closest('a')).toHaveAttribute('href', courseLink);
    expect(screen.getByText('Upgrade to Verified').closest('a')).toHaveAttribute('href', courseLink);
    expect(screen.getByText('Sponsored by test')).toBeInTheDocument();
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
    render(<ProgramProgressCoursesWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      initialSubsidyRequestsState={subsidyRequestsState}
      courseData={courseDataCompletedCourse}
    />);
    const courseLink = `/${appState.enterpriseConfig.slug}/course/${courseDataCompletedCourse.inProgress[0].key}`;
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
    render(<ProgramProgressCoursesWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      initialSubsidyRequestsState={subsidyRequestsState}
      courseData={courseDataNotStartedCourse}
    />);
    const courseLink = `/${appState.enterpriseConfig.slug}/course/${courseDataNotStartedCourse.notStarted[0].key}`;
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

    render(<ProgramProgressCoursesWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      initialSubsidyRequestsState={subsidyRequestsState}
      courseData={courseDataNotStartedCourse}
    />);
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
    render(<ProgramProgressCoursesWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      initialSubsidyRequestsState={subsidyRequestsState}
      courseData={courseDataNotStartedCourse}
    />);
    const courseLink1 = `/${appState.enterpriseConfig.slug}/course/${courseDataNotStartedCourse.notStarted[0].key}`;
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
    render(<ProgramProgressCoursesWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      initialSubsidyRequestsState={subsidyRequestsState}
      courseData={courseDataNotStartedCourse}
    />);
    const courseLink1 = `/${appState.enterpriseConfig.slug}/course/${courseDataNotStartedCourse.notStarted[0].key}`;
    const courseLink2 = `/${appState.enterpriseConfig.slug}/course/${courseDataNotStartedCourse.notStarted[1].key}`;
    expect(screen.getByText(courseDataNotStartedCourse.notStarted[0].title)).toBeInTheDocument();
    expect(screen.getByText(courseDataNotStartedCourse.notStarted[1].courseRuns[0].title)).toBeInTheDocument();
    expect(screen.getByText(courseRunDateWithOutEnd)).toBeInTheDocument();
    expect(screen.getByText(courseRunDateWithEnd)).toBeInTheDocument();
    expect(screen.getByText('Learn more').closest('a')).toHaveAttribute('href', courseLink1);
    expect(screen.getByText('Enroll now').closest('a')).toHaveAttribute('href', courseLink2);
  });
});
