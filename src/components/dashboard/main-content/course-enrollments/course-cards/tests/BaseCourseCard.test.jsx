import React from 'react';
import { mount } from 'enzyme';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';

import BaseCourseCard from '../BaseCourseCard';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth');
getAuthenticatedUser.mockReturnValue({ username: 'test-username' });

describe('<BaseCourseCard />', () => {
  describe('email settings modal', () => {
    let wrapper;

    beforeEach(() => {
      const enterpriseConfig = {
        name: 'test-enterprise-name',
      };
      wrapper = mount((
        <AppContext.Provider value={{ enterpriseConfig }}>
          <BaseCourseCard
            type="completed"
            title="edX Demonstration Course"
            linkToCourse="https://edx.org"
            courseRunId="my+course+key"
            hasEmailsEnabled
          />
        </AppContext.Provider>
      ));
      // open email settings modal
      wrapper.find('Dropdown').find('button.dropdown-toggle').simulate('click');
      wrapper.find('Dropdown').find('button.dropdown-item').simulate('click');
      expect(wrapper.find('BaseCourseCard').state('modals').emailSettings.open).toBeTruthy();
    });

    it('test modal close/cancel', () => {
      wrapper.find('EmailSettingsModal').find('.modal-footer .btn-link').first().simulate('click');
      expect(wrapper.find('BaseCourseCard').state('modals').emailSettings.open).toBeFalsy();
    });
  });
});
