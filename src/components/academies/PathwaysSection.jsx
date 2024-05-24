import { Container, useToggle } from '@openedx/paragon';
import React from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import PathwayModal from '../pathway/PathwayModal';

const PathwaysSection = ({ pathwayData }) => {
  const [isLearnerPathwayModalOpen, openLearnerPathwayModal, onClose] = useToggle(false);
  const handleCardClick = () => {
    openLearnerPathwayModal();
  };
  return (
    <>
      <PathwayModal
        learnerPathwayUuid={pathwayData?.pathwayUuid}
        isOpen={isLearnerPathwayModalOpen}
        onClose={onClose}
      />
      <Container className="pathway-section mb-5">
        <Container size="lg" className="inner-container pr-0">
          <div className="row">
            <div className="col">
              <p className="eyebrow">
                <FormattedMessage
                  id="academy.detail.page.pathway.section.heading"
                  defaultMessage="Pathway"
                  description="Heading for the pathway section on the academy detail page"
                />
              </p>
              <h1 className="pathway-title">{pathwayData.title}</h1>
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    pathwayData.overview,
                    { USE_PROFILES: { html: true } },
                  ),
                }}
                className="pathway-description"
              />
            </div>
            <div className="col d-flex justify-content-center align-items-center">
              <button className="launch-btn" type="button" onClick={handleCardClick}>
                <FormattedMessage
                  id="academy.detail.page.pathway.section.launch.button"
                  defaultMessage="Launch Pathway"
                  description="Button to launch the pathway"
                />
              </button>
            </div>
          </div>
        </Container>
      </Container>
    </>
  );
};

PathwaysSection.propTypes = {
  pathwayData: PropTypes.shape({
    title: PropTypes.string,
    overview: PropTypes.string,
    pathwayUuid: PropTypes.string,
  }).isRequired,
};

export default PathwaysSection;
