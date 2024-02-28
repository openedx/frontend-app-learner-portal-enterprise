import { useEffect } from 'react';
import { useAsyncError, useRouteError } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import { ErrorPage } from '@edx/frontend-platform/react';

const retrieveErrorBoundaryErrorMessage = (error) => {
  if (!error) {
    return null;
  }
  if (error.customAttributes) {
    return error.customAttributes.httpErrorResponseData;
  }
  return error.message;
};

const RouteErrorBoundary = () => {
  const routeError = useRouteError();
  const asyncError = useAsyncError();

  useEffect(() => {
    if (routeError) {
      logError(routeError);
    }
  }, [routeError]);

  useEffect(() => {
    if (asyncError) {
      logError(asyncError);
    }
  }, [asyncError]);

  const errorMessage = retrieveErrorBoundaryErrorMessage(routeError || asyncError);
  return <ErrorPage message={errorMessage} />;
};

export default RouteErrorBoundary;
