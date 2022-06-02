/* eslint-disable react/prop-types */
import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import * as hooks from '../hooks';
import ToEcomBasketPage from '../components/ToEcomBasketPage';

jest.mock('../common', () => ({
  __esModule: true,
  EnrollButtonCta: () => <span>EnrollButtonCta</span>,
}));

jest.mock('../../EnrollModal', () => ({
  __esModule: true,
  default: () => <span>EnrollModal</span>,
}));

jest.mock('../hooks');

describe('<ToEcomBasketPage />', () => {
  it('should render <EnrollButtonCta /> and <EnrollModal />', () => {
    hooks.useSubsidyDataForCourse.mockReturnValue(
      { userSubsidyApplicableToCourse: undefined, couponCodesCount: 0 },
    );

    render(
      <ToEcomBasketPage
        enrollLabel="enroll"
        enrollmentUrl="enroll_url"
        courseRunPrice={100}
      />,
    );

    expect(screen.getByText('EnrollButtonCta')).toBeInTheDocument();
    expect(screen.getByText('EnrollModal')).toBeInTheDocument();
  });
});
