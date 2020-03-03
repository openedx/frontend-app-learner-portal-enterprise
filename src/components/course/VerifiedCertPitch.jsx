import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoad, faRocket } from '@fortawesome/free-solid-svg-icons';

export default function VerifiedCertPitch() {
  return (
    <div className="mb-5">
      <h3 className="mb-4">
        Pursue a Verified Certificate to highlight the knowledge and skills you gain
      </h3>
      <ul className="pl-0 mb-0" style={{ listStyleType: 'none' }}>
        <li className="d-flex mb-4">
          <div
            className="d-flex bg-primary p-2 align-items-center justify-content-center mr-3"
            style={{ borderRadius: '50%', height: 44, width: 44 }}
          >
            <FontAwesomeIcon className="text-white" icon={faRocket} />
          </div>
          <div>
            <h4 className="h5">Official and Verified</h4>
            <span>
              Receive an instructor-signed certificate with the institution&apos;s
              logo to verify your achievement.
            </span>
          </div>
        </li>
        <li className="d-flex mb-4">
          <div
            className="d-flex bg-primary p-2 align-items-center justify-content-center mr-3"
            style={{ borderRadius: '50%', height: 44, width: 44 }}
          >
            <FontAwesomeIcon className="text-white" icon={faRoad} />
          </div>
          <div>
            <h4 className="h5">Easily Shareable</h4>
            <span>
              Add the certificate to your CV or resume, or post it
              directly on LinkedIn.
            </span>
          </div>
        </li>
      </ul>
    </div>
  );
}
