import React from 'react';
import { renderHook } from '@testing-library/react-hooks';

import { CourseContextProvider } from '../../CourseContextProvider';
import { useEnrollData } from '../hooks';

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

    const { result } = renderHook(() => useEnrollData(), {
      wrapper,
    });
    expect(result.current).toStrictEqual(expected);
  });
});
