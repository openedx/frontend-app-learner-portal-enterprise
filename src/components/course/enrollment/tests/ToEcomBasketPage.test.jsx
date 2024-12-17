import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ToEcomBasketPage from '../components/ToEcomBasketPage';
import { useTrackSearchConversionClickHandler, useUserSubsidyApplicableToCourse } from '../../data';
import { useCouponCodes, useCourseMetadata, useEnterpriseCourseEnrollments } from '../../../app/data';

jest.mock('../common', () => ({
  __esModule: true,
  EnrollButtonCta: () => <span>EnrollButtonCta</span>,
}));

jest.mock('../../EnrollModal', () => ({
  __esModule: true,
  default: () => <span>EnrollModal</span>,
}));

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useCouponCodes: jest.fn(),
  useCourseMetadata: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
}));

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  useOptimizelyEnrollmentClickHandler: jest.fn(),
  useTrackSearchConversionClickHandler: jest.fn(),
  useUserSubsidyApplicableToCourse: jest.fn(),
}));
const mockTrackSearchConversionClickHandler = jest.fn();

describe('<ToEcomBasketPage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTrackSearchConversionClickHandler.mockReturnValue(mockTrackSearchConversionClickHandler);
    useUserSubsidyApplicableToCourse.mockReturnValue({ userSubsidyApplicableToCourse: undefined });
    useCouponCodes.mockReturnValue({ data: { couponCodeAssignments: [] } });
    useCourseMetadata.mockReturnValue({ data: { activeCourseRun: { key: 'course-run-key' } } });
    useEnterpriseCourseEnrollments.mockReturnValue({ data: { enterpriseCourseEnrollments: [] } });
  });

  it('should render <EnrollButtonCta /> and <EnrollModal />', () => {
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
