import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, Row, useToggle, TransitionReplace, Icon,
} from '@edx/paragon';
import { Edit } from '@edx/paragon/icons';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useLearnerSkillLevels } from './data/hooks';
import { LoadingSpinner } from '../loading-spinner';
import SpiderChart from './SpiderChart';
import CategoryCard from './CategoryCard';
import SearchJobRole from './SearchJobRole';

const editIcon = () => (
  <Icon src={Edit} className="edit-job-role-icon" screenReaderText="Edit Role" />
);

const VisualizeCareer = ({ jobId, submitClickHandler }) => {
  const { enterpriseConfig: { uuid: enterpriseId }, authenticatedUser: { username } } = useContext(AppContext);
  const [showInstructions, , , toggleShowInstructions] = useToggle(false);
  const [isEditable, setIsEditable] = useState(false);

  const [learnerSkillLevels, learnerSkillLevelsFetchError, isLoading] = useLearnerSkillLevels(jobId);

  const editOnClickHandler = () => {
    setIsEditable(true);
    sendEnterpriseTrackEvent(
      username,
      enterpriseId,
      'edx.ui.enterprise.learner_portal.career_tab.edit_job_button.clicked',
    );
  };

  const onSaveRole = (resp) => {
    submitClickHandler(resp);
    setIsEditable(false);
  };

  const onCancelRole = () => {
    setIsEditable(false);
  };

  if (learnerSkillLevelsFetchError) {
    return <ErrorPage status={learnerSkillLevelsFetchError.status} />;
  }

  if (!learnerSkillLevels || isLoading) {
    return (
      <div className="py-5">
        <LoadingSpinner data-testid="loading-spinner" screenReaderText="Visualize Career Tab" />
      </div>
    );
  }

  const { skillCategories } = learnerSkillLevels;

  return (
    <div className="py-5 row">
      <div className="col-xs-10 col-lg-6">
        <TransitionReplace className="mb-3">
          {!isEditable ? (
            <div key="edit-job-button">
              <ActionRow>
                <p>Desired Role</p>
                <ActionRow.Spacer />
                <Button variant="link" iconBefore={editIcon} onClick={editOnClickHandler}>Edit</Button>
              </ActionRow>
              <ActionRow>
                <b>{learnerSkillLevels.name}</b>
                <ActionRow.Spacer />
              </ActionRow>
            </div>
          ) : (
            <div key="edit-job-dropdown">
              <SearchJobRole onSave={onSaveRole} onCancel={onCancelRole} />
            </div>
          )}
        </TransitionReplace>
        {skillCategories && (
          <>
            <ActionRow className="mt-4.5">
              <p>My Career Chart</p>
              <ActionRow.Spacer />
            </ActionRow>
            <SpiderChart className="plotly-graph" categories={learnerSkillLevels} />
          </>
        )}
        {skillCategories && (
          <Row>
            <ActionRow>
              <Button
                variant="link"
                size="inline"
                data-testid="reading-instructions-button"
                onClick={() => toggleShowInstructions()}
              >
                How do I read this?
              </Button>
              <ActionRow.Spacer />
            </ActionRow>
            {showInstructions && (
              <div className="text-muted skills-chart-reading-instructions">
                <p>
                  Using the Lightcast taxonomy, we trace your currently selected job title to the
                  competencies and skills needed to succeed. As you pass courses on the edX platform
                  teaching skills relevant to your current job, the graph above shows how you are
                  growing in the competenices related to your role.
                </p>
              </div>
            )}
          </Row>
        )}
        {skillCategories && (
          <Row className="mt-5">
            {skillCategories.map((category) => (
              <CategoryCard key={category.id} topCategory={category} />
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

VisualizeCareer.propTypes = {
  jobId: PropTypes.number.isRequired,
  submitClickHandler: PropTypes.func.isRequired,
};

export default VisualizeCareer;
