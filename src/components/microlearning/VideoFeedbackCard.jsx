import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card, Icon, IconButton, ActionRow, Form, Input, Button,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ThumbUpOutline, ThumbUp, ThumbDownOffAlt, ThumbDownAlt, Close,
} from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { VIDEO_FEEDBACK_CARD, VIDEO_FEEDBACK_SUBMITTED_LOCALSTORAGE_KEY } from './constants';

const VideoFeedbackCard = ({
  videoId, courseRunKey, enterpriseCustomerUuid, videoUsageKey,
}) => {
  const intl = useIntl();
  const [response, setResponse] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [comments, setComments] = useState('');
  const [showFeedbackCard, setShowFeedbackCard] = useState(true);
  const [showFeedbackSubmittedCard, setShowFeedbackSubmittedCard] = useState(false);
  const feedbackLocalStorageKey = VIDEO_FEEDBACK_SUBMITTED_LOCALSTORAGE_KEY(videoId);

  // On component mount, check if feedback has been previously submitted
  useEffect(() => {
    const feedbackSubmitted = localStorage.getItem(feedbackLocalStorageKey);
    if (feedbackSubmitted === 'true') {
      setShowFeedbackCard(false);
      setShowFeedbackSubmittedCard(true);
    }
  }, [feedbackLocalStorageKey]);

  const handleThumbClick = (feedbackResponse) => {
    setResponse(feedbackResponse);
    if (feedbackResponse) {
      setShowFeedbackCard(false);
      setShowFeedbackSubmittedCard(true);
    }
    sendEnterpriseTrackEvent(
      enterpriseCustomerUuid,
      'edx.ui.enterprise.learner_portal.video.feedback.thumb.submitted',
      {
        videoId,
        courseRunKey,
        video_usage_key: videoUsageKey,
        prompt: VIDEO_FEEDBACK_CARD.prompt,
        response: feedbackResponse,
      },
    );
    localStorage.setItem(feedbackLocalStorageKey, 'true');
  };

  const handleSubmitFeedback = () => {
    sendEnterpriseTrackEvent(
      enterpriseCustomerUuid,
      'edx.ui.enterprise.learner_portal.video.feedback.response.submitted',
      {
        videoId,
        courseRunKey,
        video_usage_key: videoUsageKey,
        prompt: VIDEO_FEEDBACK_CARD.prompt,
        response,
        selectedOptions,
        comments,
      },
    );
    setShowFeedbackSubmittedCard(true);
    setShowFeedbackCard(false);
  };

  return (
    <>
      {showFeedbackCard && (
        <Card>
          <Card.Header
            className="mb-3"
            title={(
              <h4>
                <FormattedMessage
                  id="enterprise.VideoFeedbackCard.prompt"
                  defaultMessage="{prompt}"
                  description="Prompt to ask for feedback"
                  values={{ prompt: VIDEO_FEEDBACK_CARD.prompt }}
                />
              </h4>
            )}
            actions={(
              <ActionRow className="pt-1">
                <IconButton
                  key="dark"
                  src={response === true ? ThumbUp : ThumbUpOutline}
                  iconAs={Icon}
                  onClick={() => handleThumbClick(true)}
                  variant="dark"
                  className="border rounded-circle border-1 border-light-400 p-3 mr-2"
                  aria-label="thumbs up"
                />
                <IconButton
                  key="dark"
                  src={response === false ? ThumbDownAlt : ThumbDownOffAlt}
                  iconAs={Icon}
                  onClick={() => handleThumbClick(false)}
                  variant="dark"
                  className="border rounded-circle border-1 border-light-400 p-3 mr-2"
                  aria-label="thumbs down"
                />
                <div className="border-left border-1 border-light-400" style={{ height: 52, marginTop: -8 }} />
                <IconButton
                  className="ml-3"
                  src={Close}
                  iconAs={Icon}
                  onClick={() => setShowFeedbackCard(false)}
                />
              </ActionRow>
            )}
            size="sm"
          />
          {/* Display additional options when the user selects thumbs down (negative feedback)." */}
          {response === false && (
            <Card.Section>
              <div className="mb-3">
                <FormattedMessage
                  id="enterprise.VideoFeedbackCard.additionalDetailsLabel"
                  defaultMessage="{additionalDetailsLabel}"
                  description="Additional details section title"
                  values={{ additionalDetailsLabel: VIDEO_FEEDBACK_CARD.additionalDetailsLabel }}
                />
              </div>
              <Form.Group className="mb-3">
                {VIDEO_FEEDBACK_CARD.options.map((option) => (
                  <div className="mb-2" key={option}>
                    <Form.Checkbox
                      value={option}
                      onChange={(e) => {
                        const { checked } = e.target;
                        setSelectedOptions((prevOptions) => (checked
                          ? [...prevOptions, option]
                          : prevOptions.filter(opt => opt !== option)));
                      }}
                    >
                      <FormattedMessage
                        id="enterprise.VideoFeedbackCard.additionalDetailsOption"
                        defaultMessage="{additionalDetailsOption}"
                        description="Additional details option for video feedback"
                        values={{ additionalDetailsOption: option }}
                      />
                    </Form.Checkbox>
                  </div>
                ))}
              </Form.Group>
              <Input
                type="text"
                placeholder={
                  intl.formatMessage(
                    {
                      id: 'enterprise.VideoFeedbackCard.additionalCommentsPlaceholder',
                      defaultMessage: '{inputPlaceholder}',
                      description: 'Additional comments placeholder for video feedback',
                    },
                    { inputPlaceholder: VIDEO_FEEDBACK_CARD.inputPlaceholder },
                  )
                }
                className="mb-4"
                onChange={(e) => setComments(e.target.value)}
              />
              <Button
                variant="primary"
                onClick={handleSubmitFeedback}
              >
                <FormattedMessage
                  id="enterprise.VideoFeedbackCard.submitButton"
                  defaultMessage="{submitButtonLabel}"
                  description="Button to submit video feedback"
                  values={{ submitButtonLabel: VIDEO_FEEDBACK_CARD.submitButton }}
                />
              </Button>
            </Card.Section>
          )}
        </Card>
      )}
      {showFeedbackSubmittedCard && (
        <Card>
          <Card.Header
            title={(
              <h4 className="pb-1.5">
                <FormattedMessage
                  id="enterprise.VideoFeedbackCard.thankYouMessage"
                  defaultMessage="{thankYouMessage}"
                  description="Thank you message after submitting feedback"
                  values={{ thankYouMessage: VIDEO_FEEDBACK_CARD.thankYouMessage }}
                />
              </h4>
            )}
            actions={(
              <ActionRow className="pt-1">
                <IconButton
                  className=""
                  src={Close}
                  iconAs={Icon}
                  onClick={() => {
                    setShowFeedbackSubmittedCard(false);
                  }}
                />
              </ActionRow>
            )}
            size="sm"
          />
          <Card.Section>
            <FormattedMessage
              id="enterprise.VideoFeedbackCard.feedbackSentMessage"
              defaultMessage="{feedbackSentMessage}"
              description="Message displayed after user has successfully submitted their feedback"
              values={{ feedbackSentMessage: VIDEO_FEEDBACK_CARD.feedbackSentMessage }}
            />
          </Card.Section>
        </Card>
      )}
    </>
  );
};

VideoFeedbackCard.propTypes = {
  videoId: PropTypes.string.isRequired,
  courseRunKey: PropTypes.string.isRequired,
  enterpriseCustomerUuid: PropTypes.string.isRequired,
  videoUsageKey: PropTypes.string.isRequired,
};

export default VideoFeedbackCard;
