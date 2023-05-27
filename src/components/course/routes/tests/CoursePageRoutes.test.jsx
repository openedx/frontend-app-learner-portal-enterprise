import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import CoursePageRoutes from '../CoursePageRoutes';

jest.mock('../CourseAbout', () => jest.fn(() => (
  <div data-testid="course-about" />
)));

jest.mock('../ExternalCourseEnrollment', () => jest.fn(() => (
  <div data-testid="external-course-enrollment" />
)));

jest.mock('../ExternalCourseEnrollmentConfirmation', () => jest.fn(() => (
  <div data-testid="external-course-enrollment-confirmation" />
)));

describe('CoursePageRoutes', () => {
  it('renders CourseAbout route', () => {
    renderWithRouter(<CoursePageRoutes />);
    expect(screen.getByTestId('course-about')).toBeInTheDocument();
  });

  it('renders ExternalCourseEnrollment route', () => {
    renderWithRouter(
      <CoursePageRoutes />,
      { route: '/enroll' },
    );
    expect(screen.getByTestId('external-course-enrollment')).toBeInTheDocument();
  });

  it('renders ExternalCourseEnrollmentConfirmation route', () => {
    renderWithRouter(
      <CoursePageRoutes />,
      { route: '/enroll/complete' },
    );
    expect(screen.getByTestId('external-course-enrollment-confirmation')).toBeInTheDocument();
  });
});