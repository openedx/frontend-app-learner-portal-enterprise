import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, Stack, Form, Hyperlink,
} from '@edx/paragon';

import { useActiveQueryParams } from './data';

function UserEnrollmentForm({ className }) {
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const activeQueryParams = useActiveQueryParams();

  return (
    <form className={className}>
      <div className="mb-4">
        <h3 className="h4 mb-3">Personal information</h3>
        <Stack direction="horizontal" gap={3}>
          <Form.Group>
            <Form.Control
              value=""
              onChange={() => {}}
              floatingLabel="First Name"
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              value=""
              onChange={() => {}}
              floatingLabel="Last Name"
            />
          </Form.Group>
        </Stack>
      </div>
      <div className="mb-4">
        <h3 className="h4 mb-3">Contact information</h3>
        <Form.Group>
          <Form.Control
            value=""
            onChange={() => {}}
            floatingLabel="Address Line 1"
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            value=""
            onChange={() => {}}
            floatingLabel="Address Line 2"
          />
        </Form.Group>
        <Stack direction="horizontal" gap={3}>
          <Form.Group>
            <Form.Control
              value=""
              onChange={() => {}}
              floatingLabel="City"
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              value=""
              onChange={() => {}}
              floatingLabel="State"
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              value=""
              onChange={() => {}}
              floatingLabel="Postal Code"
            />
          </Form.Group>
        </Stack>
        <Form.Group>
          <Form.Control
            value=""
            onChange={() => {}}
            floatingLabel="Country"
          />
        </Form.Group>
      </div>
      <div className="mb-4">
        <Form.Group className="d-flex align-items-center">
          <Form.Checkbox
            checked={isTermsChecked}
            onChange={() => setIsTermsChecked(!isTermsChecked)}
          >
            I agree
          </Form.Checkbox>
          &nbsp;to the&nbsp;
          <Hyperlink
            destination="https://www.getsmarter.com/terms-and-conditions-for-students"
            target="_blank"
          >
            Terms and Conditions for Students
          </Hyperlink>
        </Form.Group>
        <p className="small">
          By providing these details you agree to the use of your data as described in our{' '}
          <Hyperlink destination="https://www.getsmarter.com/privacy-policy" target="_blank">privacy policy</Hyperlink>. By
          using our services or registering for a course, you agree to be bound by these terms. If you do not agree to
          be bound by these terms, or are not able to enter into a binding agreement then you may not register for a
          course or use our services.
        </p>
      </div>
      <div>
        <ActionRow>
          {activeQueryParams.has('redirect_url') && (
            <Button as="a" variant="tertiary" href={activeQueryParams.get('redirect_url')}>
              Go back
            </Button>
          )}
          <Button variant="primary">
            Continue
          </Button>
        </ActionRow>
      </div>
    </form>
  );
}

UserEnrollmentForm.propTypes = {
  className: PropTypes.string,
};

UserEnrollmentForm.defaultProps = {
  className: undefined,
};

export default UserEnrollmentForm;
