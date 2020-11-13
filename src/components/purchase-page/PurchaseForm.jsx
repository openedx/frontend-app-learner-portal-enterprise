import React from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { Form, Button } from '@edx/paragon';
import { Form as FinalForm, Field } from 'react-final-form';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

// TODO: We might not want to actually create the customer directly from the form
const createCustomer = (values) => {
  const data = {
    name: values.enterpriseName,
    country: values.enterpriseCountry,
    contact_email: values.enterpriseEmail,
  };
  const authenticatedClient = getAuthenticatedHttpClient();
  const url = `${process.env.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/`;
  authenticatedClient.post(url, data)
    .then((x) => console.log(x))
    .catch((error) => {
      logError(new Error(error));
    });
};

const PurchaseForm = () => (
  <FinalForm
    onSubmit={createCustomer}
    render={({
      handleSubmit,
      submitting,
      pristine,
      values,
    }) => (
      <Form onSubmit={handleSubmit}>
        {/* TODO: Use full form from paragon */}
        {/* TODO: field validation */}
        <div>
          <label>Enterprise Name</label>
          <Field
            name="enterpriseName"
            component="input"
            type="text"
            placeholder="Pied Piper"
            required
          />
        </div>

        <div>
          {/* TODO: Country selector */}
          <label>Enterprise Country</label>
          <Field name="enterpriseCountry" component="select" required>
            <option />
            <option value="New Zealand">New Zealand</option>
            <option value="Germany">Germany</option>
          </Field>
        </div>

        <div>
          <label>Enterprise Contact Email</label>
          <Field
            name="enterpriseEmail"
            component="input"
            type="email"
            placeholder="admin@example.com"
            required
          />
        </div>

        <div>
          <label>Course Key</label>
          <Field
            name="courseKey"
            component="input"
            type="text"
            placeholder="edX+demoX"
            required
          />
        </div>

        <Button variant="primary" type="submit" disabled={submitting || pristine}>
          Submit
        </Button>

        <pre>{JSON.stringify(values, 0, 2)}</pre>

      </Form>
    )}
  />
);

// react-bootstrap form elements
// <Form.Group controlId="enterpriseName">
//   <Form.Label>Enterprise Name</Form.Label>
//   <Field name="enterpriseName" component={Form.Control} type="text" placeholder="Pied Piper" required />
//   {/* <Field name="firstName" component="input" /> */}
// </Form.Group>

// {/* TODO: Country selector */}
// <Form.Group controlId="enterpriseCountry">
//   <Form.Label>Enterprise Country</Form.Label>
//   <Form.Control as="select" defaultValue="Choose..." required>
//     <option>Choose...</option>
//     <option>...</option>
//   </Form.Control>
// </Form.Group>

// <Form.Group controlId="enterpriseContactEmail">
//   <Form.Label>Enterprise Contact Email</Form.Label>
//   <Form.Control type="email" placeholder="admin@example.com" required />
// </Form.Group>

// {/* TODO: UX on finding and selecting a course */}
// <Form.Group controlId="courseKey">
//   <Form.Label>Course Key</Form.Label>
//   <Form.Control type="text" placeholder="edX+demoX" required />
// </Form.Group>

// <Button variant="primary" type="submit" disabled={submitting || pristine}>
//   Submit
// </Button>

export default PurchaseForm;
