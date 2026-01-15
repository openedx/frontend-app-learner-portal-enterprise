import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import EmailSettingsModal from '../EmailSettingsModal';
import { updateEmailSettings } from '../data';

jest.mock('../data');

const mockCourseRunId = 'course-v1:edX+DemoX+Demo_Course';
const mockClose = jest.fn();

describe('<EmailSettingsModal />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Save button is initially in default state and disabled', async () => {
    render(
      <IntlProvider locale="en">
        <EmailSettingsModal
          onClose={mockClose}
          courseRunId={mockCourseRunId}
          open
        />
      </IntlProvider>,
    );
    const saveBtn = screen.getByRole('button', { name: 'Save' });
    expect(saveBtn).toHaveAttribute('aria-disabled', 'true');
    expect(saveBtn).toHaveClass('disabled');
  });

  it('Save button updates email settings, and handles modal close', async () => {
    const user = userEvent.setup();
    render(
      <IntlProvider locale="en">
        <EmailSettingsModal
          onClose={mockClose}
          courseRunId={mockCourseRunId}
          open
        />
      </IntlProvider>,
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    const saveBtn = screen.getByRole('button', { name: 'Save' });
    await user.click(saveBtn);
    expect(updateEmailSettings).toHaveBeenCalledTimes(1);
    expect(updateEmailSettings).toHaveBeenCalledWith(mockCourseRunId, true);

    const completeBtn = screen.getByRole('button', { name: 'Saved' });
    expect(completeBtn).toBeInTheDocument();

    const closeBtn = screen.getByTestId('email-setting-modal-close-btn');
    await user.click(closeBtn);
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledWith(true); // true because email settings were enabled
  });

  it('Close button calls onClose before updating form', async () => {
    render(
      <IntlProvider locale="en">
        <EmailSettingsModal
          onClose={mockClose}
          courseRunId={mockCourseRunId}
          open
        />
      </IntlProvider>,
    );
    const closeBtn = screen.getByTestId('email-setting-modal-close-btn');
    await userEvent.click(closeBtn);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('Error alert is displayed when email settings update fails', async () => {
    updateEmailSettings.mockRejectedValueOnce(new Error('Failed to update email settings'));
    render(
      <IntlProvider locale="en">
        <EmailSettingsModal
          onClose={mockClose}
          courseRunId={mockCourseRunId}
          open
        />
      </IntlProvider>,
    );
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    const saveBtn = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(saveBtn);
    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent('An error occurred while saving your email settings. Please try again.');
  });
});
