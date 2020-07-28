import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CourseContextProvider } from '../CourseContextProvider';
import CreatedBy from '../CreatedBy';

import { TEST_OWNER, TEST_STAFF } from './data/constants';

// eslint-disable-next-line react/prop-types
const CreatedByWithCourseContext = ({ initialState = {} }) => (
  <CourseContextProvider initialState={initialState}>
    <CreatedBy />
  </CourseContextProvider>
);

describe('<CreatedBy />', () => {
  const initialState = {
    course: {
      owners: [
        TEST_OWNER,
        {
          ...TEST_OWNER,
          name: 'Partner Name 2',
        },
      ],
    },
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
    userEnrollments: [],
    userEntitlements: [],
    catalog: {},
  };

  test('renders partner info', () => {
    render(<CreatedByWithCourseContext initialState={initialState} />);
    initialState.course.owners.forEach((owner) => {
      expect(screen.queryByText(owner.name)).toBeInTheDocument();
    });
  });

  test('renders staff info', () => {
    render(<CreatedByWithCourseContext initialState={initialState} />);
    initialState.activeCourseRun.staff.forEach((staffMember) => {
      const fullName = `${staffMember.givenName} ${staffMember.familyName}`;
      expect(screen.queryByText(fullName)).toBeInTheDocument();
      expect(screen.queryByText(staffMember.position.title)).toBeInTheDocument();
      expect(screen.queryByText(staffMember.position.organizationName)).toBeInTheDocument();
    });
  });
});
