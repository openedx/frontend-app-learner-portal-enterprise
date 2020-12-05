import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';

import '../../../../../__mocks__/reactResponsive.mock';

import { CourseEnrollments } from '../CourseEnrollments';

const mockStore = configureMockStore([thunk]);

jest.mock('@edx/frontend-platform/auth');
getAuthenticatedUser.mockReturnValue({ username: 'test-username' });

describe('<CourseEnrollments />', () => {
  const mockFetchCourseEnrollments = jest.fn();
  const mockClearCourseEnrollments = jest.fn();
  const mockModifyIsMarkCourseCompleteSuccess = jest.fn();
  const mockModifyIsMoveToInProgressCourseSuccess = jest.fn();
  const initialProps = {
    courseRuns: {
      in_progress: [],
      upcoming: [],
      completed: [],
      saved_for_later: [],
    },
    isLoading: false,
    error: null,
    fetchCourseEnrollments: mockFetchCourseEnrollments,
    clearCourseEnrollments: mockClearCourseEnrollments,
    isMarkCourseCompleteSuccess: false,
    modifyIsMarkCourseCompleteSuccess: mockModifyIsMarkCourseCompleteSuccess,
    isMoveToInProgressCourseSuccess: false,
    modifyIsMoveToInProgressCourseSuccess: mockModifyIsMoveToInProgressCourseSuccess,
  };

  describe('renders course enrollments correctly', () => {
    it('with no course enrollments', () => {
      const enterpriseConfig = {
        uuid: 'test-enterprise-uuid',
      };
      const wrapper = mount((
        <AppContext.Provider value={{ enterpriseConfig }}>
          <CourseEnrollments {...initialProps} />
        </AppContext.Provider>
      ));
      expect(wrapper.exists('.course-section')).toBeFalsy();
    });

    it('with valid course enrollments', () => {
      const sampleCourseRun = {
        courseRunId: 'course-v1:edX+DemoX+Demo_Course',
        courseRunStatus: 'completed',
        linkToCourse: 'https://edx.org/',
        title: 'edX Demonstration Course',
        notifications: [],
        startDate: '2017-02-05T05:00:00Z',
        endDate: '2018-08-18T05:00:00Z',
        hasEmailsEnabled: true,
        is_revoked: false,
      };
      const courseRuns = {
        in_progress: [{
          ...sampleCourseRun,
          courseRunId: 'course-v1:edX+DemoX+Demo_Course_2',
          courseRunStatus: 'in_progress',
          title: 'edX Demonstration Course 2',
          notifications: [{
            name: 'Assignment 1',
            url: 'https://edx.org/',
            date: '2019-05-31T07:50:00Z',
          }],
          microMastersTitle: 'Example MicroMasters Program',
        }],
        upcoming: [],
        completed: [sampleCourseRun],
        saved_for_later: [],
      };
      const enterpriseConfig = {
        uuid: 'test-program-uuid',
      };
      const store = mockStore({
        emailSettings: {
          loading: false,
          error: null,
          data: null,
        },
      });
      const wrapper = mount((
        <Provider store={store}>
          <AppContext.Provider value={{ enterpriseConfig }}>
            <CourseEnrollments
              {...initialProps}
              courseRuns={courseRuns}
            />
          </AppContext.Provider>
        </Provider>
      ));

      expect(wrapper.html()).not.toBeNull();
      expect(wrapper.find('.course-section').length).toEqual(2);
      expect(wrapper.find('.course-section').first().find('.dashboard-course-card').length).toEqual(1);
      expect(wrapper.find('.course-section').last().find('.dashboard-course-card').length).toEqual(1);
    });

    it('with error', () => {
      const enterpriseConfig = {
        uuid: 'test-enterprise-uuid',
      };
      const tree = renderer
        .create((
          <AppContext.Provider value={{ enterpriseConfig }}>
            <CourseEnrollments
              {...initialProps}
              error={new Error('Network Error')}
            />
          </AppContext.Provider>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with loading', () => {
      const enterpriseConfig = {
        uuid: 'test-enterprise-uuid',
      };
      const tree = renderer
        .create((
          <AppContext.Provider value={{ enterpriseConfig }}>
            <CourseEnrollments
              {...initialProps}
              isLoading
            />
          </AppContext.Provider>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with mark course as complete success status alert', () => {
      const enterpriseConfig = {
        uuid: 'test-enterprise-uuid',
      };
      const tree = renderer
        .create((
          <AppContext.Provider value={{ enterpriseConfig }}>
            <CourseEnrollments
              {...initialProps}
              isMarkCourseCompleteSuccess
            />
          </AppContext.Provider>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('calls appropriate fetch method depending on page type', () => {
    beforeEach(() => {
      mockFetchCourseEnrollments.mockReset();
      mockClearCourseEnrollments.mockReset();
    });

    it('for enterprise page', () => {
      const uuid = 'test-enterprise-uuid';
      const enterpriseConfig = {
        uuid,
      };
      mount((
        <AppContext.Provider value={{ enterpriseConfig }}>
          <CourseEnrollments {...initialProps} />
        </AppContext.Provider>
      ));
      expect(mockFetchCourseEnrollments.mock.calls.length).toEqual(1);
      expect(mockFetchCourseEnrollments).toBeCalledWith({
        uuid,
      });
    });
  });

  it('properly closes mark course as complete success status alert', () => {
    const enterpriseConfig = {
      uuid: 'test-enterprise-uuid',
    };
    const wrapper = mount((
      <AppContext.Provider value={{ enterpriseConfig }}>
        <CourseEnrollments
          {...initialProps}
          isMarkCourseCompleteSuccess
        />
      </AppContext.Provider>
    ));
    wrapper.find('.alert .btn.close').simulate('click');
    expect(mockModifyIsMarkCourseCompleteSuccess).toBeCalledTimes(1);
  });

  it('properly closes mark course as saved for later success status alert', () => {
    const enterpriseConfig = {
      uuid: 'test-enterprise-uuid',
    };
    const wrapper = mount((
      <AppContext.Provider value={{ enterpriseConfig }}>
        <CourseEnrollments
          {...initialProps}
          isMoveToInProgressCourseSuccess
        />
      </AppContext.Provider>
    ));
    wrapper.find('.alert .btn.close').simulate('click');
    expect(mockModifyIsMoveToInProgressCourseSuccess).toBeCalledTimes(1);
  });
});
