import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import * as hooks from '../hooks';
import ToEcomBasketPage from '../components/ToEcomBasketPage';
import { CourseContext } from '../../CourseContextProvider';

jest.mock('../common', () => ({
  __esModule: true,
  EnrollButtonCta: () => <span>EnrollButtonCta</span>,
}));

jest.mock('../../EnrollModal', () => ({
  __esModule: true,
  default: () => <span>EnrollModal</span>,
}));

jest.mock('../hooks');

const ToEcomBasketPageWrapper = ({
  courseContextValue = {
    state: {
      activeCourseRun: {
        key: 'course-key',
      },
      userEnrollments: [],
    },
  },
  ...rest
}) => (
  <CourseContext.Provider value={courseContextValue}>
    <ToEcomBasketPage
      {...rest}
    />,
  </CourseContext.Provider>
);

describe('<ToEcomBasketPage />', () => {
  it('should render <EnrollButtonCta /> and <EnrollModal />', () => {
    hooks.useSubsidyDataForCourse.mockReturnValue(
      { userSubsidyApplicableToCourse: undefined, couponCodesCount: 0 },
    );

    render(
      <ToEcomBasketPageWrapper
        enrollLabel="enroll"
        enrollmentUrl="enroll_url"
        courseRunPrice={100}
      />,
    );

    expect(screen.getByText('EnrollButtonCta')).toBeInTheDocument();
    expect(screen.getByText('EnrollModal')).toBeInTheDocument();
  });
});
