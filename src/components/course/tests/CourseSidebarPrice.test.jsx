import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import CourseSidebarPrice from '../CourseSidebarPrice';
import {
  LICENSE_SUBSIDY_TYPE,
  COUPON_CODE_SUBSIDY_TYPE,
  SUBSIDY_DISCOUNT_TYPE_MAP,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  LEARNER_CREDIT_SUBSIDY_TYPE,
} from '../data/constants';
import { useEnterpriseCustomer } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import {
  useCanUserRequestSubsidyForCourse,
  useCoursePrice,
  useIsCourseAssigned,
  useUserSubsidyApplicableToCourse,
} from '../data';

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCustomerWithHiddenCoursePrice = enterpriseCustomerFactory({
  hide_course_original_price: true,
});

// making discountType uppercase to help validate case-safe check in hooks logic
const FULL_COUPON_CODE_SUBSIDY = {
  discountType: SUBSIDY_DISCOUNT_TYPE_MAP.PERCENTAGE.toUpperCase(),
  discountValue: 100,
  subsidyType: COUPON_CODE_SUBSIDY_TYPE,
};

const PARTIAL_COUPON_CODE_SUBSIDY = {
  ...FULL_COUPON_CODE_SUBSIDY,
  discountValue: 90,
};

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('../data', () => ({
  ...jest.requireActual('../data'),
  useCoursePrice: jest.fn(),
  useIsCourseAssigned: jest.fn(),
  useCanUserRequestSubsidyForCourse: jest.fn(),
  useUserSubsidyApplicableToCourse: jest.fn(),
}));

const CourseSidebarPriceWrapper = () => (
  <IntlProvider locale="en">
    <CourseSidebarPrice />
  </IntlProvider>
);

const getExpectedSponsoredByText = (enterpriseCustomer = mockEnterpriseCustomer) => `Sponsored by ${enterpriseCustomer.name}`;

