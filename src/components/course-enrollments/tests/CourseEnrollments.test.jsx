import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { breakpoints } from '@edx/paragon';

import '../../../__mocks__/reactResponsive.mock';

import { AppContext } from '../../app-context';
import { CourseEnrollments } from '../CourseEnrollments';

const mockStore = configureMockStore([thunk]);

describe('<CourseEnrollments />', () => {
  const mockFetchCourseEnrollments = jest.fn();
  const mockClearCourseEnrollments = jest.fn();
  const mockModifyIsMarkCourseCompleteSuccess = jest.fn();
  const initialProps = {
    courseRuns: {
      in_progress: [],
      upcoming: [],
      completed: [],
    },
    isLoading: false,
    error: null,
    sidebarComponent: <div className="sidebar-example" />,
    fetchCourseEnrollments: mockFetchCourseEnrollments,
    clearCourseEnrollments: mockClearCourseEnrollments,
    isMarkCourseCompleteSuccess: false,
    modifyIsMarkCourseCompleteSuccess: mockModifyIsMarkCourseCompleteSuccess,
  };

  describe('renders course enrollments correctly', () => {
    it('with no course enrollments', () => {
      const pageContext = {
        enterpriseUUID: 'test-enterprise-uuid',
      };
      const wrapper = mount((
        <AppContext.Provider value={{ pageContext }}>
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
      };
      const pageContext = {
        programUUID: 'test-program-uuid',
      };
      const store = mockStore({
        userAccount: {
          username: 'edx',
        },
        emailSettings: {
          loading: false,
          error: null,
          data: null,
        },
      });
      const wrapper = mount((
        <Provider store={store}>
          <AppContext.Provider value={{ pageContext }}>
            <CourseEnrollments
              {...initialProps}
              courseRuns={courseRuns}
            />
          </AppContext.Provider>
        </Provider>
      ));

      expect(wrapper.html()).not.toBeNull();
      expect(wrapper.find('.course-section').length).toEqual(2);
      expect(wrapper.find('.course-section').first().find('.course').length).toEqual(1);
      expect(wrapper.find('.course-section').last().find('.course').length).toEqual(1);
    });

    it('with error', () => {
      const pageContext = {
        enterpriseUUID: 'test-enterprise-uuid',
      };
      const tree = renderer
        .create((
          <AppContext.Provider value={{ pageContext }}>
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
      const pageContext = {
        enterpriseUUID: 'test-enterprise-uuid',
      };
      const tree = renderer
        .create((
          <AppContext.Provider value={{ pageContext }}>
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
      const pageContext = {
        enterpriseUUID: 'test-enterprise-uuid',
      };
      const tree = renderer
        .create((
          <AppContext.Provider value={{ pageContext }}>
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

  describe('sidebar', () => {
    let wrapper;

    it('is not shown at screen widths greater than or equal to large breakpoint', () => {
      global.innerWidth = breakpoints.large.minWidth;
      const pageContext = {
        enterpriseUUID: 'test-enterprise-uuid',
      };
      wrapper = mount((
        <AppContext.Provider value={{ pageContext }}>
          <CourseEnrollments {...initialProps} />
        </AppContext.Provider>
      ));
      expect(wrapper.find('.sidebar-example').exists()).toBeFalsy();
    });

    it('is shown at screen widths less than large breakpoint', () => {
      global.innerWidth = breakpoints.small.minWidth;
      const pageContext = {
        enterpriseUUID: 'test-enterprise-uuid',
      };
      wrapper = mount((
        <AppContext.Provider value={{ pageContext }}>
          <CourseEnrollments {...initialProps} />
        </AppContext.Provider>
      ));
      expect(wrapper.find('.sidebar-example').exists()).toBeTruthy();
    });
  });

  describe('calls appropriate fetch method depending on page type', () => {
    beforeEach(() => {
      mockFetchCourseEnrollments.mockReset();
      mockClearCourseEnrollments.mockReset();
    });

    it('for program page', () => {
      const programUUID = 'test-program-uuid';
      const pageContext = { programUUID };
      mount((
        <AppContext.Provider value={{ pageContext }}>
          <CourseEnrollments {...initialProps} />
        </AppContext.Provider>
      ));
      expect(mockFetchCourseEnrollments.mock.calls.length).toEqual(1);
      expect(mockFetchCourseEnrollments).toBeCalledWith({
        programUUID,
      });
    });

    it('for enterprise page', () => {
      const enterpriseUUID = 'test-enterprise-uuid';
      const pageContext = {
        enterpriseUUID,
      };
      mount((
        <AppContext.Provider value={{ pageContext }}>
          <CourseEnrollments {...initialProps} />
        </AppContext.Provider>
      ));
      expect(mockFetchCourseEnrollments.mock.calls.length).toEqual(1);
      expect(mockFetchCourseEnrollments).toBeCalledWith({
        enterpriseUUID,
      });
    });
  });

  it('properly closes mark course as complete success status alert', () => {
    const pageContext = {
      enterpriseUUID: 'test-enterprise-uuid',
    };
    const wrapper = mount((
      <AppContext.Provider value={{ pageContext }}>
        <CourseEnrollments
          {...initialProps}
          isMarkCourseCompleteSuccess
        />
      </AppContext.Provider>
    ));
    wrapper.find('.alert .btn.close').simulate('click');
    expect(mockModifyIsMarkCourseCompleteSuccess).toBeCalledTimes(1);
  });
});
