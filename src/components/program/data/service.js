import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';

export default class ProgramService {
  constructor(options = {}) {
    const { programUuid } = options;
    this.config = getConfig();

    this.cachedAuthenticatedHttpClient = getAuthenticatedHttpClient({
      useCache: this.config.USE_API_CACHE,
    });

    this.programUuid = programUuid;
  }

  async fetchAllProgramData() {
    const programDataRaw = await Promise.all([
      this.fetchProgramDetails(),
    ])
      .then((responses) => responses.map(res => res.data));

    const programData = camelCaseObject(programDataRaw);
    const programDetails = programData[0];

    return {
      programDetails,
    };
  }

  fetchProgramDetails() {
    const url = `${this.config.DISCOVERY_API_BASE_URL}/api/v1/programs/${this.programUuid}/`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }
}
