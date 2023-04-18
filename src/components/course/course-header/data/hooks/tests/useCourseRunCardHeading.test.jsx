import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';

import useCourseRunCardHeading from '../useCourseRunCardHeading';

const MOCK_COURSE_RUN_START = '2023-04-20T12:00:00Z';

const wrapper = ({ children }) => (
  <IntlProvider locale="en">{children}</IntlProvider>
);

describe('useCourseRunCardHeading', () => {
  it('handles non-current course run', () => {
    const { result } = renderHook(
      () => useCourseRunCardHeading({
        isCourseRunCurrent: false,
        isUserEnrolled: false,
        pacingType: 'self_paced',
        start: MOCK_COURSE_RUN_START,
      }),
      { wrapper },
    );
    expect(result.current).toEqual('Starts Apr 20');
  });

  it('handles current, self-paced, unenrolled course run', () => {
    // mock current date
    Date.now = jest.fn(() => new Date('2023-03-20T12:00:00Z'));

    const { result } = renderHook(
      () => useCourseRunCardHeading({
        isCourseRunCurrent: true,
        isUserEnrolled: false,
        pacingType: 'self_paced',
        start: MOCK_COURSE_RUN_START,
      }),
      { wrapper },
    );
    // assert shown start date matches the above mocked current date
    expect(result.current).toEqual('Starts Mar 20');
  });

  it('handles current, self-paced, enrolled course run', () => {
    const { result } = renderHook(
      () => useCourseRunCardHeading({
        isCourseRunCurrent: true,
        isUserEnrolled: true,
        pacingType: 'self_paced',
        start: MOCK_COURSE_RUN_START,
      }),
      { wrapper },
    );
    // assert shown start date matches the above mocked current date
    expect(result.current).toEqual('Course started');
  });

  it('handles current, instructor-led, enrolled course run', () => {
    const { result } = renderHook(
      () => useCourseRunCardHeading({
        isCourseRunCurrent: true,
        isUserEnrolled: true,
        pacingType: 'instructor_led',
        start: MOCK_COURSE_RUN_START,
      }),
      { wrapper },
    );
    // assert shown start date matches the above mocked current date
    expect(result.current).toEqual('Course started');
  });
});
