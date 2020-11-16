import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

// TODO: We probably do not want to actually create the customer directly from the form, but send the data through
// ecommece. This is here for ease of prototyping.
export function createEnterpriseCustomer(values) {
  const data = {
    name: values.enterpriseName,
    country: values.enterpriseCountry,
    contact_email: values.enterpriseEmail,
    purchase_type: values.purchaseType,
  };
  const enterpriseCustomerUrl = `${process.env.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/`;
  const authenticatedClient = getAuthenticatedHttpClient();
  return authenticatedClient.post(enterpriseCustomerUrl, data);
}
