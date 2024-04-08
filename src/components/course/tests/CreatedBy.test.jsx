import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import CreatedBy from '../CreatedBy';

import { TEST_OWNER, TEST_STAFF } from './data/constants';
import { useCourseMetadata } from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useCourseMetadata: jest.fn(),
}));

const CreatedByWrapper = () => (
  <IntlProvider locale="en">
    <CreatedBy />
  </IntlProvider>
);

const mockCourseMetadata = {
  owners: [
    TEST_OWNER,
    {
      ...TEST_OWNER,
      name: 'Partner Name 2',
    },
  ],
  activeCourseRun: {
    staff: [
      TEST_STAFF,
      {
        ...TEST_STAFF,
        givenName: 'Another',
        familyName: 'User',
        position: {
          title: 'Test Title 2',
          organizationName: 'MITx',
        },
      },
    ],
  },
};

describe('<CreatedBy />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
  });

  test('renders partner info', () => {
    render(<CreatedByWrapper />);
    mockCourseMetadata.owners.forEach((owner) => {
      expect(screen.queryByText(owner.name)).toBeInTheDocument();
    });
  });

  test('renders staff info', () => {
    render(<CreatedByWrapper />);
    mockCourseMetadata.activeCourseRun.staff.forEach((staffMember) => {
      const fullName = `${staffMember.givenName} ${staffMember.familyName}`;
      expect(screen.queryByText(fullName)).toBeInTheDocument();
      expect(screen.queryByText(staffMember.position.title)).toBeInTheDocument();
      expect(screen.queryByText(staffMember.position.organizationName)).toBeInTheDocument();
    });
  });

  test('handles missing partner info', () => {
    const courseState = {
      ...mockCourseMetadata,
      owners: [],
      activeCourseRun: undefined,
    };
    useCourseMetadata.mockReturnValue({ data: courseState });
    const { container } = render(<CreatedByWrapper />);
    expect(container).toBeEmptyDOMElement();
  });
});
