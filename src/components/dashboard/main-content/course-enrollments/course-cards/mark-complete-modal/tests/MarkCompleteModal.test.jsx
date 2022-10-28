import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { AppContext } from '@edx/frontend-platform/react';

import MarkCompleteModal, { MARK_SAVED_FOR_LATER_DEFAULT_LABEL, MARK_SAVED_FOR_LATER_PENDING_LABEL } from '../MarkCompleteModal';
import * as service from '../data/service';

jest.mock('../data/service');

const ModalWrapper = ({ initialProps, enterpriseConfig }) => {
  const contextValue = useMemo(() => ({ enterpriseConfig }), [enterpriseConfig]);
  return (
    <AppContext.Provider value={contextValue}>
      <MarkCompleteModal
        {...initialProps}
      />
    </AppContext.Provider>
  );
};

ModalWrapper.propTypes = {
  initialProps: PropTypes.shape({}).isRequired,
  enterpriseConfig: PropTypes.shape({}).isRequired,
};

describe('<MarkCompleteModal />', () => {
  const initialProps = {
    isOpen: true,
    onSuccess: jest.fn(),
    onClose: jest.fn(),
    courseId: 'course-v1:my-test-course',
    courseTitle: 'edX Demonstration Course',
    courseLink: 'https://edx.org',
  };

  const enterpriseConfig = {
    uuid: 'example-enterprise-uuid',
  };

  it('handles confirm click with success', () => {
    // eslint-disable-next-line no-import-assign
    service.markCourseAsCompleteRequest = jest.fn()
      .mockImplementation(() => Promise.resolve({
        data: {
          course_run_status: 'completed',
        },
      }));
    const wrapper = mount(<ModalWrapper initialProps={initialProps} enterpriseConfig={enterpriseConfig} />);
    wrapper.find('.confirm-mark-complete-btn').hostNodes().simulate('click');
    expect(service.updateCourseCompleteStatusRequest).toBeCalledWith({
      course_id: initialProps.courseId,
      enterprise_id: enterpriseConfig.uuid,
      saved_for_later: true,
    });
    expect(wrapper.find('.confirm-mark-complete-btn').hostNodes().text()).toEqual(MARK_SAVED_FOR_LATER_PENDING_LABEL);
  });

  it('handles confirm click with error', async () => {
    // eslint-disable-next-line no-import-assign
    service.markCourseAsCompleteRequest = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('test error')));
    const wrapper = mount(<ModalWrapper initialProps={initialProps} enterpriseConfig={enterpriseConfig} />);
    await act(async () => {
      wrapper.find('.confirm-mark-complete-btn').hostNodes().simulate('click');
    });
    expect(service.updateCourseCompleteStatusRequest).toBeCalledWith({
      course_id: initialProps.courseId,
      enterprise_id: enterpriseConfig.uuid,
      saved_for_later: true,
    });
    expect(wrapper.find('.confirm-mark-complete-btn').hostNodes().text()).toEqual(MARK_SAVED_FOR_LATER_DEFAULT_LABEL);
  });

  it('handles close modal', () => {
    const mockOnClose = jest.fn();
    initialProps.onClose = mockOnClose;
    const wrapper = mount(
      <ModalWrapper initialProps={initialProps} enterpriseConfig={enterpriseConfig} />,
    );
    act(() => {
      wrapper.find('.modal-footer button.btn-link').hostNodes().simulate('click');
    });
    expect(mockOnClose).toBeCalledTimes(1);
  });
});
