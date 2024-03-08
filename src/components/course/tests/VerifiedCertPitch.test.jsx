import React from 'react';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import VerifiedCertPitch from '../VerifiedCertPitch';

describe('VerifiedCertPitch', () => {
  it('renders', () => {
    const tree = renderer
      .create(<IntlProvider locale="en"><VerifiedCertPitch /></IntlProvider>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
