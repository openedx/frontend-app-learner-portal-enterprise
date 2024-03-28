import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { MemoryRouter } from 'react-router-dom';
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
    render(<MemoryRouter initialEntries={['/']}><CoursePageRoutes /></MemoryRouter>);
    expect(screen.getByTestId('course-about')).toBeInTheDocument();
  });

  it('renders ExternalCourseEnrollment route', () => {
    render(<MemoryRouter initialEntries={['/enroll/course-v1:bin+bar+baz']}><CoursePageRoutes /></MemoryRouter>);
    expect(screen.getByTestId('external-course-enrollment')).toBeInTheDocument();
  });

  it('renders ExternalCourseEnrollmentConfirmation route', () => {
    render(<MemoryRouter initialEntries={['/enroll/course-v1:bin+bar+baz/complete']}><CoursePageRoutes /></MemoryRouter>);
    expect(screen.getByTestId('external-course-enrollment-confirmation')).toBeInTheDocument();
  });
});
