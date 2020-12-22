/* eslint-disable react/prop-types */
import React from 'react';
import { renderHook } from '@testing-library/react-hooks';

import { CourseContextProvider } from '../../CourseContextProvider';
import { useCourseEnrollmentUrl, useEnrollData } from '../hooks';
import { LICENSE_SUBSIDY_TYPE } from '../constants';

jest.mock('../../../../config', () => ({
  features: { ENROLL_WITH_CODES: true },
}));

const DEFAULT_COURSE_STATE = {
  course: {},
  catalog: {},
  userEntitlements: [],
  userSubsidy: {},
  activeCourseRun: {
    isEnrollable: true,
    start: '2000-09-09T04:00:00Z',
  },
  userEnrollments: [],
};

describe('main enroll button logic hooks', () => {
  test('isUserEnrolled, isEnrollable and isCourseStarted values are fetched correctly', () => {
    const courseContextWrapper = ({ children }) => (
      <CourseContextProvider initialState={DEFAULT_COURSE_STATE}>
        {children}
      </CourseContextProvider>
    );
    const { result } = renderHook(
      () => useEnrollData(),
      { wrapper: courseContextWrapper },
    );
    const { isEnrollable, isUserEnrolled, isCourseStarted } = result.current;
    expect(isEnrollable).toBe(true);
    expect(isUserEnrolled).toBe(false); // since no enrollments provided above
    expect(isCourseStarted).toBe(true); // since our course start date is always in the past!
  });
});

describe('useCourseEnrollmentUrl', () => {
  const noSubscriptionEnrollmentInputs = {
    enterpriseConfig: {
      uuid: 'foo',
    },
    key: 'bar',
    offers: [{ code: 'bearsRus', catalog: 'bears' }],
    sku: 'xkcd',
    catalogList: ['bears'],
    location: { search: 'foo' },
  };
  const enrollmentInputs = {
    ...noSubscriptionEnrollmentInputs,
    subscriptionLicense: {
      uuid: 'yes',
    },
    userSubsidy: {
      subsidyType: LICENSE_SUBSIDY_TYPE,
    },
  };

  describe('subscription license', () => {
    test('returns an lms url to DSC for enrollment with a license', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl(enrollmentInputs));
      expect(result.current).toContain(process.env.LMS_BASE_URL);
      expect(result.current).toContain(enrollmentInputs.enterpriseConfig.uuid);
      expect(result.current).toContain(enrollmentInputs.key);
      expect(result.current).toContain(enrollmentInputs.subscriptionLicense.uuid);
    });

    test('does not use the license uuid for enrollment if there is no valid license subsidy (even with a license uuid)', () => {
      const noSubsidyEnrollmentInputs = { ...enrollmentInputs };
      delete noSubsidyEnrollmentInputs.userSubsidy;

      const { result } = renderHook(() => useCourseEnrollmentUrl(noSubsidyEnrollmentInputs));
      expect(result.current).not.toContain(enrollmentInputs.subscriptionLicense.uuid);
    });
  });

  describe('offers (codes)', () => {
    test('with offer for course returns ecommerce url to redeem product with code', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl(noSubscriptionEnrollmentInputs));
      expect(result.current).toContain(process.env.ECOMMERCE_BASE_URL);
      expect(result.current).toContain(noSubscriptionEnrollmentInputs.sku);
      expect(result.current).toContain(noSubscriptionEnrollmentInputs.offers[0].code);
      expect(result.current).toContain(enrollmentInputs.key);
    });

    test('with no offers for catalog returns ecommerce url to add product to basket', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl({
        ...noSubscriptionEnrollmentInputs,
        catalogList: ['foo'],
      }));
      expect(result.current).toContain(process.env.ECOMMERCE_BASE_URL);
      expect(result.current).toContain(noSubscriptionEnrollmentInputs.sku);
      expect(result.current).toContain(enrollmentInputs.key);
      expect(result.current).not.toContain('code');
    });

    test('with no assigned offers returns ecommerce url to add product to basket', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl({
        ...noSubscriptionEnrollmentInputs,
        offers: [],
      }));
      expect(result.current).toContain(process.env.ECOMMERCE_BASE_URL);
      expect(result.current).toContain(noSubscriptionEnrollmentInputs.sku);
      expect(result.current).toContain(enrollmentInputs.key);
      expect(result.current).not.toContain('code');
    });

    test('with missing product sku returns null', () => {
      const { result } = renderHook(() => useCourseEnrollmentUrl({
        ...noSubscriptionEnrollmentInputs,
        sku: undefined,
      }));
      expect(result.current).toBeNull();
    });
  });
});
