import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import { MailtoLink, Hyperlink } from '@openedx/paragon';

import PropTypes from 'prop-types';
import { SidebarBlock } from '../../layout';
import { CONTACT_HELP_EMAIL_MESSAGE, NEED_HELP_BLOCK_TITLE } from './data/constants';
import { getContactEmail } from '../../../utils/common';

const SupportInformation = ({ className }) => {
  const config = getConfig();
  const {
    enterpriseConfig,
    enterpriseConfig: {
      careerEngagementNetworkMessage,
      enableCareerEngagementNetworkOnLearnerPortal,
    },
  } = useContext(AppContext);

  const renderContactHelpText = () => {
    const message = CONTACT_HELP_EMAIL_MESSAGE;
    const email = getContactEmail(enterpriseConfig);
    if (email) {
      return (
        <MailtoLink to={email}>
          {message}
        </MailtoLink>
      );
    }

    return message;
  };

  return (
    <>
      {enableCareerEngagementNetworkOnLearnerPortal && (
        <SidebarBlock>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: careerEngagementNetworkMessage }} />
        </SidebarBlock>
      )}
      <SidebarBlock
        title={NEED_HELP_BLOCK_TITLE}
        titleOptions={{ tag: 'h3' }}
        className={className}
      >
        <p>
          For technical support, visit the{' '}
          <Hyperlink
            destination={config.LEARNER_SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            edX Help Center
          </Hyperlink>.
        </p>
        <p>
          To request more benefits or specific courses, {renderContactHelpText()}.
        </p>
      </SidebarBlock>
    </>
  );
};

SupportInformation.propTypes = {
  className: PropTypes.string,
};

SupportInformation.defaultProps = {
  className: undefined,
};

export default SupportInformation;
