import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ProgramProgressSidebar from '../ProgramProgressSidebar';
import { ProgramProgressContext } from '../ProgramProgressContextProvider';
import { getProgramCertImage } from '../data/utils';
import progSampleCertImage from '../images/sample-cert.png';

/* eslint-disable react/prop-types */
function ProgramProgressSideBarWithContext({
  initialProgramProgressContext = {},
}) {
  return (
    <ProgramProgressContext.Provider value={initialProgramProgressContext}>
      <ProgramProgressSidebar />
    </ProgramProgressContext.Provider>
  );
}

const testProgramData = {
  type: 'MicroMasters',
  title: 'Test Program',
  authoringOrganizations: [{
    name: 'Test Author Org',
    certificateLogoImageUrl: 'https://logo.image.url',
  }],
};

const testProgramcertificate = {
  type: 'program',
  title: 'edX Demo Course',
  url: '/certificates/6e57d3cce8e34cfcb60bd8e8b04r07e0',
};

const testUrls = {
  programRecordUrl: null,
};

const TEST_PROGRAM_URL = 'https:example.com';
const testUrlsWithProgramRecord = {
  programRecordUrl: TEST_PROGRAM_URL,
};

const testCourseCertificate = {
  type: 'course',
  title: 'edX Demo Course',
  url: '/certificates/6e57d3cce8e34cfcb60bd8e8b04r07e0',
};

const testCreditPathway = {
  uuid: '86b9701a-61e6-48a2-92eb-70a824521c1f',
  name: 'Demo Credit Pathway',
  description: 'Sample demo credit pathway!',
  destinationUrl: 'http://rit.edu/online/pathways/ritx-design-thinking',
};

const testIndustryPathway = {
  uuid: '86b9701a-61e6-48a2-92eb-70a824521c1f',
  name: 'Demo Industry Pathway',
  description: 'Sample demo industry pathway!',
  destinationUrl: 'http://rit.edu/online/pathways/ritx-design-thinking',
};

describe('<ProgramProgressSideBar />', () => {
  it('renders program certificate if it exists', () => {
    const initialProgramProgressContext = {
      programData: testProgramData,
      certificateData: [testProgramcertificate],
      creditPathways: [],
      industryPathways: [],
      urls: testUrls,
    };
    const programCertImage = getProgramCertImage(testProgramData.type);
    const { container } = render(
      <ProgramProgressSideBarWithContext
        initialProgramProgressContext={initialProgramProgressContext}
      />,
    );
    expect(screen.getByText(`Your ${testProgramData.type} Certificate`)).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', programCertImage);
    expect(container.querySelector('.program-cert-link')).toHaveAttribute(
      'href',
      testProgramcertificate.url,
    );
  });

  it('renders course certificates with correct data', () => {
    const initialProgramProgressContext = {
      programData: testProgramData,
      certificateData: [testProgramcertificate, testCourseCertificate],
      creditPathways: [],
      industryPathways: [],
      urls: testUrls,
    };
    const { container } = render(
      <ProgramProgressSideBarWithContext
        initialProgramProgressContext={initialProgramProgressContext}
      />,
    );
    expect(screen.getByText('Earned Certificates')).toBeInTheDocument();
    expect(screen.getByText(testProgramcertificate.title)).toBeInTheDocument();
    expect(screen.getByTestId('certificate-item')).toHaveClass('certificate');
    const imageElement = container.querySelector('.image-link');
    expect(screen.getByTestId('certificate-item')).toContainElement(imageElement);
    expect(container.querySelector('.sample-cert')).toHaveAttribute('src', progSampleCertImage);
    expect(container.querySelector('.certificate-link')).toHaveAttribute('href', testCourseCertificate.url);
  });

  it('renders program record section correctly', () => {
    const initialProgramProgressContext = {
      programData: testProgramData,
      certificateData: [testProgramcertificate],
      creditPathways: [],
      industryPathways: [],
      urls: testUrlsWithProgramRecord,
    };
    const { container } = render(
      <ProgramProgressSideBarWithContext
        initialProgramProgressContext={initialProgramProgressContext}
      />,
    );
    expect(container.querySelector('.program-record')).toBeInTheDocument();
    expect(container.querySelector('.divider-heading')).toHaveTextContent('Program Record');
    expect(container.querySelector('.program-record-link')).toHaveAttribute('href', TEST_PROGRAM_URL);
  });

  it('renders certificate pathways correctly', () => {
    const initialProgramProgressContext = {
      programData: testProgramData,
      certificateData: [testProgramcertificate],
      creditPathways: [testCreditPathway],
      industryPathways: [],
      urls: testUrls,
    };
    const { container } = render(
      <ProgramProgressSideBarWithContext
        initialProgramProgressContext={initialProgramProgressContext}
      />,
    );
    expect(container.querySelector('.program-credit-pathways')).toBeInTheDocument();
    expect(screen.getByText('Additional Credit Opportunities')).toBeInTheDocument();
    expect(container.querySelector('.pathway-wrapper')).toBeInTheDocument();
    expect(screen.getByText(testCreditPathway.name)).toBeInTheDocument();
    expect(screen.getByText(testCreditPathway.description)).toBeInTheDocument();
    expect(container.querySelector('.pathway-link')).toHaveAttribute('href', testCreditPathway.destinationUrl);
  });

  it('renders industry pathways correctly', () => {
    const initialProgramProgressContext = {
      programData: testProgramData,
      certificateData: [testProgramcertificate],
      creditPathways: [],
      industryPathways: [testIndustryPathway],
      urls: testUrls,
    };
    const { container } = render(
      <ProgramProgressSideBarWithContext
        initialProgramProgressContext={initialProgramProgressContext}
      />,
    );
    expect(container.querySelector('.program-industry-pathways')).toBeInTheDocument();
    expect(screen.getByText('Additional Professional Opportunities')).toBeInTheDocument();
    expect(container.querySelector('.pathway-wrapper')).toBeInTheDocument();
    expect(screen.getByText(testIndustryPathway.name)).toBeInTheDocument();
    expect(screen.getByText(testIndustryPathway.description)).toBeInTheDocument();
    expect(container.querySelector('.pathway-link')).toHaveAttribute('href', testIndustryPathway.destinationUrl);
  });
});
