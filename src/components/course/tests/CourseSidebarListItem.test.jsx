import React from 'react';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import { faClock } from '@fortawesome/free-regular-svg-icons';

import CourseSidebarListItem from '../CourseSidebarListItem';

describe('CourseSidebarListItem', () => {
  it('renders', () => {
    const props = {
      icon: faClock,
      label: 'Test label',
      content: <div data-testid="test-content" />,
    };
    const tree = renderer
      .create(<CourseSidebarListItem {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
