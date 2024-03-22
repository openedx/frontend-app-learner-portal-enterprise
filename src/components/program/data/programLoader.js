import { ensureAuthenticatedUser } from '../../app/routes/data/utils';

export default function makeProgramLoader(queryClient) {
  return async function programLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    return null;
  };
}
