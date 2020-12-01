import React from 'react';
import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { StatefulButton } from '@edx/paragon';

import { EmailSettingsModal } from '../EmailSettingsModal';

const mockStore = configureMockStore([thunk]);
const store = mockStore({});

describe('<EmailSettingsModal />', () => {
  let wrapper;
  let mockUpdateEmailSettings;

  beforeEach(() => {
    mockUpdateEmailSettings = jest.fn().mockResolvedValueOnce({
      data: {},
    });

    wrapper = mount((
      <EmailSettingsModal
        store={store}
        onClose={() => {}}
        courseRunId="my+course+key"
        updateEmailSettings={mockUpdateEmailSettings}
      />
    ));

    // The `EmailSettingsModal` component mounts in `BaseCourseCard` and is
    // opened via the `open` prop. Similarly, the `hasEmailsEnabled` prop
    // is initially `false` until the modal is opened, at which point it's
    // set to whatever the correct value is for that particular course run.
    // Setting the `hasEmailsEnabled` prop here simulates that behavior.
    wrapper.setProps({
      hasEmailsEnabled: true,
    });
  });

  it('statefulbutton component state is initially set to default and disabled', () => {
    const defaultState = 'default';
    expect(wrapper.find(StatefulButton).prop('state')).toEqual(defaultState);
    expect(wrapper.find(StatefulButton).prop('disabledStates')).toContain(defaultState);
  });

  it('statefulbutton component state is set to complete after click event', async () => {
    // Note: The following line is needed to properly resolve the
    // `updateEmailSettings` promise.
    const flushPromises = () => new Promise(setImmediate);

    expect(wrapper.find(StatefulButton).prop('state')).toEqual('default');
    wrapper.find('input[type="checkbox"]').simulate('change', { target: { checked: false } });
    wrapper.find(StatefulButton).simulate('click');
    await flushPromises();
    wrapper.update();
    expect(mockUpdateEmailSettings.mock.calls.length).toBe(1);
    expect(wrapper.find(StatefulButton).prop('state')).toEqual('complete');
  });
});
