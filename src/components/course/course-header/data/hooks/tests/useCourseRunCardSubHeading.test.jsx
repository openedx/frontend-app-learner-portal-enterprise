import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import useCourseRunCardSubHeading from '../useCourseRunCardSubHeading';

const wrapper = ({ children }) => (
  <IntlProvider locale="en">{children}</IntlProvider>
);

describe('useCourseRunCardHeading', () => {
  it('handles existing course enrollment', () => {
    const { result } = renderHook(
      () => useCourseRunCardSubHeading({
        enrollmentCount: 0,
        isUserEnrolled: true,
      }),
      { wrapper },
    );
    expect(result.current).toEqual('You are enrolled');
  });

  it('handles non-existing course enrollment with 0 recent enrollments', () => {
    const { result } = renderHook(
      () => useCourseRunCardSubHeading({
        enrollmentCount: 0,
        isUserEnrolled: false,
      }),
      { wrapper },
    );
    expect(result.current).toEqual('Be the first to enroll!');
  });

  it('handles non-existing course enrollment with 100 recent enrollments', () => {
    const { result } = renderHook(
      () => useCourseRunCardSubHeading({
        enrollmentCount: 100,
        isUserEnrolled: false,
      }),
      { wrapper },
    );
    expect(result.current).toEqual('100 recently enrolled!');
  });
});
