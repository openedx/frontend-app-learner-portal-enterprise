import React from 'react';
import { renderHook } from '@testing-library/react-hooks';

import { AppContext } from '@edx/frontend-platform/react';

import { CourseContextProvider } from '../../CourseContextProvider';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';

import { useEnrollData, useSubsidyData } from '../hooks';

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
  catalog: [],
};

describe('useEnrollData tests', () => {
  test('correct extraction of enroll fields', () => {
    const userEnrollment = undefined;
    const expected = {
      isEnrollable: false,
      isUserEnrolled: false, // since no userEnrollments are passed
      isCourseStarted: true, // since date in past
      userEnrollment,
    };

    // Needed to render our hook with context initialized
    // eslint-disable-next-line react/prop-types
    const wrapper = ({ children }) => (
      <CourseContextProvider initialState={BASE_COURSE_STATE}>{children}</CourseContextProvider>
    );

    const { result } = renderHook(() => useEnrollData(), { wrapper });
    expect(result.current).toStrictEqual(expected);
  });
});

describe('useSubsidyData tests', () => {
  const LICENSE_UUID = 'test-license-uuid';
  const subscriptionLicense = { uuid: LICENSE_UUID };

  test('correct extraction of subsidy fields from UserSubsidyContext', () => {
    const expected = {
      courseHasOffer: false,
      offersCount: 0,
      subscriptionLicense,
      userSubsidyApplicableToCourse: BASE_COURSE_STATE.userSubsidyApplicableToCourse,
    };
    const initialUserSubsidyState = {
      subscriptionLicense,
      offers: {
        offers: [],
        offersCount: 0,
      },
    };
    // Needed to render our hook with context initialized
    // eslint-disable-next-line react/prop-types
    const wrapper = ({ children }) => (
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <CourseContextProvider initialState={BASE_COURSE_STATE}>{children}</CourseContextProvider>
      </UserSubsidyContext.Provider>
    );
    const { result } = renderHook(() => useSubsidyData(), { wrapper });
    expect(result.current).toStrictEqual(expected);
  });
});
