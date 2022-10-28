import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';

import Skeleton from 'react-loading-skeleton';
import BaseCourseCard from '../BaseCourseCard';
import { CourseEnrollmentsContext } from '../../CourseEnrollmentsContextProvider';
import { ToastsContext } from '../../../../../Toasts';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth');
getAuthenticatedUser.mockReturnValue({ username: 'test-username' });

const enterpriseConfig = {
  name: 'test-enterprise-name',
};

const CourseCardWrapper = ({ isLoading }) => {
  const contextValue = useMemo(() => ({ enterpriseConfig }), []);
  return (
    <AppContext.Provider value={contextValue}>
      <BaseCourseCard
        type="completed"
        title="edX Demonstration Course"
        linkToCourse="https://edx.org"
        courseRunId="my+course+key"
        hasEmailsEnabled
        isLoading={isLoading}
      />
    </AppContext.Provider>
  );
};
CourseCardWrapper.defaultProps = {
  isLoading: false,
};

CourseCardWrapper.propTypes = {
  isLoading: PropTypes.bool,
};

const CourseEnrollmentWrapper = () => {
  const contextValue = useMemo(() => ({ enterpriseConfig }), []);
  const toastContextValue = useMemo(() => ({ addToast: jest.fn() }), []);
  const enrollmentContextValue = useMemo(() => ({ removeCourseEnrollment: jest.fn() }), []);
  return (
    <AppContext.Provider value={contextValue}>
      <ToastsContext.Provider value={toastContextValue}>
        <CourseEnrollmentsContext.Provider value={enrollmentContextValue}>
          <BaseCourseCard
            type="in_progress"
            title="edX Demonstration Course"
            linkToCourse="https://edx.org"
            courseRunId="my+course+key"
            canUnenroll
            hasEmailsEnabled
          />
        </CourseEnrollmentsContext.Provider>
      </ToastsContext.Provider>
    </AppContext.Provider>
  );
};

describe('<BaseCourseCard />', () => {
  let wrapper;

  describe('email settings modal', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      wrapper = mount(<CourseCardWrapper />);
      // open email settings modal
      wrapper.find('Dropdown').find('button.btn-icon').simulate('click');
      wrapper.find('Dropdown').find('button.dropdown-item').simulate('click');
      expect(wrapper.find('BaseCourseCard').state('modals').emailSettings.open).toBeTruthy();
    });

    it('test modal close/cancel', () => {
      wrapper.find('EmailSettingsModal').find('.modal-footer .btn-link').first().simulate('click');
      expect(wrapper.find('BaseCourseCard').state('modals').emailSettings.open).toBeFalsy();
    });
  });

  describe('unenroll modal', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      wrapper = mount(<CourseEnrollmentWrapper />);
      // open unenroll modal
      wrapper.find('Dropdown').find('button.btn-icon').simulate('click');
      wrapper.find('Dropdown').find('button.dropdown-item').at(1).simulate('click');
      expect(wrapper.find('BaseCourseCard').state('modals').unenroll.open).toBeTruthy();
    });

    it('test modal close/cancel', () => {
      wrapper.find('UnenrollModal').find('.btn-tertiary').simulate('click');
      expect(wrapper.find('BaseCourseCard').state('modals').unenroll.open).toBeFalsy();
    });
  });

  it('should render Skeleton if isLoading = true', () => {
    wrapper = mount(<CourseCardWrapper isLoading />);

    expect(wrapper.find(Skeleton)).toBeTruthy();
  });
});
