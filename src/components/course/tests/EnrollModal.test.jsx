import React from 'react';
import PropTypes from 'prop-types';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';

import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
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
  catalog: { catalogList: [] },
};

const baseSubsidyRequestContextValue = {
  catalogsForSubsidyRequests: new Set(),
};

const EnrollModalWrapper = ({
  courseState = baseCourseInitialState,
  subsidyRequestContextValue = baseSubsidyRequestContextValue,
  modalProps,
}) => (
  <SubsidyRequestsContext.Provider value={subsidyRequestContextValue}>
    <CourseContextProvider initialState={courseState}>
      <EnrollModal {...modalProps} />
    </CourseContextProvider>
  </SubsidyRequestsContext.Provider>
);

EnrollModalWrapper.propTypes = {
  courseState: PropTypes.shape(),
  subsidyRequestContextValue: PropTypes.shape(),
  modalProps: PropTypes.shape(),
};

EnrollModalWrapper.defaultProps = {
  courseState: baseCourseInitialState,
  subsidyRequestContextValue: baseSubsidyRequestContextValue,
  modalProps: {},
};

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
