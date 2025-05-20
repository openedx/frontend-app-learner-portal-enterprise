import { screen, render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useMediaQuery } from '@openedx/paragon';
import useBFF from '../../app/data/hooks/useBFF';
import BrowseAndRequestCard from '../BrowseAndRequestAlert';

jest.mock('../../app/data/hooks/useBFF');
jest.mock('@openedx/paragon', () => {
  const original = jest.requireActual('@openedx/paragon');
  return {
    ...original,
    useMediaQuery: jest.fn(),
  };
});
jest.mock('../../app/data', () => ({
  queryDefaultEmptyFallback: jest.fn().mockReturnValue({}),
}));

describe('BrowseAndRequestCard', () => {
  const mockData = {
    hasBnrEnabledPolicy: true,
    enterpriseCustomer: {
      slug: 'test-enterprise',
    },
  };

  beforeEach(() => {
    useMediaQuery.mockReturnValue(false); // default to desktop view
    useBFF.mockReturnValue({ data: mockData });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => render(
    <IntlProvider locale="en">
      <MemoryRouter>
        <BrowseAndRequestCard />
      </MemoryRouter>
    </IntlProvider>,
  );

  it('renders the card when hasBnrEnabledPolicy is true', () => {
    renderComponent();

    expect(screen.getByText('Start your learning journey')).toBeTruthy();
    expect(screen.getByText(/You can browse your organization's catalog/)).toBeTruthy();
    expect(screen.getByText('Dismiss')).toBeTruthy();
    expect(screen.getByText('Find a course')).toBeTruthy();
    expect(screen.getByAltText('Person reading a book')).toBeTruthy();
  });

  it('does not render the card when hasBnrEnabledPolicy is false', () => {
    useBFF.mockReturnValue({
      data: { ...mockData, hasBnrEnabledPolicy: false },
    });

    renderComponent();

    expect(screen.queryByText('Start your learning journey')).toBeNull();
  });

  it('does not render after dismiss button is clicked', () => {
    renderComponent();

    const dismissButton = screen.getByText('Dismiss');
    fireEvent.click(dismissButton);

    expect(screen.queryByText('Start your learning journey')).toBeNull();
  });

  it('links to the correct search page', () => {
    renderComponent();

    const findCourseButton = screen.getByText('Find a course');
    expect(findCourseButton.getAttribute('href')).toBe('/test-enterprise/search');
  });

  it('applies correct styling to buttons', () => {
    renderComponent();

    const dismissButton = screen.getByText('Dismiss');
    const findCourseButton = screen.getByText('Find a course');

    expect(dismissButton.className).toContain('btn-tertiary');
    expect(dismissButton.className).toContain('btn-sm');

    expect(findCourseButton.className).toContain('btn-brand-primary');
    expect(findCourseButton.className).toContain('d-md-inline-block');
  });
});
