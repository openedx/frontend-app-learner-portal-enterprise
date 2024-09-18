export const VIDEO_FEEDBACK_CARD = {
  prompt: 'Was this page helpful?',
  additionalDetailsLabel: 'Any additional details? Select all that apply:',
  options: [
    'Videos are hard to find or navigate',
    'Video wasn’t relevant',
    'Video was low quality or confusing',
  ],
  inputPlaceholder: 'Type comments (optional)',
  submitButton: 'Submit feedback',
  thankYouMessage: 'Thank you!',
  feedbackSentMessage: 'Your feedback has been sent to the edX research team!',
};

export const VIDEO_FEEDBACK_SUBMITTED_LOCALSTORAGE_KEY = (videoId) => (`${videoId}-feedbackSubmitted`);
