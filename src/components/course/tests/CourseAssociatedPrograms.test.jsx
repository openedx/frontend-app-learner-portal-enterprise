import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import CourseAssociatedPrograms from '../CourseAssociatedPrograms';
import { useCourseMetadata, useEnterpriseCustomer } from '../../app/data';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
  hasFeatureFlagEnabled: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useCourseMetadata: jest.fn(),
}));

const CourseAssociatedProgramsWrapper = () => (
  <IntlProvider locale="en">
    <CourseAssociatedPrograms />
  </IntlProvider>
);

const mockPrograms = [
  {
    uuid: '123', type: 'abc', title: 'title a', marketingUrl: 'www.example.com',
  },
  {
    uuid: '456', type: 'def', title: 'title b', marketingUrl: 'www.example.com',
  },
];

describe('<CourseAssociatedPrograms />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: { uuid: 'test-enterprise-uuid' } });
    useCourseMetadata.mockReturnValue({ data: { programs: mockPrograms } });
  });

  test('renders programs with title', () => {
    render(<CourseAssociatedProgramsWrapper />);
    mockPrograms.forEach((program, index) => {
      expect(screen.queryByText(program.title)).toBeInTheDocument();
      const button = screen.getByText(program.title);
      userEvent.click(button);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(index + 1);
    });
  });
});
