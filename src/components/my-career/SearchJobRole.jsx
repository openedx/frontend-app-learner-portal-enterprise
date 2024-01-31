import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { SearchContext, deleteRefinementAction } from '@edx/frontend-enterprise-catalog-search';
import { AppContext } from '@edx/frontend-platform/react';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Form, StatefulButton,
} from '@edx/paragon';
import { CURRENT_JOB_FACET, JOB_FILTERS } from '../skills-quiz/constants';
import { patchProfile, fetchJobDetailsFromAlgolia } from './data/service';
import { CURRENT_JOB_PROFILE_FIELD_NAME } from './data/constants';
import { useAlgoliaSearch } from '../../utils/hooks';

const SearchJobRole = (props) => {
  const config = getConfig();
  const [searchClient, searchIndex] = useAlgoliaSearch(config, config.ALGOLIA_INDEX_NAME_JOBS);
  const { authenticatedUser: { username } } = useContext(AppContext);
  const { refinements, dispatch } = useContext(SearchContext);
  const { current_job: currentJob } = refinements;
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [requestComplete, setRequestComplete] = useState(false);
  const [requestError, setRequestError] = useState(false);
  const intl = useIntl();

  const {
    title, attribute, typeaheadOptions, facetValueType, customAttribute,
  } = CURRENT_JOB_FACET;

  const getDisabledStates = () => {
    if (currentJob) {
      return ['pending', 'complete'];
    }
    return ['pending', 'complete', 'default'];
  };

  const getButtonState = () => {
    if (requestError) {
      return 'error';
    }
    if (requestComplete) {
      return 'complete';
    }
    if (loadingRequest) {
      return 'pending';
    }
    return 'default';
  };

  const handleSubmit = async () => {
    let resp = {};
    setLoadingRequest(true);
    const { id: currentJobID } = await fetchJobDetailsFromAlgolia(searchIndex, currentJob);
    const params = {
      extended_profile: [
        { field_name: CURRENT_JOB_PROFILE_FIELD_NAME, field_value: currentJobID },
      ],
    };

    try {
      resp = await patchProfile(username, params);
    } catch (error) {
      setLoadingRequest(false);
      setRequestError(true);
      logError(new Error(error));
    }
    setRequestComplete(true);
    setLoadingRequest(false);
    if (currentJob) {
      dispatch(deleteRefinementAction(customAttribute));
    }
    props.onSave(camelCaseObject(resp));
  };

  const handleCancelButtonClick = () => {
    if (currentJob) {
      dispatch(deleteRefinementAction(customAttribute));
    }
    props.onCancel();
  };

  return (
    <div>
      <form>
        <Form.Group>
          <InstantSearch
            indexName={config.ALGOLIA_INDEX_NAME_JOBS}
            searchClient={searchClient}
          >
            <p>
              <FormattedMessage
                id="enterprise.dashboard.my.career.tab.add.job.role.dropdown.label"
                defaultMessage="Search for your job role"
                description="Label for dropdown to search for learner's current or desired job role"
              />
            </p>
            <Configure
              facetingAfterDistinct
              filters={JOB_FILTERS.JOB_SOURCE_COURSE_SKILL}
            />
            <FacetListRefinement
              id="current-job-dropdown"
              key={attribute}
              title={refinements[customAttribute]?.length > 0 ? refinements[customAttribute][0] : title}
              attribute={attribute}
              limit={300}
              refinements={refinements}
              facetValueType={facetValueType}
              typeaheadOptions={typeaheadOptions}
              searchable={!!typeaheadOptions}
              doRefinement={false}
              customAttribute={customAttribute}
              showBadge={false}
              variant="default"
            />
          </InstantSearch>
        </Form.Group>
        <p>
          <StatefulButton
            type="submit"
            className="mr-2"
            labels={{
              default: intl.formatMessage({
                id: 'enterprise.dashboard.my.career.tab.add.job.role.save.button',
                defaultMessage: 'Save',
                description: "Label for button to save learner's current or desired job role",
              }),
              pending: intl.formatMessage({
                id: 'enterprise.dashboard.my.career.tab.add.job.role.save.pending.button',
                defaultMessage: 'Saving',
                description: "Label for button to save learner's current or desired job role when save is in progress",
              }),
              complete: intl.formatMessage({
                id: 'enterprise.dashboard.my.career.tab.add.job.role.save.complete.button',
                defaultMessage: 'Saved',
                description: "Label for button to save learner's current or desired job role when save is complete",
              }),
              error: intl.formatMessage({
                id: 'enterprise.dashboard.my.career.tab.add.job.role.save.error.button',
                defaultMessage: 'Error',
                description: "Label for button to save learner's current or desired job role when save fails",
              }),
            }}
            state={getButtonState()}
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            disabledStates={getDisabledStates()}
            data-testid="save-button"
          />
          <Button
            variant="outline-primary"
            onClick={handleCancelButtonClick}
            className="cancel-btn"
            data-testid="cancel-button"
          >
            <FormattedMessage
              id="enterprise.dashboard.my.career.tab.add.job.role.cancel.button"
              defaultMessage="Cancel"
              description="Label for button to cancel adding learner's current or desired job role"
            />
          </Button>
        </p>
      </form>
    </div>
  );
};

SearchJobRole.propTypes = {
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default SearchJobRole;
