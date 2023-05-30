import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ResponsiveContext, breakpoints } from '@edx/paragon';

import CourseAbout from '../CourseAbout';
import { CourseContext } from '../../CourseContextProvider';

jest.mock('../../course-header/CourseHeader', () => jest.fn(() => (
  <div data-testid="course-header" />
)));

jest.mock('../../../layout', () => ({
  ...jest.requireActual('../../../layout'),
  MainContent: jest.fn(({ children }) => (
    <div data-testid="main-content">{children}</div>
  )),
  Sidebar: jest.fn(({ children }) => (
    <div data-testid="sidebar">{children}</div>
  )),
}));

jest.mock('../../CourseMainContent', () => jest.fn(() => (
  <div data-testid="course-main-content" />
)));

jest.mock('../../CourseSidebar', () => jest.fn(() => (
  <div data-testid="course-sidebar" />
)));

jest.mock('../../CourseRecommendations', () => jest.fn(() => (
  <div data-testid="course-recommendations" />
)));

const baseCourseContextValue = { canOnlyViewHighlightSets: false };

const CourseAboutWrapper = ({
  responsiveContextValue = { width: breakpoints.extraLarge.minWidth },
  courseContextValue = baseCourseContextValue,
}) => (
  <ResponsiveContext.Provider value={responsiveContextValue}>
    <CourseContext.Provider value={courseContextValue}>
      <CourseAbout />
    </CourseContext.Provider>
  </ResponsiveContext.Provider>
);

describe('CourseAbout', () => {
  it('renders', () => {
    render(<CourseAboutWrapper />);
    expect(screen.getByTestId('course-header')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByTestId('course-main-content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('course-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('course-recommendations')).toBeInTheDocument();
  });

  it('renders with canOnlyViewHighlightSets=true', () => {
    const courseContextValue = { canOnlyViewHighlightSets: true };
    render(<CourseAboutWrapper courseContextValue={courseContextValue} />);
    expect(screen.getByTestId('course-header')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByTestId('course-main-content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('course-sidebar')).toBeInTheDocument();
    expect(screen.queryByTestId('course-recommendations')).not.toBeInTheDocument();
  });

  it('renders without sidebar is screen is below breakpointslarge.minWidth', () => {
    render(<CourseAboutWrapper responsiveContextValue={{ width: breakpoints.small.minWidth }} />);
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('course-sidebar')).not.toBeInTheDocument();
  });
});
