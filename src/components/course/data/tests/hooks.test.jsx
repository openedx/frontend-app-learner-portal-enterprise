import { renderHook } from '@testing-library/react-hooks';

import { useCourseEnrollmentUrl } from '../hooks';
import { LICENSE_SUBSIDY_TYPE } from '../constants';

jest.mock('../../../../config', () => ({
  features: { ENROLL_WITH_CODES: true },
}));

describe('useCourseEnrollmentUrl', () => {
  const noSubscriptionEnrollmentInputs = {
    enterpriseConfig: {
      uuid: 'foo',
    },
    key: 'bar',
    offers: [{ code: 'bearsRus', catalog: 'bears' }],
    catalogList: ['bears'],
    location: { search: 'foo' },
  };
  const enrollmentInputs = {
    ...noSubscriptionEnrollmentInputs,
    subscriptionLicense: {
      uuid: 'yes',
    },
    userSubsidyApplicableToCourse: {
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
      delete noSubsidyEnrollmentInputs.userSubsidyApplicableToCourse;

      const { result } = renderHook(() => useCourseEnrollmentUrl(noSubsidyEnrollmentInputs));
      expect(result.current).toBeNull();
    });
  });
});
