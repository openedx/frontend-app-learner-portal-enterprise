import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';

import { CourseContextProvider } from '../CourseContextProvider';
import EnrollModal, { modalText } from '../EnrollModal';

const baseCourseInitialState = {
  activeCourseRun: {
    key: 'test-course-run-key',
  },
  algoliaSearchParams: {
    queryId: undefined,
    objectId: undefined,
  },
};

// eslint-disable-next-line react/prop-types
const EnrollModalWrapper = ({ courseState = baseCourseInitialState, modalProps }) => (
  <CourseContextProvider initialState={courseState}>
    <EnrollModal {...modalProps} />
  </CourseContextProvider>
);

describe('<EnrollModal />', () => {
  const defaultProps = {
    enrollmentUrl: 'foo',
    isModalOpen: true,
    offersCount: 1,
    setIsModalOpen: () => {},
    courseHasOffer: true,
  };
  it('displays the correct text when user has valid offers', () => {
    render(<EnrollModalWrapper modalProps={defaultProps} />);
    expect(screen.getByText(modalText.fullOffers.title)).toBeInTheDocument();
    expect(screen.getByText(modalText.fullOffers.body(defaultProps.offersCount))).toBeInTheDocument();
    expect(screen.getByText(modalText.fullOffers.button)).toBeInTheDocument();
  });
  it('displays the correct text when user has no offers', () => {
    const modalProps = {
      ...defaultProps,
      offersCount: 0,
      courseHasOffer: false,
    };
    render(<EnrollModalWrapper modalProps={modalProps} />);
    expect(screen.getByText(modalText.noOffers.title)).toBeInTheDocument();
    expect(screen.getByText(modalText.noOffers.body)).toBeInTheDocument();
    expect(screen.getByText(modalText.noOffers.button)).toBeInTheDocument();
  });
  it('displays the correct text when user does not have a valid offer', () => {
    const modalProps = {
      ...defaultProps,
      courseHasOffer: false,
    };
    render(<EnrollModalWrapper modalProps={modalProps} />);
    expect(screen.getByText(modalText.noOffers.title)).toBeInTheDocument();
    expect(screen.getByText(modalText.noOffers.body)).toBeInTheDocument();
    expect(screen.getByText(modalText.noOffers.button)).toBeInTheDocument();
  });
});
