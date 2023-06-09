import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  viewCourse: {
    id: 'courseRunActions.viewCourse',
    defaultMessage: 'View course',
    description: 'Label for button when learner is already enrolled.',
  },
  upgrading: {
    id: 'courseRunActions.upgrading',
    defaultMessage: 'Upgrading...',
    description: 'Label for button when learner enrollment is upgrading from audit to paid mode.',
  },
  upgraded: {
    id: 'courseRunActions.upgraded',
    defaultMessage: 'Upgraded',
    description: 'Label for button when learner enrollment successfully upgrades from audit to paid mode.',
  },
});

export default messages;
