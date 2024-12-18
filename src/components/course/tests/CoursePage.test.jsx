import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import CoursePage from '../CoursePage';
import { useCourseMetadata, useEnterpriseCustomer } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { renderWithRouterProvider } from '../../../utils/tests';

const mockGetActiveCourseRun = jest.fn();

jest.mock('../data/utils', () => ({
  ...jest.requireActual('../data/utils'),
  getActiveCourseRun: () => mockGetActiveCourseRun(),
}));

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: () => ({
    COURSE_TYPE_CONFIG: {
      'executive-education-2u': {
        pathSlug: 'executive-education-2u',
      },
    },
  }),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useCourseMetadata: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const CoursePageWrapper = () => (
  <IntlProvider locale="en">
    <CoursePage />
  </IntlProvider>
);

describe('CoursePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  it.each([
    {
      courseMetadata: null,
    },
    {
      courseMetadata: {
        activeCourseRun: null,
      },
    },
  ])('renders the component with 404 <NotFoundPage />', ({ courseMetadata }) => {
    useCourseMetadata.mockReturnValue({ data: courseMetadata });
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CoursePageWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/edX+DemoX`],
    });
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });

  it('does not render 404 <NotFoundPage />', () => {
    useCourseMetadata.mockReturnValue({
      data: {
        activeCourseRun: {
          key: 'test-course-run-key',
        },
      },
    });
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CoursePageWrapper />,
      // simulate nested route
      children: [{
        index: true,
        element: <div data-testid="course-about" />,
      }],
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/edX+DemoX`],
    });
    expect(screen.queryByTestId('not-found-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('course-about')).toBeInTheDocument();
  });
});
