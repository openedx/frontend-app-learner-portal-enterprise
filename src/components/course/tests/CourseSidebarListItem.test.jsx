import React from 'react';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import { Person } from '@openedx/paragon/icons';

import CourseSidebarListItem from '../CourseSidebarListItem';

describe('CourseSidebarListItem', () => {
  it('renders', () => {
    const props = {
      icon: Person,
      label: 'Test label',
      content: <div data-testid="test-content" />,
    };
    const tree = renderer
      .create(<CourseSidebarListItem {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
