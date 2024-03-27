import { getConfig } from '@edx/frontend-platform/config';
import { MailtoLink, Hyperlink } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import PropTypes from 'prop-types';
import { SidebarBlock } from '../../layout';
import { getContactEmail } from '../../../utils/common';
import { useEnterpriseCustomer } from '../../app/data';

const SupportInformation = ({ className }) => {
  const config = getConfig();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const intl = useIntl();
  const email = getContactEmail(enterpriseCustomer);

  const hasCareerEngagementNetworkMessaging = (
    enterpriseCustomer.enableCareerEngagementNetworkOnLearnerPortal && enterpriseCustomer.careerEngagementNetworkMessage
  );

  return (
    <>
      {hasCareerEngagementNetworkMessaging && (
        <SidebarBlock>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: enterpriseCustomer.careerEngagementNetworkMessage }} />
        </SidebarBlock>
      )}
      <SidebarBlock
        title={intl.formatMessage({
          id: 'enterprise.dashboard.sidebar.needHelp',
          defaultMessage: 'Need help?',
          description: 'Title for the need help block on the enterprise dashboard sidebar.',
        })}
        titleOptions={{ tag: 'h3' }}
        className={className}
      >
        <p>
          <FormattedMessage
            id="enterprise.dashboard.sidebar.need.help.message"
            defaultMessage="For technical support, visit the <a>edX Help Center</a>."
            description="Text for the need help block on the enterprise dashboard sidebar."
            /* eslint-disable react/no-unstable-nested-components */
            values={{
              a: chunks => (
                <Hyperlink
                  destination={config.LEARNER_SUPPORT_URL}
                  target="_blank"
                >
                  {chunks}
                </Hyperlink>
              ),
            }}
            /* eslint-disable react/no-unstable-nested-components */
          />
        </p>
        <p>
          <FormattedMessage
            id="enterprise.dashboard.sidebar.request.benefits"
            defaultMessage="To request more benefits or specific courses, <a>contact your organization's edX administrator</a>."
            description="Text for requesting more benefits or specific courses in the enterprise dashboard sidebar."
            /* eslint-disable react/no-unstable-nested-components */
            values={{
              a: chunks => (
                email
                  ? <MailtoLink to={email} className="d-inline">{chunks}</MailtoLink>
                  : chunks
              ),
            }}
            /* eslint-disable react/no-unstable-nested-components */
          />
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
