import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import CourseRunCardStatus from '../CourseRunCardStatus';

const baseProps = {
  missingUserSubsidyReason: undefined,
  isUserEnrolled: false,
};

const mockActionTestId = 'fake-action-button';
const mockMissingUserSubsidyReason = {
  reason: 'learner_max_spend_reached',
  userMessage: 'Fake reason.',
  actions: <div data-testid={mockActionTestId} />,
};

describe('<CourseRunCardStatus />', () => {
  test('does not render if there is no missing subsidy reason', () => {
    const { container } = render(<CourseRunCardStatus />);
    expect(container).toBeEmptyDOMElement();
  });

  test('does not render if the user is already enrolled with a missing subsidy reason', () => {
    const props = {
      ...baseProps,
      missingUserSubsidyReason: mockMissingUserSubsidyReason,
      isUserEnrolled: true,
    };
    const { container } = render(<CourseRunCardStatus {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders with the message and optional actions', () => {
    const props = {
      ...baseProps,
      missingUserSubsidyReason: mockMissingUserSubsidyReason,
    };
    render(<CourseRunCardStatus {...props} />);
    expect(screen.getByText(mockMissingUserSubsidyReason.userMessage)).toBeInTheDocument();
    expect(screen.getByTestId(mockActionTestId)).toBeInTheDocument();
  });
});
