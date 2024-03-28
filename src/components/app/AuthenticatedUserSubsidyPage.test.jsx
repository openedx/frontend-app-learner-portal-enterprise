import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import '@testing-library/jest-dom/extend-expect';

import AuthenticatedUserSubsidyPage from './AuthenticatedUserSubsidyPage';
import AuthenticatedPage from './AuthenticatedPage';
import { AutoActivateLicense, UserSubsidy } from '../enterprise-user-subsidy';

describe('<AuthenticatedUserSubsidyPage />', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(
      <AuthenticatedUserSubsidyPage>
        <div className="did-i-render" />
      </AuthenticatedUserSubsidyPage>,
    );
  });
  it('renders <AuthenticatedPage>', () => {
    expect(wrapper.instance.findByType(AuthenticatedPage)).toBeTruthy();
  });
  it('renders <UserSubsidy>', () => {
    expect(wrapper.instance.findByType(UserSubsidy)).toBeTruthy();
  });
  it('renders <AutoActivateLicense>', () => {
    expect(wrapper.instance.findByType(AutoActivateLicense)).toBeTruthy();
  });
  it('renders children', () => {
    expect(wrapper.instance.findByType('div.did-i-render')).toBeTruthy();
  });
});
