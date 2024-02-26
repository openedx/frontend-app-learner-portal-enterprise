import React, { useContext, useMemo } from 'react';
import { Button } from '@openedx/paragon';
import { v4 as uuidv4 } from 'uuid';
import { ProgramProgressContext } from './ProgramProgressContextProvider';

import ProgramProgressCircle from './ProgramProgressCircle';
import ProgramPathwayOpportunity from './ProgramPathwayOpportunity';
import { getProgramCertImage } from './data/utils';
import progSampleCertImage from './images/sample-cert.png';

const ProgramProgressSideBar = () => {
  const {
    programData, industryPathways, creditPathways, certificateData, urls: { programRecordUrl },
  } = useContext(ProgramProgressContext);
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
          <h2 className="progress-heading certificate-heading"> {`Your ${programData.type} Certificate`}</h2>
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
          <h2 className="course-list-heading">Earned Certificates</h2>
          <ul className="certificate-list">
            {courseCertificates.map((certificate) => (
              <li key={uuidv4()} data-testid="certificate-item" className="certificate">
                <a className="image-link" href={certificate.url} aria-hidden="true" tabIndex="-1">
                  <img src={progSampleCertImage} className="sample-cert" alt="" />
                </a>
                <a className="certificate-link" href={certificate.url}> {certificate.title} </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="program-record">
        <h2 className="divider-heading">Program Record</h2>
        <div className="motivating-section">
          <p className="motivating-message">
            Once you complete one of the program requirements you have a program record.
            This record is marked complete once you meet all program requirements.
            A program record can be used to continue your learning journey and demonstrate your learning to others.
          </p>
        </div>
        { programRecordUrl && (
          <div className="sidebar-button-wrapper">
            <a href={programRecordUrl} className="program-record-link">
              <Button
                variant="outline-primary"
                className="btn sidebar-button"
              >
                View Program Record
              </Button>
            </a>
          </div>
        )}
      </div>
      {creditPathways.length > 0 && (
        <ProgramPathwayOpportunity
          pathways={creditPathways}
          title="Additional Credit Opportunities"
          pathwayClass="program-credit-pathways"
        />
      )}
      {industryPathways.length > 0 && (
        <ProgramPathwayOpportunity
          pathways={industryPathways}
          title="Additional Professional Opportunities"
          pathwayClass="program-industry-pathways"
        />
      )}
    </div>
  );
};

export default ProgramProgressSideBar;
