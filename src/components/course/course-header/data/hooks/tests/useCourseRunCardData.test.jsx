import { renderHook } from '@testing-library/react-hooks';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { AppContext } from '@edx/frontend-platform/react';
import useCourseRunCardData from '../useCourseRunCardData';

import {
  MOCK_COURSE_RUN,
  MOCK_COURSE_RUN_URL,
  MOCK_LEARNER_CREDIT_SUBSIDY,
} from './constants';
import { CourseContext } from '../../../../CourseContextProvider';

const mockAppContext = { enterpriseConfig: { slug: 'enterpriseSlug' } };

const mockCourseContext = {
  state: {
    course: {
      entitlements: [{
        mode: 'paid-executive-education',
        price: '820.00',
        currency: 'USD',
        sku: '821D85D',
        expires: null,
      }],
    },
  },
};

const wrapper = ({ children }) => (
  <AppContext.Provider value={mockAppContext}>
    <CourseContext.Provider value={mockCourseContext}>{children}</CourseContext.Provider>
  </AppContext.Provider>
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({ pathname: '/enterpriseSlug/course/edX+DemoX' }),
}));

jest.mock('../useCourseRunCardHeading', () => jest.fn(() => 'Course started'));
jest.mock('../useCourseRunCardSubHeading', () => jest.fn(() => 'You are enrolled'));
jest.mock('../useCourseRunCardAction', () => jest.fn(() => <button type="button" data-testid="mock-cta">View course</button>));

describe('useCourseRunCardData', () => {
  it('should return expected course run card data', () => {
    const { result } = renderHook(
      () => useCourseRunCardData({
        courseRun: MOCK_COURSE_RUN,
        isUserEnrolled: true,
        userSubsidyApplicableToCourse: MOCK_LEARNER_CREDIT_SUBSIDY,
        courseRunUrl: MOCK_COURSE_RUN_URL,
      }),
      { wrapper },
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
