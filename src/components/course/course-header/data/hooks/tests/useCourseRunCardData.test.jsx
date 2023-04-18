import { renderHook } from '@testing-library/react-hooks';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import useCourseRunCardData from '../useCourseRunCardData';

import {
  COURSE_RUN,
  COURSE_RUN_URL,
  LEARNER_CREDIT_SUBSIDY,
} from './constants';

jest.mock('../useCourseRunCardHeading', () => jest.fn(() => 'Course started'));
jest.mock('../useCourseRunCardSubHeading', () => jest.fn(() => 'You are enrolled'));
jest.mock('../useCourseRunCardAction', () => jest.fn(() => <button type="button" data-testid="mock-cta">View course</button>));

describe('useCourseRunCardData', () => {
  it('should return expected course run card data', () => {
    const { result } = renderHook(
      () => useCourseRunCardData({
        courseRun: COURSE_RUN,
        isUserEnrolled: true,
        userSubsidyApplicableToCourse: LEARNER_CREDIT_SUBSIDY,
        courseRunUrl: COURSE_RUN_URL,
      }),
    );
    expect(result.current).toEqual(
      expect.objectContaining({
        heading: 'Course started',
        subHeading: 'You are enrolled',
        action: expect.anything(),
      }),
    );
    const { getByTestId } = render(result.current.action);
    expect(getByTestId('mock-cta')).toBeInTheDocument();
  });
});
