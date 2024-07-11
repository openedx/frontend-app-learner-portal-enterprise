import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EnrollModal, { MODAL_TEXTS } from '../EnrollModal';
import { COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE } from '../../app/data';
import { ENTERPRISE_OFFER_TYPE } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';

jest.mock('../data/hooks', () => ({
  useTrackSearchConversionClickHandler: jest.fn(),
  useOptimizelyEnrollmentClickHandler: jest.fn(),
}));

const EnrollModalWrapper = (props) => (
  <IntlProvider locale="en">
    <EnrollModal {...props} />
  </IntlProvider>
);

describe('<EnrollModal />', () => {
  const basicProps = {
    isModalOpen: true,
    setIsModalOpen: jest.fn(),
    enrollmentUrl: 'https://example.com/enroll',
    courseRunPrice: 100,
    userSubsidyApplicableToCourse: undefined,
    couponCodesCount: 0,
  };

  it('does not render when user has no applicable subsidy', () => {
    const { container } = render(<EnrollModalWrapper {...basicProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('displays the correct texts when user has a coupon code for the course', () => {
    const props = {
      ...basicProps,
      userSubsidyApplicableToCourse: {
        subsidyType: COUPON_CODE_SUBSIDY_TYPE,
      },
      couponCodesCount: 5,
    };
    render(<EnrollModalWrapper {...props} />);
    expect(screen.getByText(MODAL_TEXTS.HAS_COUPON_CODE.title.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(MODAL_TEXTS.HAS_COUPON_CODE.body.defaultMessage.replace('{couponCodesCount}', props.couponCodesCount))).toBeInTheDocument();
    expect(screen.getByText(MODAL_TEXTS.HAS_COUPON_CODE.button.defaultMessage)).toBeInTheDocument();
  });

  it('displays the correct texts when there is an enterprise offer', () => {
    const props = {
      ...basicProps,
      userSubsidyApplicableToCourse: {
        subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
        offerType: ENTERPRISE_OFFER_TYPE.ENROLLMENTS_LIMIT,
      },
    };
    render(<EnrollModalWrapper {...props} />);
    expect(screen.getByText(MODAL_TEXTS.HAS_ENTERPRISE_OFFER.title.defaultMessage)).toBeInTheDocument();
    expect(
      screen.getByText(MODAL_TEXTS.HAS_ENTERPRISE_OFFER.body(ENTERPRISE_OFFER_TYPE.ENROLLMENTS_LIMIT).defaultMessage),
    ).toBeInTheDocument();
    expect(screen.getByText(MODAL_TEXTS.HAS_ENTERPRISE_OFFER.button.defaultMessage)).toBeInTheDocument();
  });

  it('calls onEnroll when enrollmentUrl is clicked', () => {
    const mockHandleEnroll = jest.fn();

    render(
      <EnrollModalWrapper
        {...basicProps}
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
