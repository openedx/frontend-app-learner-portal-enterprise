import { Helmet } from 'react-helmet';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ModalDialog, useToggle, ActionRow, Button,
} from '@openedx/paragon';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import SkillsQuizHeader from './SkillsQuizHeader';
import SkillQuizForm from './SkillsQuizForm';
import headerImage from '../skills-quiz/images/headerImage.png';
import { useEnterpriseCustomer } from '../app/data';

const SkillsQuizV2 = ({ isStyleAutoSuggest }) => {
  const intl = useIntl();
  const { authenticatedUser: { userId } } = useContext(AppContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const navigate = useNavigate();
  const [isOpen, open, close] = useToggle(false);

  const handleExit = () => {
    navigate(`/${enterpriseCustomer.slug}/search`);
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.skills_quiz.done.clicked',
      { userId, enterprise: enterpriseCustomer.slug },
    );
  };

  useEffect(() => {
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.skills_quiz.started',
      { userId, enterprise: enterpriseCustomer.slug },
    );
  }, [enterpriseCustomer.slug, enterpriseCustomer.uuid, userId]);

  const TITLE = intl.formatMessage({
    id: 'enterprise.skills.quiz.v2.skills.builder.title',
    defaultMessage: 'edx - Skill Builder',
    description: 'Skills builder title on skills quiz v2 page',
  });

  return (
    <>
      <Helmet title={TITLE} />
      <ModalDialog
        className="modal-small"
        title="Close Dialog"
        isOpen={isOpen}
        onClose={close}
        size="sm"
        hasCloseButton={false}
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            <FormattedMessage
              id="enterprise.skills.quiz.v2.exit.skills.builder.label"
              defaultMessage="Exit Skill Builder?"
              description="Label to prompt user to exit skills builder on the skills quiz v2 page."
            />
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <p className="text-justify">
            <FormattedMessage
              id="enterprise.skills.quiz.v2.close.modal.text"
              defaultMessage="Learners who enroll in courses that align with their career goals are more likely to complete the course"
              description="Skills quiz modal closing text on the skills quiz v2 page."
            />
          </p>
          <ActionRow className="mt-4.5">
            <Button variant="tertiary" onClick={close}>
              <FormattedMessage
                id="enterprise.skills.quiz.v2.back.to.skills.builder.button.label"
                defaultMessage="Back to Skill Builder"
                description="Label for button that takes the user back to skills builder on the skills quiz v2 page."
              />
            </Button>
            <Button variant="primary" onClick={() => handleExit()}>
              <FormattedMessage
                id="enterprise.skills.quiz.v2.exit.button.label"
                defaultMessage="Exit"
                description="Label for exit button on the skills quiz v2 page."
              />
            </Button>
          </ActionRow>
        </ModalDialog.Body>
      </ModalDialog>

      <ModalDialog
        title="Skills Quiz"
        size="fullscreen"
        className="bg-light-200 skills-quiz-modal skills-quiz-v2"
        isOpen
        onClose={open}
      >
        <ModalDialog.Hero className="md-img">
          <ModalDialog.Hero.Background backgroundSrc={headerImage} />
          <ModalDialog.Hero.Content style={{ maxWidth: '15rem' }}>
            <SkillsQuizHeader />
          </ModalDialog.Hero.Content>
        </ModalDialog.Hero>
        <ModalDialog.Body>
          <div className="page-body">
            <div className="text">
              <p className="text-gray-600 text-justify">
                <FormattedMessage
                  id="enterprise.skills.quiz.v2.skills.builder.introductory.text"
                  defaultMessage="We combine the educational expertise with labor market data to help you reach your learning and professional goals. Whether you are looking to grow in your career, change careers, or just learn new skills, this tool can help you find a relevant course. Your role selection and recommendations are private and are not visible to your edX administrator"
                  description="Skills introductory text on skills quiz v2 page"
                />
              </p>
            </div>
            <SkillQuizForm isStyleAutoSuggest={isStyleAutoSuggest} />
          </div>
        </ModalDialog.Body>
      </ModalDialog>
    </>
  );
};

SkillsQuizV2.propTypes = {
  isStyleAutoSuggest: PropTypes.bool,
};

SkillsQuizV2.defaultProps = {
  isStyleAutoSuggest: false,
};

export default SkillsQuizV2;
