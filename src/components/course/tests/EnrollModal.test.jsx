import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render, fireEvent } from '@testing-library/react';

import EnrollModal, { MODAL_TEXTS } from '../EnrollModal';
import { COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE } from '../data/constants';
import * as hooks from '../data/hooks';

jest.mock('../data/hooks', () => ({
  useTrackSearchConversionClickHandler: jest.fn(),
  useOptimizelyEnrollmentClickHandler: jest.fn(),
}));

describe('<EnrollModal />', () => {
  const basicProps = {
    isModalOpen: true,
    setIsModalOpen: jest.fn(),
    enrollmentUrl: 'https://example.com/enroll',
    courseRunPrice: 100,
    userSubsidyApplicableToCourse: undefined,
    couponCodesCount: 0,
  };
  it('displays the correct texts when user has no applicable subsidy', () => {
    render(
      <EnrollModal {...basicProps} />,
    );
    expect(screen.getByText(MODAL_TEXTS.HAS_NO_SUBSIDY.title)).toBeInTheDocument();
    expect(screen.getByText(MODAL_TEXTS.HAS_NO_SUBSIDY.body)).toBeInTheDocument();
    expect(screen.getByText(MODAL_TEXTS.HAS_NO_SUBSIDY.button)).toBeInTheDocument();
  });
  it('displays the correct texts when user has a coupon code for the course', () => {
    const props = {
      ...basicProps,
      userSubsidyApplicableToCourse: {
        subsidyType: COUPON_CODE_SUBSIDY_TYPE,
      },
      couponCodesCount: 5,
    };
    render(
      <EnrollModal {...props} />,
    );
    expect(screen.getByText(MODAL_TEXTS.HAS_COUPON_CODE.title)).toBeInTheDocument();
    expect(screen.getByText(MODAL_TEXTS.HAS_COUPON_CODE.body(props.couponCodesCount))).toBeInTheDocument();
    expect(screen.getByText(MODAL_TEXTS.HAS_COUPON_CODE.button)).toBeInTheDocument();
  });
  it('displays the correct texts when there is an enterprise offer', () => {
    const props = {
      ...basicProps,
      userSubsidyApplicableToCourse: {
        subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
      },
    };
    render(
      <EnrollModal {...props} />,
    );
    expect(screen.getByText(MODAL_TEXTS.HAS_ENTERPRISE_OFFER.title)).toBeInTheDocument();
    expect(screen.getByText(MODAL_TEXTS.HAS_ENTERPRISE_OFFER.body(props.courseRunPrice))).toBeInTheDocument();
    expect(screen.getByText(MODAL_TEXTS.HAS_ENTERPRISE_OFFER.button)).toBeInTheDocument();
  });
  it('calls analyticsHandler and optimizelyHandler when enrollmentUrl is clicked', () => {
    const mockTrackSearchConversionClickHandler = jest.fn();
    const mockOptimizelyEnrollmentClickHandler = jest.fn();
    hooks.useTrackSearchConversionClickHandler.mockImplementation(() => mockTrackSearchConversionClickHandler);
    hooks.useOptimizelyEnrollmentClickHandler.mockImplementation(() => mockOptimizelyEnrollmentClickHandler);

    render(
      <EnrollModal {...basicProps} />,
    );
    const enrollButton = screen.getByText(MODAL_TEXTS.HAS_NO_SUBSIDY.button);
    fireEvent.click(enrollButton);

    expect(mockTrackSearchConversionClickHandler).toHaveBeenCalled();
    expect(mockOptimizelyEnrollmentClickHandler).toHaveBeenCalled();
  });
});
