import React from 'react';
import { mount } from 'enzyme';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';
import { Skeleton } from '@edx/paragon';

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

describe('<BaseCourseCard />', () => {
  let wrapper;

  describe('email settings modal', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      wrapper = mount((
        <AppContext.Provider value={{ enterpriseConfig }}>
          <BaseCourseCard
            type="completed"
            title="edX Demonstration Course"
            linkToCourse="https://edx.org"
            courseRunId="my+course+key"
            hasEmailsEnabled
          />
        </AppContext.Provider>
      ));
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
    const mockAddToast = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();

      wrapper = mount((
        <AppContext.Provider value={{ enterpriseConfig }}>
          <ToastsContext.Provider value={{ addToast: mockAddToast }}>
            <CourseEnrollmentsContext.Provider value={{ removeCourseEnrollment: jest.fn() }}>
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
      ));
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
    wrapper = mount((
      <AppContext.Provider value={{ enterpriseConfig }}>
        <BaseCourseCard
          type="completed"
          title="edX Demonstration Course"
          linkToCourse="https://edx.org"
          courseRunId="my+course+key"
          hasEmailsEnabled
          isLoading
        />
      </AppContext.Provider>
    ));

    expect(wrapper.find(Skeleton)).toBeTruthy();
  });

  describe('Executive-education BaseCard', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders with different startDate values', () => {
      dayjs.extend(advancedFormat);
      const today = new Date().toISOString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      [today, yesterday, tomorrow].forEach(startDate => {
        const formattedStartDate = dayjs(startDate).format('MMMM Do, YYYY');
        wrapper = mount((
          <AppContext.Provider value={{ enterpriseConfig }}>
            <BaseCourseCard
              type="in_progress"
              title="edX Demonstration Course"
              linkToCourse="https://edx.org"
              courseRunId="my+course+key"
              hasEmailsEnabled
              courseType="executive-education-2u"
              productSource="2u"
              mode="executive-education"
              startDate={startDate}
              orgName="some_name"
              pacing="self"
            />
          </AppContext.Provider>
        ));

        const hasCourseStarted = wrapper.instance().renderCourseStartDate();
        expect(hasCourseStarted).toBeTruthy();
        expect(hasCourseStarted.props.children).toContain(formattedStartDate);
      });
    });
  });
});
