import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import PathwayRequirements from '../PathwayRequirements';
import '@testing-library/jest-dom';
import { useEnterpriseCustomer, useLearnerPathwayProgressData } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useLearnerPathwayProgressData: jest.fn(),
}));

const mockLearnerPathwayProgress = {
  steps: [
    {
      courses: [
        {
          key: 'course1',
          courseRuns: [{ key: 'course-run1' }],
          title: 'Course 1',
          shortDescription: 'Short description 1',
          cardImageUrl: 'image1.jpg',
          contentType: 'course',
        },
      ],
      programs: [
        {
          uuid: 'program1',
          title: 'Program 1',
          shortDescription: 'Short description 1',
          cardImageUrl: 'image1.jpg',
          contentType: 'program',
          courses: [
            {
              key: 'course2',
              courseRuns: [{ key: 'course-run2' }],
            },
          ],
          status: 'NOT_STARTED',
          enterprises: '["enterprise1"]',
        },
      ],
    },
    {
      courses: [
        {
          key: 'course3',
          courseRuns: [{ key: 'course-run3' }],
          title: 'Course 3',
          shortDescription: 'Short description 3',
          cardImageUrl: 'image3.jpg',
          contentType: 'course',
        },
      ],
      programs: [],
    },
  ],
};

const PathwayRequirementsWrapper = () => (
  <IntlProvider locale="en">
    <PathwayRequirements />
  </IntlProvider>
);

describe('PathwayRequirements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: enterpriseCustomerFactory() });
    useLearnerPathwayProgressData.mockReturnValue({ data: { learnerPathwayProgress: mockLearnerPathwayProgress } });
  });
  it('renders pathway requirements correctly', () => {
    render(<PathwayRequirementsWrapper />);

    expect(screen.getByText('Pathway Requirements:')).toBeInTheDocument();
    expect(screen.getByText('Course 1')).toBeInTheDocument();
    expect(screen.getByText('Program 1')).toBeInTheDocument();
    expect(screen.getByText('Course 3')).toBeInTheDocument();
  });

  it('renders pathway steps correctly', () => {
    render(<PathwayRequirementsWrapper />);

    expect(screen.getByText('Requirement 1: Choose any 2 of the following')).toBeInTheDocument();
  });
});
