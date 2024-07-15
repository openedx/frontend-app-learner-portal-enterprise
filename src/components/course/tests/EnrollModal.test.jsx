import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EnrollModal, { MODAL_TEXTS, messages } from '../EnrollModal';
import {
  COUPON_CODE_SUBSIDY_TYPE,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  LEARNER_CREDIT_SUBSIDY_TYPE,
  useEnterpriseCustomer,
} from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { ENTERPRISE_OFFER_TYPE } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useTrackSearchConversionClickHandler: jest.fn(),
  useOptimizelyEnrollmentClickHandler: jest.fn(),
}));

const EnrollModalWrapper = (props) => (
  <IntlProvider locale="en">
    <EnrollModal {...props} />
  </IntlProvider>
);

const baseProps = {
  isModalOpen: true,
  setIsModalOpen: jest.fn(),
  enrollmentUrl: 'https://example.com/enroll',
  courseRunPrice: 100,
  userSubsidyApplicableToCourse: undefined,
  couponCodesCount: 0,
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCustomerWithoutPrice = enterpriseCustomerFactory({
  hide_original_course_price: true,
});

describe('<EnrollModal />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({
      data: mockEnterpriseCustomer,
    });
  });

  it('does not render when user has no applicable subsidy', () => {
    const { container } = render(<EnrollModalWrapper {...baseProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('displays the correct texts when user has a coupon code for the course (%s)', async () => {
    const props = {
      ...baseProps,
      userSubsidyApplicableToCourse: {
        subsidyType: COUPON_CODE_SUBSIDY_TYPE,
      },
      couponCodesCount: 5,
    };
    render(<EnrollModalWrapper {...props} />);
    expect(screen.getByText(MODAL_TEXTS.HAS_COUPON_CODE.title.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(MODAL_TEXTS.HAS_COUPON_CODE.body.defaultMessage.replace('{couponCodesCount}', props.couponCodesCount))).toBeInTheDocument();
    expect(screen.getByText(MODAL_TEXTS.HAS_COUPON_CODE.button.defaultMessage)).toBeInTheDocument();

    // Close modal
    userEvent.click(screen.getByRole('button', { name: messages.modalCancelCta.defaultMessage }));
    expect(baseProps.setIsModalOpen).toHaveBeenCalledTimes(1);
    expect(baseProps.setIsModalOpen).toHaveBeenCalledWith(false);
  });

  it.each([
    {
      offerType: ENTERPRISE_OFFER_TYPE.ENROLLMENTS_LIMIT,
      hideOriginalCoursePrice: false,
      courseRunPrice: 100,
    },
    {
      offerType: ENTERPRISE_OFFER_TYPE.NO_LIMIT,
      hideOriginalCoursePrice: false,
      courseRunPrice: 100,
    },
    {
      offerType: ENTERPRISE_OFFER_TYPE.NO_LIMIT,
      hideOriginalCoursePrice: true,
      courseRunPrice: 100,
    },
  ])('displays the correct texts when there is an enterprise offer (%s)', async ({
    offerType,
    hideOriginalCoursePrice,
    courseRunPrice,
  }) => {
    useEnterpriseCustomer.mockReturnValue({
      data: hideOriginalCoursePrice ? mockEnterpriseCustomerWithoutPrice : mockEnterpriseCustomer,
    });
    const props = {
      ...baseProps,
      courseRunPrice,
      userSubsidyApplicableToCourse: {
        subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
        offerType,
      },
    };
    render(<EnrollModalWrapper {...props} />);
    expect(screen.getByText(MODAL_TEXTS.HAS_ENTERPRISE_OFFER.title.defaultMessage)).toBeInTheDocument();
    const expectedBodyMessage = MODAL_TEXTS.HAS_ENTERPRISE_OFFER.body({
      offerType,
      courseRunPrice: props.courseRunPrice,
      hideOriginalCoursePrice,
    }).defaultMessage.replace('{courseRunPrice}', `$${props.courseRunPrice}`);
    expect(await screen.findByText(expectedBodyMessage)).toBeInTheDocument();
    expect(screen.getByText(MODAL_TEXTS.HAS_ENTERPRISE_OFFER.button.defaultMessage)).toBeInTheDocument();

    // Close modal
    userEvent.click(screen.getByRole('button', { name: messages.modalCancelCta.defaultMessage }));
    expect(baseProps.setIsModalOpen).toHaveBeenCalledTimes(1);
    expect(baseProps.setIsModalOpen).toHaveBeenCalledWith(false);
  });

  it('displays the correct texts when there is learner credit available', async () => {
    const props = {
      ...baseProps,
      userSubsidyApplicableToCourse: {
        subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
      },
    };
    render(<EnrollModalWrapper {...props} />);
    expect(screen.getByText(MODAL_TEXTS.HAS_LEARNER_CREDIT.title.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.upgradeCoveredByOrg.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.upgradeBenefitsPrefix.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.upgradeBenefitsUnlimitedAccess.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.upgradeBenefitsShareableCertificate.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.upgradeBenefitsFeedbackAndGradedAssignments.defaultMessage)).toBeInTheDocument();

    // Assert confirm upgrade CTA is present
    expect(screen.getByRole('button', { name: messages.upgradeModalConfirmCta.defaultMessage }));

    // Close modal
    userEvent.click(screen.getByRole('button', { name: messages.modalCancelCta.defaultMessage }));
    expect(baseProps.setIsModalOpen).toHaveBeenCalledTimes(1);
    expect(baseProps.setIsModalOpen).toHaveBeenCalledWith(false);
  });

  it('calls onEnroll when enrollmentUrl is clicked', () => {
    const mockHandleEnroll = jest.fn();

    render(
      <EnrollModalWrapper
        {...baseProps}
        onEnroll={mockHandleEnroll}
        userSubsidyApplicableToCourse={{
          subsidyType: COUPON_CODE_SUBSIDY_TYPE,
        }}
        couponCodesCount={5}
      />,
    );
    const enrollButton = screen.getByText(MODAL_TEXTS.HAS_COUPON_CODE.button.defaultMessage);
    userEvent.click(enrollButton);

    expect(mockHandleEnroll).toHaveBeenCalled();
  });
});
