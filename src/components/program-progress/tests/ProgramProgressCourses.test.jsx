import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';

import { AppContext } from '@edx/frontend-platform/react';
import moment from 'moment';
import ProgramProgressCourses from '../ProgramProgressCourses';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

describe('<EnrollModal />', () => {
  const userSubsidyState = {
    subscriptionLicense: {
      uuid: 'test-license-uuid',
    },
    offers: {
      offers: [],
      offersCount: 0,
    },
  };
  const appState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
    },
  };
  // eslint-disable-next-line react/prop-types
  const ProgramProgressCoursesWithContext = ({ initialAppState, initialUserSubsidyState, courseData }) => (
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <ProgramProgressCourses courseData={courseData} />
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  );
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
              runType: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: null,
            },
            {
              key: 'HarvardX/CS50x/2012',
              title: 'Introduction to Computer Science2',
              start: '2019-10-15T00:00:00Z',
              isEnrolled: false,
              end: null,
              pacingType: 'instructor_paced',
              runType: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: 'url',
            },
          ],
        },
      ],
    };
    render(<ProgramProgressCoursesWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      courseData={courseDataCompletedCourse}
    />);
    const courseLink = `/${appState.enterpriseConfig.slug}/course/${courseDataCompletedCourse.completed[0].key}`;
    expect(screen.getByText(courseDataCompletedCourse.completed[0].courseRuns[0].title)).toBeInTheDocument();
    expect(screen.getByText('View Course').closest('a')).toHaveAttribute('href', courseLink);
  });
  it('displays the in progress course with enrolled course run', () => {
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
              end: null,
              pacingType: 'instructor_paced',
              runType: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: null,
            },
            {
              key: 'HarvardX/CS50x/2012',
              title: 'Introduction to Computer Science2',
              start: '2019-10-15T00:00:00Z',
              isEnrolled: false,
              end: null,
              pacingType: 'instructor_paced',
              runType: '982c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: 'url',
            },
          ],
        },
      ],
    };
    render(<ProgramProgressCoursesWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      courseData={courseDataCompletedCourse}
    />);
    const courseLink = `/${appState.enterpriseConfig.slug}/course/${courseDataCompletedCourse.inProgress[0].key}`;
    expect(screen.getByText(courseDataCompletedCourse.inProgress[0].courseRuns[0].title)).toBeInTheDocument();
    expect(screen.getByText('View Course').closest('a')).toHaveAttribute('href', courseLink);
  });
  it('displays the not started course with single and multiple course runs', () => {
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
              isEnrolled: true,
              end: null,
              pacingType: 'instructor_paced',
              runType: '282c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
              certificate_url: null,
            },
            {
              key: 'HarvardX/CS10x/2014',
              title: 'Introduction to Computer Science2',
              start: '2014-10-15T00:00:00Z',
              isEnrolled: false,
              end: '2024-10-15T00:00:00Z',
              pacingType: 'instructor_paced',
              runType: '282c3c80-6bc5-41c4-aa11-bd6e90c3f55d',
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
              end: '2024-10-15T00:00:00Z',
              pacingType: 'instructor_paced',
              runType: '182c3c80-6bc5-41c4-aa11-bd6e90c3f534',
              certificate_url: null,
            },
          ],
        },
      ],
    };
    const courseRun = courseDataNotStartedCourse.notStarted[0].courseRuns;
    const courseRunDateWithOutEnd = `${moment(courseRun[0].start).format('MMMM Do, YYYY')}`;
    const courseRunDateWithEnd = `${moment(courseRun[1].start)
      .format('MMMM Do, YYYY')} - ${moment(courseRun[1].end).format('MMMM Do, YYYY')}`;
    render(<ProgramProgressCoursesWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      courseData={courseDataNotStartedCourse}
    />);
    const courseLink1 = `/${appState.enterpriseConfig.slug}/course/${courseDataNotStartedCourse.notStarted[0].key}`;
    const courseLink2 = `/${appState.enterpriseConfig.slug}/course/${courseDataNotStartedCourse.notStarted[1].key}`;
    expect(screen.getByText(courseDataNotStartedCourse.notStarted[0].title)).toBeInTheDocument();
    expect(screen.getByText(courseDataNotStartedCourse.notStarted[1].courseRuns[0].title)).toBeInTheDocument();
    expect(screen.getByText(courseRunDateWithOutEnd)).toBeInTheDocument();
    expect(screen.getByText(courseRunDateWithEnd)).toBeInTheDocument();
    expect(screen.getByText('Learn More').closest('a')).toHaveAttribute('href', courseLink1);
    expect(screen.getByText('Enroll Now').closest('a')).toHaveAttribute('href', courseLink2);
  });
});
