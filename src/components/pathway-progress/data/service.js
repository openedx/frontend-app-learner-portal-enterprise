// TODO: remove this once backend API is ready and integrated.
// TODO: Ticket: https://2u-internal.atlassian.net/browse/ENT-6076
import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const PATHWAY_PROGRESS_DATA = {
  data: {
    pathwayData: {
      uuid: 'test-pathway',
      title: 'Test Pathway',
      steps: [
        {
          minRequirement: 2,
          nodes: [
            {
              isInProgress: true,
              type: 'Course',
              title: 'Computer Science Course',
              description: 'The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.  ',
              imageUrl: 'https://via.placeholder.com/200x150.png',
              destinationUrl: '',
              uuid: 'test-uuid',
            },
            {
              isInProgress: false,
              type: 'Course',
              title: 'Another Computer Science Course',
              description: 'The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.  ',
              imageUrl: 'https://via.placeholder.com/200x150.png',
              destinationUrl: '',
              uuid: 'test-uuid',
            },
            {
              isInProgress: false,
              type: 'Course',
              title: 'Then Another Computer Science Course',
              description: 'The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.  ',
              imageUrl: 'https://via.placeholder.com/200x150.png',
              destinationUrl: '',
              uuid: 'test-uuid',
            },
          ],
        },
        {
          minRequirement: 1,
          nodes: [
            {
              isInProgress: false,
              type: 'Program',
              title: 'Computer Science Program',
              description: 'The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.  ',
              imageUrl: 'https://via.placeholder.com/200x150.png',
              destinationUrl: '',
              uuid: 'test-uuid',
            },
            {
              isInProgress: false,
              type: 'Course',
              title: 'Statistics Course',
              description: 'The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.  ',
              imageUrl: 'https://via.placeholder.com/200x150.png',
              destinationUrl: '',
              uuid: 'test-uuid',
            },
            {
              isInProgress: false,
              type: 'Course',
              title: 'Python Course',
              description: 'The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.  ',
              imageUrl: 'https://via.placeholder.com/200x150.png',
              destinationUrl: '',
              uuid: 'test-uuid',
            },
          ],
        },
      ],
    },
  },
};
// eslint-disable-next-line no-unused-vars
export function getPathwayProgressDetails(pathwayUUID) {
  return new Promise((resolve) => {
    resolve(PATHWAY_PROGRESS_DATA);
  });
}

// eslint-disable-next-line no-unused-vars
export function getPathwayProgressList(enterpriseUUID) {
  // TODO: after adding support of filtering on enterprise UUID, send the uuid to endpoint as well
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/learner-pathway-progress/v1/progress/`;
  return getAuthenticatedHttpClient().get(url);
}
