import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { UserSubsidyContext } from '../../enterprise-user-subsidy/UserSubsidy';
import { CourseContextProvider } from '../CourseContextProvider';
import CourseHeader from '../CourseHeader';

import { COURSE_AVAILABILITY_MAP, COURSE_PACING_MAP } from '../data/constants';
import { TEST_OWNER } from './data/constants';

jest.mock('react-router-dom', () => ({
  useLocation: () => ({
    search: '?enrollment_failed=true',
  }),
}));

// Stub out the enroll button to avoid testing its implementation here
jest.mock('../EnrollButton', () => () => <>Enroll</>);

/* eslint-disable react/prop-types */
const CourseHeaderWithContext = ({
  initialAppState = {},
  initialCourseState = {},
  initialUserSubsidyState = {},
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <CourseContextProvider initialState={initialCourseState}>
        <CourseHeader />
      </CourseContextProvider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<CourseHeader />', () => {
  // eslint-disable-next-line no-unused-vars
  let useDispatchSpy;
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
    },
  };
  const initialCourseState = {
    course: {
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
    },
    activeCourseRun: {
      isEnrollable: true,
      key: 'test-course-run-key',
      pacingType: COURSE_PACING_MAP.SELF_PACED,
      start: '2020-09-09T04:00:00Z',
      availability: 'Current',
      courseUuid: 'Foo',
    },
    userEnrollments: [],
    userEntitlements: [],
    catalog: {
      containsContentItems: true,
    },
  };
  const initialUserSubsidyState = {
    subscriptionLicense: {
      uuid: 'test-license-uuid',
    },
    offers: {
      offers: [],
      offersCount: 0,
    },
  };

  test('renders breadcrumb', () => {
    render(
      <CourseHeaderWithContext
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    expect(screen.queryByText('Find a Course')).toBeInTheDocument();
    expect(screen.queryAllByText(initialCourseState.course.title)[0]).toBeInTheDocument();
  });

  test('renders course title and short description', () => {
    render(
      <CourseHeaderWithContext
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    const { title, shortDescription } = initialCourseState.course;
    expect(screen.queryAllByText(title)[1]).toBeInTheDocument();
    expect(screen.queryByText(shortDescription)).toBeInTheDocument();
  });

  test('renders enroll button', () => {
    render(
      <CourseHeaderWithContext
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    expect(screen.queryByText('Enroll')).toBeInTheDocument();
  });

  test('renders course image', () => {
    render(
      <CourseHeaderWithContext
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.queryByAltText('course preview')).toBeInTheDocument();
  });

  test('renders partners', () => {
    render(
      <CourseHeaderWithContext
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    const partner = initialCourseState.course.owners[0];
    expect(screen.queryByAltText(`${partner.name} logo`)).toBeInTheDocument();
  });

  test('renders archived messaging', () => {
    const courseStateWithArchivedCourse = {
      ...initialCourseState,
      activeCourseRun: {
        ...initialCourseState.activeCourseRun,
        availability: COURSE_AVAILABILITY_MAP.ARCHIVED,
      },
    };

    render(
      <CourseHeaderWithContext
        initialAppState={initialAppState}
        initialCourseState={courseStateWithArchivedCourse}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.queryByText('Archived: Future Dates To Be Announced')).toBeInTheDocument();
  });

  test('renders not in catalog messaging', () => {
    const courseStateWithNoCatalog = {
      ...initialCourseState,
      catalog: {
        containsContentItems: false,
      },
    };

    render(
      <CourseHeaderWithContext
        initialAppState={initialAppState}
        initialCourseState={courseStateWithNoCatalog}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    const messaging = 'This course is not part of your company\'s curated course catalog.';
    expect(screen.queryByText(messaging)).toBeInTheDocument();

    expect(screen.queryByText('Enroll')).not.toBeInTheDocument();
  });

  test('renders an enrollment failed status alert when the enrollment failed query param is present', () => {
    render(
      <CourseHeaderWithContext
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.queryByRole('alert')).toBeInTheDocument();
  });

  describe('renders program messaging', () => {
    const courseStateWithProgramType = (type) => ({
      ...initialCourseState,
      course: {
        ...initialCourseState.course,
        programs: [{
          type,
        }],
      },
    });

    test('MicroMasters', () => {
      const micromasters = 'MicroMasters';

      render(
        <CourseHeaderWithContext
          initialAppState={initialAppState}
          initialCourseState={courseStateWithProgramType(micromasters)}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      const messaging = `This course is part of a ${micromasters}`;
      expect(screen.queryByText(messaging, { exact: false })).toBeInTheDocument();
    });

    test('Professional Certificate', () => {
      const profCert = 'Professional Certificate';

      render(
        <CourseHeaderWithContext
          initialAppState={initialAppState}
          initialCourseState={courseStateWithProgramType(profCert)}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      const messaging = `This course is part of a ${profCert}`;
      expect(screen.queryByText(messaging, { exact: false })).toBeInTheDocument();
    });
  });
});
