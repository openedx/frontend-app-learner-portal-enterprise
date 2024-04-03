import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EmailSettingsModal } from '../EmailSettingsModal';
import { updateEmailSettings } from '../data';

jest.mock('../data');

describe('<EmailSettingsModal />', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render((
      <EmailSettingsModal
        onClose={() => {}}
        courseRunId="my+course+key"
      />
    ));

    // The `EmailSettingsModal` component mounts in `BaseCourseCard` and is
    // opened via the `open` prop. Similarly, the `hasEmailsEnabled` prop
    // is initially `false` until the modal is opened, at which point it's
    // set to whatever the correct value is for that particular course run.
    // Setting the `hasEmailsEnabled` prop here simulates that behavior.
    wrapper.rerender((
      <EmailSettingsModal
        onClose={() => {}}
        courseRunId="my+course+key"
        hasEmailsEnabled
      />
    ));
  });

  it('statefulbutton component state is initially set to default and disabled', () => {
    const buttonElement = screen.getAllByRole('button');

    expect(buttonElement[buttonElement.length - 1].getAttribute('aria-disabled')).toEqual('true');
    expect(buttonElement[buttonElement.length - 1].disabled).toEqual(false);
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('statefulbutton component state is set to complete after click event', async () => {
    // Note: The following line is needed to properly resolve the
    // `updateEmailSettings` promise.
    const flushPromises = () => new Promise(setImmediate);
    const buttonElement = screen.getAllByRole('button');

    expect(screen.getByText('Save')).toBeTruthy();
    expect(screen.queryByText('Saved')).toBeFalsy();

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(buttonElement[buttonElement.length - 1]);
    await flushPromises();

    expect(updateEmailSettings).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Saved')).toBeTruthy();
    expect(screen.queryByText('Save')).toBeFalsy();
  });
});
