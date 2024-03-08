import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { CourseContextProvider } from '../CourseContextProvider';
import CreatedBy from '../CreatedBy';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';

import { TEST_OWNER, TEST_STAFF } from './data/constants';

const initialSubsidyRequestsState = {
  catalogsForSubsidyRequests: [],
};

const CreatedByWithCourseContext = ({ courseState = {} }) => (
  <IntlProvider locale="en">
    <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
      <CourseContextProvider courseState={courseState}>
        <CreatedBy />
      </CourseContextProvider>
    </SubsidyRequestsContext.Provider>
  </IntlProvider>
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
    courseRecommendations: {},
  };

  test('renders partner info', () => {
    render(<CreatedByWithCourseContext courseState={initialState} />);
    initialState.course.owners.forEach((owner) => {
      expect(screen.queryByText(owner.name)).toBeInTheDocument();
    });
  });

  test('renders staff info', () => {
    render(<CreatedByWithCourseContext courseState={initialState} />);
    initialState.activeCourseRun.staff.forEach((staffMember) => {
      const fullName = `${staffMember.givenName} ${staffMember.familyName}`;
      expect(screen.queryByText(fullName)).toBeInTheDocument();
      expect(screen.queryByText(staffMember.position.title)).toBeInTheDocument();
      expect(screen.queryByText(staffMember.position.organizationName)).toBeInTheDocument();
    });
  });

  test('handles missing partner info', () => {
    const courseState = {
      ...initialState,
      course: {
        ...initialState.course,
        owners: [],
      },
      activeCourseRun: undefined,
    };
    const { container } = render(<CreatedByWithCourseContext courseState={courseState} />);
    expect(container).toBeEmptyDOMElement();
  });
});