describe('<CourseSidebarPrice/> ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useUserSubsidyApplicableToCourse.mockReturnValue({ userSubsidyApplicableToCourse: null });
    useCoursePrice.mockReturnValue({ coursePrice: { list: 7.5, discounted: 7.5 }, currency: 'USD' });
    useIsCourseAssigned.mockReturnValue(false);
    useCanUserRequestSubsidyForCourse.mockReturnValue(false);
  });

  describe('Browse and Request', () => {
    test('Display correct message when user can request subsidy', () => {
      useCanUserRequestSubsidyForCourse.mockReturnValue(true);
      render(<CourseSidebarPriceWrapper />);
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.getByText(/Free to me.*\(when approved\)/)).toBeInTheDocument();
      expect(screen.getByTestId('browse-and-request-pricing')).toBeInTheDocument();
      expect(screen.queryByText('Included in your subscription')).not.toBeInTheDocument();
      expect(screen.queryByText(getExpectedSponsoredByText())).not.toBeInTheDocument();
      expect(screen.queryByText('This course is assigned to you. The price of this course is already covered by your organization.')).not.toBeInTheDocument();
    });
  });

  describe('Enterprise offers', () => {
    test('Display correct message when enterprise offer exists', () => {
      const mockEnterpriseOffer = {
        discountValue: 100,
        discountType: SUBSIDY_DISCOUNT_TYPE_MAP.PERCENTAGE.toUpperCase(),
        enterpriseCatalogUuid: 'bears',
        remainingBalance: 100,
      };
      const mockEnterpriseOfferSubsidy = {
        ...mockEnterpriseOffer,
        subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
      };
      useUserSubsidyApplicableToCourse.mockReturnValue({ userSubsidyApplicableToCourse: mockEnterpriseOfferSubsidy });
      useCoursePrice.mockReturnValue({ coursePrice: { list: 7.5, discounted: 0 }, currency: 'USD' });
      render(<CourseSidebarPriceWrapper />);
      expect(screen.getByText('Priced reduced from:')).toBeInTheDocument();
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.queryByText("This course can be purchased with your organization's learner credit")).toBeInTheDocument();
      expect(screen.queryByText('This course is assigned to you. The price of this course is already covered by your organization.')).not.toBeInTheDocument();
      expect(screen.queryByText('Included in your subscription')).not.toBeInTheDocument();
      expect(screen.queryByText(getExpectedSponsoredByText())).not.toBeInTheDocument();
    });
  });

  describe('Sidebar price display with hideCourseOriginalPrice ON, No subsidies', () => {
    test('no subsidies, shows original price, no messages', () => {
      render(<CourseSidebarPriceWrapper />);
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.queryByText('Included in your subscription')).not.toBeInTheDocument();
      expect(screen.queryByText(getExpectedSponsoredByText())).not.toBeInTheDocument();
      expect(screen.queryByText("This course can be purchased with your organization's learner credit")).not.toBeInTheDocument();
      expect(screen.queryByText('This course is assigned to you. The price of this course is already covered by your organization.')).not.toBeInTheDocument();
    });
  });

  describe('Sidebar price display with hideCourseOriginalPrice ON', () => {
    const expectedSponsoredByText = getExpectedSponsoredByText(mockEnterpriseCustomerWithHiddenCoursePrice);

    beforeEach(() => {
      jest.clearAllMocks();
      useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithHiddenCoursePrice });
    });

    test('subscription license subsidy, shows no price, correct message', () => {
      useCoursePrice.mockReturnValue({ coursePrice: { list: 7.5, discounted: 0 }, currency: 'USD' });
      useUserSubsidyApplicableToCourse.mockReturnValue({
        userSubsidyApplicableToCourse: { subsidyType: LICENSE_SUBSIDY_TYPE },
      });
      render(<CourseSidebarPriceWrapper />);
      expect(screen.queryByText(/\$7.50 USD/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\$0.00 USD/)).not.toBeInTheDocument();
      expect(screen.queryByText('Included in your subscription')).toBeInTheDocument();
      expect(screen.queryByText(expectedSponsoredByText)).not.toBeInTheDocument();
      expect(screen.queryByText("This course can be purchased with your organization's learner credit")).not.toBeInTheDocument();
      expect(screen.queryByText('This course is assigned to you. The price of this course is already covered by your organization.')).not.toBeInTheDocument();
    });

    test('coupon code 100% subsidy, shows no price, correct message', () => {
      useCoursePrice.mockReturnValue({ coursePrice: { list: 7.5, discounted: 0 }, currency: 'USD' });
      useUserSubsidyApplicableToCourse.mockReturnValue({
        userSubsidyApplicableToCourse: FULL_COUPON_CODE_SUBSIDY,
      });
      render(<CourseSidebarPriceWrapper />);
      expect(screen.queryByText(/\$7.50 USD/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\$0.00 USD/)).not.toBeInTheDocument();
      expect(screen.queryByText(expectedSponsoredByText)).toBeInTheDocument();
      expect(screen.queryByText('Included in your subscription')).not.toBeInTheDocument();
      expect(screen.queryByText("This course can be purchased with your organization's learner credit")).not.toBeInTheDocument();
      expect(screen.queryByText('This course is assigned to you. The price of this course is already covered by your organization.')).not.toBeInTheDocument();
    });

    test('coupon code non-full subsidy, shows discounted price only, correct message', () => {
      useCoursePrice.mockReturnValue({ coursePrice: { list: 7.5, discounted: 3.75 }, currency: 'USD' });
      useUserSubsidyApplicableToCourse.mockReturnValue({
        userSubsidyApplicableToCourse: PARTIAL_COUPON_CODE_SUBSIDY,
      });
      render(<CourseSidebarPriceWrapper />);
      expect(screen.getByText(/\$3.75 USD/)).toBeInTheDocument();
      expect(screen.queryByText(expectedSponsoredByText)).toBeInTheDocument();
      expect(screen.queryByText('Included in your subscription')).not.toBeInTheDocument();
      expect(screen.queryByText("This course can be purchased with your organization's learner credit")).not.toBeInTheDocument();
      expect(screen.queryByText('This course is assigned to you. The price of this course is already covered by your organization.')).not.toBeInTheDocument();
    });

    test('assigned course, shows no price, correct message', () => {
      useIsCourseAssigned.mockReturnValue(true);
      useCoursePrice.mockReturnValue({ coursePrice: { list: 7.5, discounted: 0 }, currency: 'USD' });
      useUserSubsidyApplicableToCourse.mockReturnValue({
        userSubsidyApplicableToCourse: { subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE },
      });
      render(<CourseSidebarPriceWrapper />);
      expect(screen.queryByText(/\$7.50 USD/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\$0.00 USD/)).not.toBeInTheDocument();
      expect(screen.queryByText('This course is assigned to you. The price of this course is already covered by your organization.')).toBeInTheDocument();
      expect(screen.queryByText('Included in your subscription')).not.toBeInTheDocument();
      expect(screen.queryByText(expectedSponsoredByText)).not.toBeInTheDocument();
      expect(screen.queryByText("This course can be purchased with your organization's learner credit")).not.toBeInTheDocument();
    });
  });

  describe('Sidebar price display with hideCourseOriginalPrice OFF', () => {
    test('no subsidies, shows original price, no messages', () => {
      render(<CourseSidebarPriceWrapper />);
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.queryByText('Included in your subscription')).not.toBeInTheDocument();
      expect(screen.queryByText(getExpectedSponsoredByText())).not.toBeInTheDocument();
      expect(screen.queryByText("This course can be purchased with your organization's learner credit")).not.toBeInTheDocument();
      expect(screen.queryByText('This course is assigned to you. The price of this course is already covered by your organization.')).not.toBeInTheDocument();
    });
    test('subscription license subsidy, shows orig crossed out price, correct message', () => {
      useCoursePrice.mockReturnValue({ coursePrice: { list: 7.5, discounted: 0 }, currency: 'USD' });
      useUserSubsidyApplicableToCourse.mockReturnValue({
        userSubsidyApplicableToCourse: { subsidyType: LICENSE_SUBSIDY_TYPE },
      });
      render(<CourseSidebarPriceWrapper />);
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.queryByText('Included in your subscription')).toBeInTheDocument();
      expect(screen.queryByText(getExpectedSponsoredByText())).not.toBeInTheDocument();
      expect(screen.queryByText("This course can be purchased with your organization's learner credit")).not.toBeInTheDocument();
      expect(screen.queryByText('This course is assigned to you. The price of this course is already covered by your organization.')).not.toBeInTheDocument();
    });
    test('coupon code 100% subsidy, shows orig price, correct message', () => {
      useCoursePrice.mockReturnValue({ coursePrice: { list: 7.5, discounted: 0 }, currency: 'USD' });
      useUserSubsidyApplicableToCourse.mockReturnValue({
        userSubsidyApplicableToCourse: FULL_COUPON_CODE_SUBSIDY,
      });
      render(<CourseSidebarPriceWrapper />);
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.queryByText('Included in your subscription')).not.toBeInTheDocument();
      expect(screen.getByText(getExpectedSponsoredByText())).toBeInTheDocument();
      expect(screen.queryByText("This course can be purchased with your organization's learner credit")).not.toBeInTheDocument();
      expect(screen.queryByText('This course is assigned to you. The price of this course is already covered by your organization.')).not.toBeInTheDocument();
    });
    test('coupon code non-full subsidy, shows orig and discounted price only, correct message', () => {
      useCoursePrice.mockReturnValue({ coursePrice: { list: 7.5, discounted: 3.75 }, currency: 'USD' });
      useUserSubsidyApplicableToCourse.mockReturnValue({
        userSubsidyApplicableToCourse: PARTIAL_COUPON_CODE_SUBSIDY,
      });
      render(<CourseSidebarPriceWrapper />);
      expect(screen.getByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.getByText(/\$3.75 USD/)).toBeInTheDocument();
      expect(screen.queryByText('Included in your subscription')).not.toBeInTheDocument();
      expect(screen.getByText(getExpectedSponsoredByText())).toBeInTheDocument();
      expect(screen.queryByText("This course can be purchased with your organization's learner credit")).not.toBeInTheDocument();
      expect(screen.queryByText('This course is assigned to you. The price of this course is already covered by your organization.')).not.toBeInTheDocument();
    });
    test('assigned course, shows orig price, correct message', () => {
      useIsCourseAssigned.mockReturnValue(true);
      useCoursePrice.mockReturnValue({ coursePrice: { list: 7.5, discounted: 0 }, currency: 'USD' });
      useUserSubsidyApplicableToCourse.mockReturnValue({
        userSubsidyApplicableToCourse: { subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE },
      });
      render(<CourseSidebarPriceWrapper />);
      expect(screen.queryByText(/\$7.50 USD/)).toBeInTheDocument();
      expect(screen.queryByText('This course is assigned to you. The price of this course is already covered by your organization.')).toBeInTheDocument();
      expect(screen.queryByText('Included in your subscription')).not.toBeInTheDocument();
      expect(screen.queryByText(getExpectedSponsoredByText())).not.toBeInTheDocument();
      expect(screen.queryByText("This course can be purchased with your organization's learner credit")).not.toBeInTheDocument();
    });
  });

  test('renders skeleton loading state if no course price is specified', () => {
    useCoursePrice.mockReturnValue({ coursePrice: undefined, currency: 'USD' });
    render(<CourseSidebarPriceWrapper />);
    expect(screen.getByTestId('course-price-skeleton')).toBeInTheDocument();
  });
});
