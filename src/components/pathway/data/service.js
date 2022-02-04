import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';

export default class LearnerPathwayService {
  constructor(options = {}) {
    const { learnerPathwayUuid } = options;
    this.config = getConfig();

    this.cachedAuthenticatedHttpClient = getAuthenticatedHttpClient({
      useCache: this.config.USE_API_CACHE,
    });

    this.learnerPathwayUuid = learnerPathwayUuid;
  }

  async fetchLearnerPathwayData() {
    const url = `${this.config.DISCOVERY_API_BASE_URL}/api/v1/learner-pathway/${this.learnerPathwayUuid}/`;
    const LearnerPathwayData = await this.cachedAuthenticatedHttpClient.get(url);
    return camelCaseObject(LearnerPathwayData.data);
  }
}
