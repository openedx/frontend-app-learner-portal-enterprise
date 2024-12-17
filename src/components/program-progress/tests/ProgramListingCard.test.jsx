import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import '@testing-library/jest-dom/extend-expect';

import userEvent from '@testing-library/user-event';

import ProgramListingCard from '../ProgramListingCard';
import { useEnterpriseCustomer } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('../../app/data', () => ({
  useEnterpriseCustomer: jest.fn(),
}));

const ProgramListingCardWithContext = ({ programData }) => (
  <IntlProvider locale="en">
    <ProgramListingCard program={programData} />
  </IntlProvider>
);

const dummyProgramData = {
  uuid: 'test-uuid',
  title: 'Test Program Title',
  type: 'MicroMasters',
  bannerImage: {
    large: {
      url: 'www.example.com/large',
      height: 123,
      width: 455,
    },
    medium: {
      url: 'www.example.com/medium',
      height: 123,
      width: 455,
    },
    small: {
      url: 'www.example.com/small',
      height: 123,
      width: 455,
    },
    xSmall: {
      url: 'www.example.com/xSmall',
      height: 123,
      width: 455,
    },
  },
  authoringOrganizations: [
    {
      key: 'test-key',
      logoImageUrl: '/media/organization/logos/shield.png',
    },
  ],
  progress: {
    inProgress: 1,
    completed: 2,
    notStarted: 3,
  },
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<ProgramListingCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });
  it('renders all data for program', () => {
    renderWithRouter(<ProgramListingCardWithContext programData={dummyProgramData} />);
    expect(screen.getByText(dummyProgramData.title)).toBeInTheDocument();
    expect(screen.getByText(dummyProgramData.type)).toBeInTheDocument();
    expect(screen.getByText(dummyProgramData.authoringOrganizations[0].key)).toBeInTheDocument();
    const logoImageNode = screen.getByAltText(dummyProgramData.authoringOrganizations[0].key);
    expect(logoImageNode).toHaveAttribute('src', dummyProgramData.authoringOrganizations[0].logoImageUrl);
    expect(screen.getByText(dummyProgramData.progress.inProgress)).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByText(dummyProgramData.progress.completed)).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText(dummyProgramData.progress.notStarted)).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
  });

  it('renders names of all organizations when more than one', () => {
    const dummyDataWithMultipleOrgs = { ...dummyProgramData };
    dummyDataWithMultipleOrgs.authoringOrganizations.push({
      key: 'test-key2',
      logoImageUrl: '/media/organization/logos/shield.png',
    });
    renderWithRouter(<ProgramListingCardWithContext programData={dummyDataWithMultipleOrgs} />);
    const aggregatedOrganizations = dummyDataWithMultipleOrgs.authoringOrganizations.map(org => org.key).join(', ');
    expect(screen.getByText(aggregatedOrganizations)).toBeInTheDocument();
  });

  it('doesnt render logo of organizations when more than one', () => {
    const dummyDataWithMultipleOrg = { ...dummyProgramData };
    dummyDataWithMultipleOrg.authoringOrganizations.push({
      key: 'test-key2',
      logoImageUrl: '/media/organization/logos/shield.png',
    });
    const { queryByAltText } = renderWithRouter(
      <ProgramListingCardWithContext programData={dummyDataWithMultipleOrg} />,
    );
    const logoImageNode = queryByAltText(dummyProgramData.authoringOrganizations[0].key);
    expect(logoImageNode).toBeNull();
  });

  it('redirects to correct page when clicked', () => {
    const { container } = renderWithRouter(<ProgramListingCardWithContext programData={dummyProgramData} />);
    userEvent.click(container.firstElementChild);
    expect(window.location.pathname).toEqual(`/${mockEnterpriseCustomer.slug}/program/test-uuid/progress`);
  });

  it.each([{
    width: 1450,
    size: 'large',
  },
  {
    width: 1300,
    size: 'large',
  },
  {
    width: 1000,
    size: 'large',
  },
  {
    width: 800,
    size: 'medium',
  },
  {
    width: 600,
    size: 'small',
  },
  {
    width: 500,
    size: 'xSmall',
  }])('tests window size', ({ width, size }) => {
    global.innerWidth = width;
    renderWithRouter(<ProgramListingCardWithContext programData={dummyProgramData} />);
    const imageCapSrc = screen.getByAltText('').src;
    expect(imageCapSrc).toContain(size);
  });
});
