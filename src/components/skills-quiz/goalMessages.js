import { defineMessages } from '@edx/frontend-platform/i18n';

const goalMessages = defineMessages({
  selectGoal: {
    id: 'enterprise.skills.goal.default',
    defaultMessage: 'Select a goal',
    description: 'Default dropdown value for goal selection in the skills quiz.',
  },
  changeCareers: {
    id: 'enterprise.skills.goal.changeCareers',
    defaultMessage: 'I want to change careers',
    description: 'Goal option for changing careers.',
  },
  getPromoted: {
    id: 'enterprise.skills.goal.getPromoted',
    defaultMessage: 'I want to get promoted',
    description: 'Goal option for getting a promotion.',
  },
  improveCurrentRole: {
    id: 'enterprise.skills.goal.improveCurrentRole',
    defaultMessage: 'I want to improve at my current role',
    description: 'Goal option for improving in current role.',
  },
  other: {
    id: 'enterprise.skills.goal.other',
    defaultMessage: 'Other',
    description: 'Goal option for other responses.',
  },
});

export default goalMessages;
