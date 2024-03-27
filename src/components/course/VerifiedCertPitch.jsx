import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
import { ContentPasteGo, RocketLaunch } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import './styles/VerifiedCertPitch.scss';

const VerifiedCertPitchIcon = ({ icon }) => (
  <div className="icon d-flex bg-info mr-3 p-2 align-items-center justify-content-center">
    <Icon className="text-white" src={icon} />
  </div>
);

VerifiedCertPitchIcon.propTypes = {
  icon: PropTypes.elementType.isRequired,
};

const VerifiedCertPitch = () => (
  <div className="verified-cert-pitch mb-5">
    <h3 className="mb-4">
      <FormattedMessage
        id="enterprise.course.about.course.sidebar.verified.cert.pitch"
        defaultMessage="Pursue a Verified Certificate to highlight the knowledge and skills you gain"
        description="Heading for the section that pitches the verified certificate to the user and tells them about its benefits"
      />
    </h3>
    <ul className="pl-0 mb-0 list-unstyled">
      <li className="d-flex mb-4">
        <VerifiedCertPitchIcon icon={RocketLaunch} />
        <div>
          <h4>
            <FormattedMessage
              id="enterprise.course.about.course.sidebar.verified.cert.official"
              defaultMessage="Official and Verified"
              description="Label for the section that indicate the verified certificate is official and verified"
            />
          </h4>
          <span>
            <FormattedMessage
              id="enterprise.course.about.course.sidebar.verified.cert.official.desc"
              defaultMessage="Receive an instructor-signed certificate with the institution's logo to verify your achievement."
              description="Description that tells the verified certificate will have the institution's logo and instructor's signature"
            />
          </span>
        </div>
      </li>
      <li className="d-flex mb-4">
        <VerifiedCertPitchIcon icon={ContentPasteGo} />
        <div>
          <h4>
            <FormattedMessage
              id="enterprise.course.about.course.sidebar.verified.cert.shareable"
              defaultMessage="Easily Shareable"
              description="Label for the section that indicate the verified certificate is easily shareable on social media"
            />
          </h4>
          <span>
            <FormattedMessage
              id="enterprise.course.about.course.sidebar.verified.cert.shareable.desc"
              defaultMessage="Add the certificate to your CV or resume, or post it directly on LinkedIn."
              description="Description that tells where you can share the verified certificate easily"
            />
          </span>
        </div>
      </li>
    </ul>
  </div>
);

export default VerifiedCertPitch;
