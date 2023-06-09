import React from 'react';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';

import VerifiedCertPitch from '../VerifiedCertPitch';

describe('VerifiedCertPitch', () => {
  it('renders', () => {
    const tree = renderer
      .create(<VerifiedCertPitch />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
