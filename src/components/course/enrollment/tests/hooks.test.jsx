import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import PropTypes from 'prop-types';

import { CourseContextProvider } from '../../CourseContextProvider';
import { useEnrollData } from '../hooks';

const BASE_COURSE_STATE = {
  activeCourseRun: {
    firstEnrollablePaidSeatPrice: 7.50,
    key: 'course_key',
    start: '2020-02-12T10:00:00Z',
    isEnrollable: true,
  },
  userSubsidyApplicableToCourse: null,
  course: {},
  userEnrollments: [],
  userEntitlements: [],
  catalog: [],
};

// Needed to render our hook with context initialized
const wrapper = ({ children, initialState }) => (
  <CourseContextProvider initialState={initialState}>{children}</CourseContextProvider>
);

wrapper.propTypes = {
  children: PropTypes.node.isRequired,
  initialState: PropTypes.shape({}).isRequired,
};

describe('useEnrollData tests', () => {
  test('correct extraction of enroll fields', () => {
    const userEnrollment = undefined;
    const isEnrollable = false;
    const expected = {
      isEnrollable,
      isUserEnrolled: false, // since no userEnrollments are passed
      isCourseStarted: true, // since date in past
      userEnrollment,
    };

    const initialState = {
      ...BASE_COURSE_STATE,
      activeCourseRun: {
        ...BASE_COURSE_STATE.activeCourseRun,
        isEnrollable,
      },
    };

    const { result } = renderHook(() => useEnrollData(), {
      wrapper,
      initialProps: { initialState },
    });
    expect(result.current).toStrictEqual(expected);
  });
});
