import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { AppContext } from '@edx/frontend-platform/react';

import MarkCompleteModal from '../MarkCompleteModal';
import * as service from '../data/service';

jest.mock('../data/service');

describe('<MarkCompleteModal />', () => {
  const initialProps = {
    isOpen: true,
    onSuccess: jest.fn(),
    onClose: jest.fn(),
    courseId: 'course-v1:my-test-course',
    courseTitle: 'edX Demonstration Course',
    courseLink: 'https://edx.org',
  };

  const pageContext = {
    enterpriseUUID: 'example-enterprise-uuid',
  };

  it('handles confirm click with success', () => {
    service.markCourseAsCompleteRequest = jest.fn()
      .mockImplementation(() => Promise.resolve({
        data: {
          course_run_status: 'completed',
        },
      }));
    const wrapper = mount((
      <AppContext.Provider value={{ pageContext }}>
        <MarkCompleteModal
          {...initialProps}
        />
      </AppContext.Provider>
    ));
    wrapper.find('.confirm-mark-complete-btn').hostNodes().simulate('click');
    expect(service.markCourseAsCompleteRequest).toBeCalledWith({
      course_id: 'course-v1:my-test-course',
      enterprise_id: 'example-enterprise-uuid',
      marked_done: 'True',
    });
    expect(wrapper.find('.confirm-mark-complete-btn').hostNodes().text()).toEqual('Marking as complete...');
  });

  it('handles confirm click with error', async () => {
    service.markCourseAsCompleteRequest = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('test error')));
    const wrapper = mount((
      <AppContext.Provider value={{ pageContext }}>
        <MarkCompleteModal
          {...initialProps}
        />
      </AppContext.Provider>
    ));
    await act(async () => {
      wrapper.find('.confirm-mark-complete-btn').hostNodes().simulate('click');
    });
    expect(service.markCourseAsCompleteRequest).toBeCalledWith({
      course_id: 'course-v1:my-test-course',
      enterprise_id: 'example-enterprise-uuid',
      marked_done: 'True',
    });
    expect(wrapper.find('.confirm-mark-complete-btn').hostNodes().text()).toEqual('Mark as complete');
  });

  it('handles close modal', () => {
    const mockOnClose = jest.fn();
    const wrapper = mount((
      <AppContext.Provider value={{ pageContext }}>
        <MarkCompleteModal
          {...initialProps}
          onClose={mockOnClose}
        />
      </AppContext.Provider>
    ));
    act(() => {
      wrapper.find('.modal-footer button.js-close-modal-on-click').hostNodes().simulate('click');
    });
    expect(mockOnClose).toBeCalledTimes(1);
  });
});
