import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import EnrollModal, { modalText } from '../EnrollModal';

describe('<EnrollModal />', () => {
  const defaultProps = {
    enrollmentUrl: 'foo',
    isModalOpen: true,
    offersCount: 1,
    setIsModalOpen: () => {},
    courseHasOffer: true,
  };
  it('displays the correct text when user has valid offers', () => {
    render(<EnrollModal {...defaultProps} />);
    expect(screen.getByText(modalText.fullOffers.title)).toBeInTheDocument();
    expect(screen.getByText(modalText.fullOffers.body(defaultProps.offersCount))).toBeInTheDocument();
    expect(screen.getByText(modalText.fullOffers.button)).toBeInTheDocument();
  });
  it('displays the correct text when user has no offers', () => {
    render(<EnrollModal {...defaultProps} offersCount={0} courseHasOffer={false} />);
    expect(screen.getByText(modalText.noOffers.title)).toBeInTheDocument();
    expect(screen.getByText(modalText.noOffers.body)).toBeInTheDocument();
    expect(screen.getByText(modalText.noOffers.button)).toBeInTheDocument();
  });
  it('displays the correct text when user does not have a valid offer', () => {
    render(<EnrollModal {...defaultProps} courseHasOffer={false} />);
    expect(screen.getByText(modalText.noOffers.title)).toBeInTheDocument();
    expect(screen.getByText(modalText.noOffers.body)).toBeInTheDocument();
    expect(screen.getByText(modalText.noOffers.button)).toBeInTheDocument();
  });
});
