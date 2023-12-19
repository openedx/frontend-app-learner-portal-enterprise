import { Helmet } from "react-helmet";
import {
  SKILL_BUILDER_TITLE,
  text,
  webTechBootCamps,
  closeModalText,
} from "./constants";
import SkillQuizForm from "./SkillsQuizForm";
import "./styles/index.scss";
import SkillsQuizHeader from "./SkillsQuizHeader";
import ProgramCard from "./ProgramCard";
import { AppContext } from "@edx/frontend-platform/react";
import PropTypes from "prop-types";
import { ModalDialog, useToggle, ActionRow, Button } from "@edx/paragon";
import { useHistory } from "react-router-dom";
import { useContext } from "react";
import headerImage from "../skills-quiz/images/headerImage.png";

const SkillsQuizV2 = ({ isStyleAutoSuggest }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const history = useHistory();
  const [isOpen, open, close] = useToggle(false);

  const handleExit = () => {
    history.push(`/${enterpriseConfig.slug}/search`);
  };

  const TITLE = `edx - ${SKILL_BUILDER_TITLE}`;
  return (
    <>
      <Helmet title={TITLE} />
      <ModalDialog
        className={"modal-small"}
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
          <ActionRow className={"mt-4.5"}>
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
        className="bg-light-200 skills-quiz-modal"
        isOpen
        onClose={open}
      >
        <ModalDialog.Hero className="md-img">
          <ModalDialog.Hero.Background backgroundSrc={headerImage} />
          <ModalDialog.Hero.Content style={{ maxWidth: "15rem" }}>
            <SkillsQuizHeader />
          </ModalDialog.Hero.Content>
        </ModalDialog.Hero>
        <ModalDialog.Body>
          <div className="page-body">
            <div className="text">
              <p className="text-gray-600 text-justify">{text}</p>
            </div>
            <SkillQuizForm isStyleAutoSuggest={isStyleAutoSuggest} />
            <div className="cards-display">
              <p className="pgn__form-label">
                Boot camps for a web technology specialist
              </p>
              <div className="card-container">
                {webTechBootCamps.map((bootcamp) => (
                  <ProgramCard {...bootcamp} />
                ))}
              </div>
            </div>
          </div>
        </ModalDialog.Body>
      </ModalDialog>
    </>
  );
};

SkillsQuizV2.propTypes = {
  isStyleAutoSuggest: PropTypes.bool,
};

export default SkillsQuizV2;
