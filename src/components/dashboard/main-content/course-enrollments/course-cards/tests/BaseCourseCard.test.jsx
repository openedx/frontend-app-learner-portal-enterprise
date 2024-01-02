import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';

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

      wrapper = render((
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
      fireEvent.click(wrapper.container.querySelector('button.btn-icon'));
      fireEvent.click(wrapper.container.querySelectorAll('button.dropdown-item')[0]);

      expect(screen.getAllByText('Email settings')).toHaveLength(2);
    });

    it('test modal close/cancel', () => {
      fireEvent.click(screen.getAllByText('Close')[1]);
      expect(screen.getAllByText('Email settings')).toHaveLength(1);
    });
  });

  describe('unenroll modal', () => {
    const mockAddToast = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();

      wrapper = render((
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
      fireEvent.click(wrapper.container.querySelector('button.btn-icon'));
      fireEvent.click(wrapper.container.querySelectorAll('button.dropdown-item')[1]);
      expect(screen.getByText('Unenroll from course?')).toBeTruthy();
    });

    it('test modal close/cancel', () => {
      fireEvent.click(screen.getAllByText('Close')[1]);
      expect(screen.queryByText('Unenroll from course?')).toBeFalsy();
    });
  });

  it('should render Skeleton if isLoading = true', () => {
    render((
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

    expect(screen.getByText('Loading...')).toBeTruthy();
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

      wrapper = render((
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

      if (formattedStartDate && !isCourseStarted) {
        expect(screen.getByText(`Starts ${formattedStartDate}`)).toBeTruthy();
      } else {
        expect(screen.queryByText(`Starts ${formattedStartDate}`)).toBeFalsy();
      }
    });
  });

  it('renders endDate based on the course state', () => {
    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    const formattedEndDate = dayjs(endDate).format('MMMM Do, YYYY');
    const type = 'in_progress';

    wrapper = render((
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

    if (formattedEndDate && dayjs(startDate) <= dayjs() && type !== 'completed') {
      expect(screen.getByText(`Ends ${formattedEndDate}`)).toBeTruthy();
    } else {
      expect(screen.queryByText(`Ends ${formattedEndDate}`)).toBeFalsy();
    }
  });

  it('renders Enroll By Date if the user is not enrolled', () => {
    const enrollBy = new Date();
    enrollBy.setDate(enrollBy.getDate() + 14);
    const formattedEnrollByDate = dayjs(enrollBy).format('MMMM Do, YYYY');
    const courseRunStatus = 'assigned';

    wrapper = render((
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

    if (formattedEnrollByDate && courseRunStatus === 'assigned') {
      expect(screen.getByText(`Enroll by ${formattedEnrollByDate}`)).toBeTruthy();
    } else {
      expect(screen.queryByText(`Enroll by ${formattedEnrollByDate}`)).toBeFalsy();
    }
  });
});
