import { Helmet } from 'react-helmet';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import PropTypes from 'prop-types';
import {
  ModalDialog, useToggle, ActionRow, Button,
} from '@edx/paragon';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import {
  SKILL_BUILDER_TITLE,
  text,
  closeModalText,
} from './constants';
import SkillsQuizHeader from './SkillsQuizHeader';
import SkillQuizForm from './SkillsQuizForm';
import headerImage from '../skills-quiz/images/headerImage.png';

const SkillsQuizV2 = ({ isStyleAutoSuggest }) => {
  const { enterpriseConfig, authenticatedUser: { userId } } = useContext(AppContext);
  const navigate = useNavigate();
  const [isOpen, open, close] = useToggle(false);

  const handleExit = () => {
    navigate(`/${enterpriseConfig.slug}/search`);
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
      'edx.ui.enterprise.learner_portal.skills_quiz.done.clicked',
      { userId, enterprise: enterpriseConfig.slug },
    );
  };

  useEffect(() => {
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
      'edx.ui.enterprise.learner_portal.skills_quiz.started',
      { userId, enterprise: enterpriseConfig.slug },
    );
  }, [enterpriseConfig.slug, enterpriseConfig.uuid, userId]);

  const TITLE = `edx - ${SKILL_BUILDER_TITLE}`;
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
          <ModalDialog.Title>Exit Skill Builder?</ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <p className="text-justify">{closeModalText}</p>
          <ActionRow className="mt-4.5">
            <Button variant="tertiary" onClick={close}>
              Back to Skill Builder
            </Button>
            <Button variant="primary" onClick={() => handleExit()}>
              Exit
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
              <p className="text-gray-600 text-justify">{text}</p>
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
