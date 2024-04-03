import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { AppContext } from '@edx/frontend-platform/react';

import MarkCompleteModal, { MARK_SAVED_FOR_LATER_DEFAULT_LABEL, MARK_SAVED_FOR_LATER_PENDING_LABEL } from '../MarkCompleteModal';
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
    render((
      <AppContext.Provider value={{ enterpriseConfig }}>
        <MarkCompleteModal
          {...initialProps}
        />
      </AppContext.Provider>
    ));
    const buttonElement = screen.getAllByRole('button');
    fireEvent.click(buttonElement[buttonElement.length - 1]);
    expect(service.updateCourseCompleteStatusRequest).toBeCalledWith({
      course_id: initialProps.courseId,
      enterprise_id: enterpriseConfig.uuid,
      saved_for_later: true,
    });
    expect(buttonElement[buttonElement.length - 1].textContent).toEqual(MARK_SAVED_FOR_LATER_PENDING_LABEL);
  });

  it('handles confirm click with error', async () => {
    // eslint-disable-next-line no-import-assign
    service.markCourseAsCompleteRequest = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('test error')));
    render((
      <AppContext.Provider value={{ enterpriseConfig }}>
        <MarkCompleteModal
          {...initialProps}
        />
      </AppContext.Provider>
    ));
    const buttonElement = screen.getAllByRole('button');
    await act(async () => {
      fireEvent.click(buttonElement[buttonElement.length - 1]);
    });
    expect(service.updateCourseCompleteStatusRequest).toBeCalledWith({
      course_id: initialProps.courseId,
      enterprise_id: enterpriseConfig.uuid,
      saved_for_later: true,
    });
    expect(buttonElement[buttonElement.length - 1].textContent).toEqual(MARK_SAVED_FOR_LATER_DEFAULT_LABEL);
  });

  it('handles close modal', () => {
    const mockOnClose = jest.fn();
    render((
      <AppContext.Provider value={{ enterpriseConfig }}>
        <MarkCompleteModal
          {...initialProps}
          onClose={mockOnClose}
        />
      </AppContext.Provider>
    ));
    const buttonElement = screen.getAllByRole('button');
    act(() => {
      fireEvent.click(buttonElement[1]);
    });
    expect(mockOnClose).toBeCalledTimes(1);
  });
});
