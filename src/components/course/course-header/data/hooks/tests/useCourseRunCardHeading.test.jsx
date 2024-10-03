import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderHook } from '@testing-library/react-hooks';
import MockDate from 'mockdate';
import dayjs from 'dayjs';
import '@testing-library/jest-dom/extend-expect';

import { hasTimeToComplete } from '../../../../data/utils';

import { MOCK_COURSE_RUN_START } from './constants';
import useCourseRunCardHeading from '../useCourseRunCardHeading';
import { COURSE_PACING_MAP } from '../../../../data/constants';
import { DATE_FORMAT } from '../../constants';

jest.mock('../../../../data/utils', () => ({
  ...jest.requireActual('../../../../data/utils'),
  hasTimeToComplete: jest.fn().mockReturnValue(true),
}));

const wrapper = ({ children }) => (
  <IntlProvider locale="en">{children}</IntlProvider>
);

describe('useCourseRunCardHeading', () => {
  afterEach(() => {
    MockDate.reset();
  });

  it('handles non-current course run', () => {
    const { result } = renderHook(
      () => useCourseRunCardHeading({
        isCourseRunCurrent: false,
        isUserEnrolled: false,
        courseRun: {
          pacingType: 'self_paced',
          start: MOCK_COURSE_RUN_START,
        },
      }),
      { wrapper },
    );
    expect(result.current).toEqual('Starts Apr 20');
  });

  it.each([
    // test case: really old start date with time to complete
    {
      hasTimeToCompleteOverride: true,
      startDate: dayjs(MOCK_COURSE_RUN_START).toISOString(),
      expectedFormattedStartDate: `Starts ${dayjs().format(DATE_FORMAT)}`,
    },
    // test case: really old start date without time to complete
    {
      hasTimeToCompleteOverride: false,
      startDate: dayjs(MOCK_COURSE_RUN_START).toISOString(),
      expectedFormattedStartDate: `Starts ${dayjs().format(DATE_FORMAT)}`,
    },
    // test case: recent start date with time to complete
    {
      hasTimeToCompleteOverride: true,
      startDate: dayjs().subtract(5, 'day').toISOString(),
      expectedFormattedStartDate: `Starts ${dayjs().format(DATE_FORMAT)}`,
    },
    // test case: recent start date without time to complete
    {
      hasTimeToCompleteOverride: false,
      startDate: dayjs().subtract(5, 'day').toISOString(),
      expectedFormattedStartDate: `Started ${dayjs().subtract(5, 'day').format(DATE_FORMAT)}`,
    },
  ])('handles current, self-paced, unenrolled course run (%s)', ({
    hasTimeToCompleteOverride,
    startDate,
    expectedFormattedStartDate,
  }) => {
    hasTimeToComplete.mockReturnValue(hasTimeToCompleteOverride);

    // mock current date
    MockDate.set(dayjs().toDate());

    const { result } = renderHook(
      () => useCourseRunCardHeading({
        isCourseRunCurrent: true,
        isUserEnrolled: false,
        courseRun: {
          pacingType: COURSE_PACING_MAP.SELF_PACED,
          start: startDate,
        },
      }),
      { wrapper },
    );

    if (hasTimeToCompleteOverride) {
      // assert shown start date matches the above mocked current date
      expect(result.current).toEqual(expectedFormattedStartDate);
    } else {
      // assert shown start date matches the start date of the course run
      expect(result.current).toEqual(expectedFormattedStartDate);
    }
  });

  it('handles current, self-paced, enrolled course run', () => {
    const { result } = renderHook(
      () => useCourseRunCardHeading({
        isCourseRunCurrent: true,
        isUserEnrolled: true,
        courseRun: {
          pacingType: 'self_paced',
          start: MOCK_COURSE_RUN_START,
        },
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
        courseRun: {
          pacingType: 'instructor_led',
          start: MOCK_COURSE_RUN_START,
        },
      }),
      { wrapper },
    );
    // assert shown start date matches the above mocked current date
    expect(result.current).toEqual('Course started');
  });

  it('handles current, instructor-led, unenrolled course run', () => {
    const { result } = renderHook(
      () => useCourseRunCardHeading({
        isCourseRunCurrent: true,
        isUserEnrolled: false,
        courseRun: {
          pacingType: 'instructor_led',
          start: MOCK_COURSE_RUN_START,
        },
      }),
      { wrapper },
    );
    // assert shown start date matches the above mocked current date
    expect(result.current).toEqual('Started Apr 20');
  });
});
