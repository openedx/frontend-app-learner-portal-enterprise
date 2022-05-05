import React from 'react';
import PropTypes from 'prop-types';
import { renderHook } from '@testing-library/react-hooks';

import { CourseContextProvider } from '../../CourseContextProvider';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';
import { SubsidyRequestsContext } from '../../../enterprise-subsidy-requests';
import { COURSE_MODES_MAP } from '../../data/constants';
import { useEnrollData, useSubsidyDataForCourse } from '../hooks';

const BASE_COURSE_STATE = {
  activeCourseRun: {
    firstEnrollablePaidSeatPrice: 7.50,
    key: 'course_key',
    start: '2020-02-12T10:00:00Z',
    isEnrollable: false,
  },
  userSubsidyApplicableToCourse: null,
  course: {},
  userEnrollments: [],
  userEntitlements: [],
  catalog: {},
  courseRecommendations: {},
};

const LICENSE_UUID = 'test-license-uuid';
const subscriptionLicense = { uuid: LICENSE_UUID };

const baseSubsidyRequestContextValue = {
  catalogsForSubsidyRequests: new Set(),
};

const baseUserSubsidyState = {
  subscriptionLicense,
  offers: {
    offers: [],
    offersCount: 0,
  },
};

const ContextWrapper = ({
  initialCourseState,
  initialSubsidyRequestContextValue,
  initialUserSubsidyState,
  children,
}) => (
  <UserSubsidyContext.Provider value={initialUserSubsidyState}>
    <SubsidyRequestsContext.Provider value={initialSubsidyRequestContextValue}>
      <CourseContextProvider initialState={initialCourseState}>
        {children}
      </CourseContextProvider>
    </SubsidyRequestsContext.Provider>
  </UserSubsidyContext.Provider>
);

ContextWrapper.propTypes = {
  initialCourseState: PropTypes.shape(),
  initialSubsidyRequestContextValue: PropTypes.shape(),
  initialUserSubsidyState: PropTypes.shape(),
  children: PropTypes.node.isRequired,
};

ContextWrapper.defaultProps = {
  initialCourseState: BASE_COURSE_STATE,
  initialSubsidyRequestContextValue: baseSubsidyRequestContextValue,
  initialUserSubsidyState: baseUserSubsidyState,
};

describe('useEnrollData', () => {
  test('hooks correctly extracts enroll fields, when no enrollment', () => {
    const userEnrollment = undefined;
    const expected = {
      isEnrollable: BASE_COURSE_STATE.activeCourseRun.isEnrollable,
      isUserEnrolled: false, // since no userEnrollments are passed
      isCourseStarted: true, // since date in past
      userEnrollment,
    };

    const { result } = renderHook(() => useEnrollData(), { wrapper: ContextWrapper });
    expect(result.current).toStrictEqual(expected);
  });

  test('hooks correctly extracts enroll fields, when enrollment found', () => {
    const courseRunKey = BASE_COURSE_STATE.activeCourseRun.key;
    const anEnrollment = {
      isEnrollmentActive: true,
      isRevoked: false,
      courseRunId: courseRunKey,
      courseRunUrl: `courses/${courseRunKey}/course`,
      mode: COURSE_MODES_MAP.VERIFIED,
    };
    const courseState = { ...BASE_COURSE_STATE, userEnrollments: [anEnrollment] };
    const expected = {
      isEnrollable: courseState.activeCourseRun.isEnrollable,
      isUserEnrolled: true, // since a userEnrollment is passed
      isCourseStarted: true, // since date in past
      userEnrollment: anEnrollment,
    };

    // Needed to render our hook with context initialized
    // eslint-disable-next-line react/prop-types
    const wrapper = ({ children }) => (
      <ContextWrapper initialCourseState={courseState}>
        {children}
      </ContextWrapper>
    );

    const { result } = renderHook(() => useEnrollData(), { wrapper });
    expect(result.current).toStrictEqual(expected);
  });
});

describe('useSubsidyDataForCourse', () => {
  test('correctly extracts subsidy fields from UserSubsidyContext, absent offers', () => {
    const expected = {
      courseHasOffer: false,
      offersCount: 0,
      offers: [],
      subscriptionLicense,
      userSubsidyApplicableToCourse: BASE_COURSE_STATE.userSubsidyApplicableToCourse,
    };
    const { result } = renderHook(() => useSubsidyDataForCourse(), { wrapper: ContextWrapper });
    expect(result.current).toStrictEqual(expected);
  });
  test('correctly extracts subsidy fields from UserSubsidyContext, with offers', () => {
    const expected = {
      courseHasOffer: true,
      offersCount: 1,
      subscriptionLicense,
      offers: [{ catalog: 'catalog-1', discountValue: 10 }],
      userSubsidyApplicableToCourse: BASE_COURSE_STATE.userSubsidyApplicableToCourse,
    };
    const initialUserSubsidyState = {
      subscriptionLicense,
      offers: {
        offers: [{ catalog: 'catalog-1', discountValue: 10 }],
        offersCount: 1,
      },
    };

    const courseState = {
      ...BASE_COURSE_STATE,
      catalog: { catalogList: ['catalog-1', 'catalog-2'] },
    };
    // Needed to render our hook with context initialized
    // eslint-disable-next-line react/prop-types
    const wrapper = ({ children }) => (
      <ContextWrapper
        initialCourseState={courseState}
        initialUserSubsidyState={initialUserSubsidyState}
      >
        {children}
      </ContextWrapper>
    );
    const { result } = renderHook(() => useSubsidyDataForCourse(), { wrapper });
    expect(result.current).toStrictEqual(expected);
  });
});
