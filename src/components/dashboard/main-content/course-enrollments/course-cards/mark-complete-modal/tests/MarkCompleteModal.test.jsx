import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import MarkCompleteModal, { MARK_SAVED_FOR_LATER_DEFAULT_LABEL, MARK_SAVED_FOR_LATER_PENDING_LABEL } from '../MarkCompleteModal';
import * as service from '../data/service';
import { useEnterpriseCustomer } from '../../../../../../app/data';

jest.mock('../data/service');

jest.mock('../../../../../../app/data', () => ({
  ...jest.requireActual('../../../../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const initialProps = {
  isOpen: true,
  onSuccess: jest.fn(),
  onClose: jest.fn(),
  courseId: 'course-v1:my-test-course',
  courseTitle: 'edX Demonstration Course',
  courseLink: 'https://edx.org',
};

const mockEnterpriseCustomer = {
  uuid: 'example-enterprise-uuid',
};

describe('<MarkCompleteModal />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  it('handles confirm click with success', async () => {
    // eslint-disable-next-line no-import-assign
    service.markCourseAsCompleteRequest = jest.fn()
      .mockImplementation(() => Promise.resolve({
        data: {
          course_run_status: 'completed',
        },
      }));
    const wrapper = mount((
      <MarkCompleteModal
        {...initialProps}
      />
    ));
    act(() => {
      wrapper.find('.confirm-mark-complete-btn').hostNodes().simulate('click');
    });
    expect(service.updateCourseCompleteStatusRequest).toBeCalledWith({
      course_id: initialProps.courseId,
      enterprise_id: mockEnterpriseCustomer.uuid,
      saved_for_later: true,
    });
    expect(wrapper.find('.confirm-mark-complete-btn').hostNodes().text()).toEqual(MARK_SAVED_FOR_LATER_PENDING_LABEL);
  });

  it('handles confirm click with error', async () => {
    // eslint-disable-next-line no-import-assign
    service.markCourseAsCompleteRequest = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('test error')));
    const wrapper = mount((
      <MarkCompleteModal
        {...initialProps}
      />
    ));
    await act(async () => {
      wrapper.find('.confirm-mark-complete-btn').hostNodes().simulate('click');
    });
    expect(service.updateCourseCompleteStatusRequest).toBeCalledWith({
      course_id: initialProps.courseId,
      enterprise_id: mockEnterpriseCustomer.uuid,
      saved_for_later: true,
    });
    expect(wrapper.find('.confirm-mark-complete-btn').hostNodes().text()).toEqual(MARK_SAVED_FOR_LATER_DEFAULT_LABEL);
  });

  it('handles close modal', () => {
    const mockOnClose = jest.fn();
    const wrapper = mount((
      <MarkCompleteModal
        {...initialProps}
        onClose={mockOnClose}
      />
    ));
    act(() => {
      wrapper.find('[data-testid="mark-complete-modal-cancel-btn"]').hostNodes().simulate('click');
    });
    expect(mockOnClose).toBeCalledTimes(1);
  });
});
