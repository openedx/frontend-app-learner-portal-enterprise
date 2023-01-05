import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import {
  screen, render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

import PathwayNode from '../PathwayNode';
import LearnerPathwayProgressData from '../data/__mocks__/PathwayProgressListData.json';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    enterpriseSlug: 'test-enterprise-slug',
  }),
  useLocation: jest.fn(),
}));

const appState = {
  enterpriseConfig: {
    slug: 'test-enterprise-slug',
  },
};

const userSubsidyState = {
  subscriptionLicense: {
    uuid: 'test-license-uuid',
  },
  couponCodes: {
    couponCodes: [],
    couponCodesCount: 0,
  },
};
const pathwaySteps = camelCaseObject(
  LearnerPathwayProgressData[0].learner_pathway_progress.steps,
);

const PathwayNodeWithContext = ({ pathwayNodedData }) => (
  <AppContext.Provider value={appState}>
    <UserSubsidyContext.Provider value={userSubsidyState}>
      <PathwayNode node={pathwayNodedData} />
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

describe('<PathwayNode />', () => {
  it('renders all data related to pathway node correctly', () => {
    const pathwayNodeExtractedData = [...pathwaySteps[1].courses, ...pathwaySteps[1].programs][0];

    const { getByAltText } = render(
      <PathwayNodeWithContext pathwayNodedData={pathwayNodeExtractedData} />,
    );

    expect(screen.getByText(pathwayNodeExtractedData.title)).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Resume Course')).toBeInTheDocument();
    const cardImageNode = getByAltText(pathwayNodeExtractedData.title);
    expect(cardImageNode).toHaveAttribute('src', pathwayNodeExtractedData.cardImage);
  });

  it('renders all data related to pathway node correctly for not started items', () => {
    const pathwayNodeExtractedData = [...pathwaySteps[0].courses, ...pathwaySteps[0].programs][0];

    const { getByAltText } = render(
      <PathwayNodeWithContext pathwayNodedData={pathwayNodeExtractedData} />,
    );

    expect(screen.getByText(pathwayNodeExtractedData.title)).toBeInTheDocument();
    expect(screen.getByText('View Course')).toBeInTheDocument();
    expect(screen.queryByText('In Progress')).toBeNull();
    const cardImageNode = getByAltText(pathwayNodeExtractedData.title);
    expect(cardImageNode).toHaveAttribute('src', pathwayNodeExtractedData.cardImage);
  });
});
