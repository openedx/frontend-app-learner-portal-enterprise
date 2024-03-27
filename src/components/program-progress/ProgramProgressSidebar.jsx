import { useMemo } from 'react';
import { Button } from '@openedx/paragon';
import { v4 as uuidv4 } from 'uuid';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform/config';

import ProgramProgressCircle from './ProgramProgressCircle';
import ProgramPathwayOpportunity from './ProgramPathwayOpportunity';
import { getProgramCertImage } from './data/utils';
import progSampleCertImage from './images/sample-cert.png';
import { useProgramProgressDetails } from '../app/data';

const ProgramProgressSideBar = () => {
  const {
    data: {
      programData,
      industryPathways,
      creditPathways,
      certificateData,
      urls: { programRecordUrl },
    },
  } = useProgramProgressDetails();
  const { LMS_BASE_URL } = getConfig();
  const courseCertificates = useMemo(
    () => {
      if (certificateData) {
        return certificateData.filter(certificate => certificate.type === 'course');
      }
      return [];
    },
    [certificateData],
  );
  const programCertificate = useMemo(
    () => {
      const certificate = certificateData.find(cert => cert.type === 'program');
      if (certificate) {
        certificate.img = getProgramCertImage(programData.type);
      }

      return certificate;
    },
    [certificateData, programData],
  );
  return (
    <div className="program-sidebar offset-1 col-3">
      {!programCertificate && <ProgramProgressCircle /> }
      {programCertificate && programCertificate.img && (
        <div>
          <h2 className="progress-heading certificate-heading">
            <FormattedMessage
              id="enterprise.dashboard.program.sidebar.your.certificate"
              defaultMessage="Your {certificateType} Certificate"
              description="Label for program certificate on program sidebar"
              values={{
                certificateType: programData.type,
              }}
            />
          </h2>
          <a href={programCertificate.url} className="program-cert-link">
            <img
              src={programCertificate.img}
              className="program-cert"
              alt={`Open the certificate you earned for the ${programCertificate.title}s program.`}
            />
          </a>
        </div>
      )}
      {courseCertificates.length > 0 && (
        <div className="certificate-container">
          <h2 className="course-list-heading">
            <FormattedMessage
              id="enterprise.dashboard.program.sidebar.earned.certificates"
              defaultMessage="Earned Certificates"
              description="Label for earned certificates on program sidebar"
            />
          </h2>
          <ul className="certificate-list">
            {courseCertificates.map((certificate) => {
              const certificatesUrl = `${LMS_BASE_URL}${certificate.url}`;
              return (
                <li key={uuidv4()} data-testid="certificate-item" className="certificate">
                  <a className="image-link" href={certificatesUrl} aria-hidden="true" tabIndex="-1">
                    <img src={progSampleCertImage} className="sample-cert" alt="" />
                  </a>
                  <a className="certificate-link" href={certificatesUrl}> {certificate.title} </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="program-record">
        <h2 className="divider-heading">
          <FormattedMessage
            id="enterprise.dashboard.program.sidebar.program.record"
            defaultMessage="Program Record"
            description="Label for program record on program sidebar"
          />
        </h2>
        <div className="motivating-section">
          <p className="motivating-message">
            <FormattedMessage
              id="enterprise.dashboard.program.sidebar.message"
              defaultMessage="Once you complete one of the program requirements you have a program record. This record is marked complete once you meet all program requirements. A program record can be used to continue your learning journey and demonstrate your learning to others."
              description="Message displayed in the program sidebar for providing information on program completion."
            />
          </p>
        </div>
        {programRecordUrl && (
          <div className="sidebar-button-wrapper">
            <a href={programRecordUrl} className="program-record-link">
              <Button
                variant="outline-primary"
                className="btn sidebar-button"
              >
                <FormattedMessage
                  id="enterprise.dashboard.program.sidebar.view.program.record"
                  defaultMessage="View Program Record"
                  description="Button text for viewing the program record on program sidebar"
                />
              </Button>
            </a>
          </div>
        )}
      </div>
      {creditPathways.length > 0 && (
        <ProgramPathwayOpportunity
          pathways={creditPathways}
          title={(
            <FormattedMessage
              id="enterprise.dashboard.program.sidebar.credit.opportunities"
              defaultMessage="Additional Credit Opportunities"
              description="Title for additional credit opportunities on program sidebar"
            />
          )}
          pathwayClass="program-credit-pathways"
        />
      )}
      {industryPathways.length > 0 && (
        <ProgramPathwayOpportunity
          pathways={industryPathways}
          title={(
            <FormattedMessage
              id="program.sidebar.professional.opportunities"
              defaultMessage="Additional Professional Opportunities"
              description="Title for additional professional opportunities on program sidebar"
            />
          )}
          pathwayClass="program-industry-pathways"
        />
      )}
    </div>
  );
};

export default ProgramProgressSideBar;
