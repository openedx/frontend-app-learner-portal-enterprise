import {
  Badge, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import './styles/VideoDetailPage.scss';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const BetaBadge = () => (
  <OverlayTrigger
    placement="top"
    overlay={(
      <Tooltip id="video-beta-version-badge" className="video-beta-badge-tooltip">
        <FormattedMessage
          id="enterprise.microlearningVideo.beta.tooltip"
          defaultMessage="<b>Beta version of the Videos.</b> Some features may not be fully functional yet. We appreciate your patience as we fine-tune the experience."
          description="Tooltip message for the beta badge on the video page."
          values={{
            // eslint-disable-next-line react/no-unstable-nested-components
            b: (msg) => <strong>{msg}</strong>,
          }}
        />
      </Tooltip>
    )}
  >
    <Badge variant="info" className="ml-2">
      <FormattedMessage
        id="enterprise.microlearningVideo.betaBadge.text"
        defaultMessage="Beta"
        description="Beta badge for the video page."
      />
    </Badge>
  </OverlayTrigger>
);

export default BetaBadge;
