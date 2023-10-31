import React from 'react';
import { mount } from 'enzyme';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';
import { Skeleton } from '@edx/paragon';

import dayjs from '../../../../../../utils/dayjs';
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

  it('renders with different startDate values', () => {
    const today = new Date().toISOString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    [today, yesterday, tomorrow].forEach(startDate => {
      const formattedStartDate = dayjs(startDate).format('MMMM Do, YYYY');
      const isCourseStarted = dayjs(startDate) <= dayjs();

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

      const renderedStartDate = wrapper.instance().renderStartDate();
      const expectedOutput = formattedStartDate && !isCourseStarted
        ? <span className="font-weight-light pr-2">Starts {formattedStartDate}</span>
        : null;

      expect(renderedStartDate).toEqual(expectedOutput);
    });
  });

  it('renders endDate based on the course state', () => {
    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    const formattedEndDate = dayjs(endDate).format('MMMM Do, YYYY');
    const type = 'in_progress';

    wrapper = mount((
      <AppContext.Provider value={{ enterpriseConfig }}>
        <BaseCourseCard
          type={type}
          title="edX Demonstration Course"
          linkToCourse="https://edx.org"
          courseRunId="my+course+key"
          hasEmailsEnabled
          startDate={startDate}
          endDate={endDate.toISOString()}
          mode="executive-education"
          orgName="some_name"
          pacing="self"
        />
      </AppContext.Provider>
    ));

    const renderedEndDate = wrapper.instance().renderEndDate();
    const expectedOutput = formattedEndDate && dayjs(startDate) <= dayjs() && type !== 'completed'
      ? <span className="font-weight-light pr-2">Ends {formattedEndDate}</span>
      : null;

    expect(renderedEndDate).toEqual(expectedOutput);
  });

  it('renders Enroll By Date if the user is not enrolled', () => {
    const enrollBy = new Date();
    enrollBy.setDate(enrollBy.getDate() + 14);
    const formattedEnrollByDate = dayjs(enrollBy).format('MMMM Do, YYYY');
    const courseRunStatus = 'assigned';

    wrapper = mount((
      <AppContext.Provider value={{ enterpriseConfig }}>
        <BaseCourseCard
          courseRunStatus={courseRunStatus}
          title="edX Demonstration Course"
          linkToCourse="https://edx.org"
          courseRunId="my+course+key"
          hasEmailsEnabled
          enrollBy={enrollBy.toISOString()}
        />
      </AppContext.Provider>
    ));

    const isNotEnrolled = wrapper.instance().renderEnrollByDate();
    const expectedOutput = formattedEnrollByDate && courseRunStatus === 'assigned'
      ? <>&#x2022;<span className="font-weight-light pl-2">Enroll by {formattedEnrollByDate}</span></>
      : null;

    expect(isNotEnrolled).toEqual(expectedOutput);
  });
});
