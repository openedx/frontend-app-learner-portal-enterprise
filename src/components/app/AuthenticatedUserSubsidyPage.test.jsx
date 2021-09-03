import React from 'react';
import { shallow } from 'enzyme';
import '@testing-library/jest-dom/extend-expect';

import AuthenticatedUserSubsidyPage from './AuthenticatedUserSubsidyPage';
import AuthenticatedPage from './AuthenticatedPage';
import { ActivateLicenseAlert, UserSubsidy } from '../enterprise-user-subsidy';

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
    expect(wrapper.find(AuthenticatedPage)).toBeTruthy();
  });
  it('renders <UserSubsidy>', () => {
    expect(wrapper.find(UserSubsidy)).toBeTruthy();
  });
  it('renders <ActivateLicenseAlert>', () => {
    expect(wrapper.find(ActivateLicenseAlert)).toBeTruthy();
  });
  it('renders children', () => {
    expect(wrapper.find('div.did-i-render')).toBeTruthy();
  });
});
