import { MailtoLink } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { useMemo } from 'react';
import { PLAN_EXPIRY_VARIANTS } from '../constants';

// TODO: The components that renders these objects expects strings and returning console error.
const useExpiryThresholds = () => {
  const intl = useIntl();

  return useMemo(() => ({
    60: ({ date }) => ({
      alertTemplate: {
        title: intl.formatMessage(
          {
            id: 'enterprise.budget.expiry.notification.alert.title',
            defaultMessage: 'Your organization’s plan expires {date}',
            description: 'Title for the alert when learning credit is expiring.',
          },
          {
            date,
          },
        ),
        variant: 'info',
        message: () => (
          <p>
            <FormattedMessage
              id="enterprise.budget.expiry.notification.alert.message"
              defaultMessage="When your organization’s plan expires, you will no longer be able to use your learning credit to enroll in new courses. If you are currently enrolled in a course, there will be no disruption to your learning."
              description="Message for the alert when learning credit is expiring."
            />
          </p>
        ),
        dismissible: true,
      },
      modalTemplate: {
        title: intl.formatMessage(
          {
            id: 'enterprise.budget.expiry.notification.modal.title',
            defaultMessage: 'Your learning credit is expiring',
            description: 'Title for the modal when learning credit is expiring.',
          },
        ),
        message: ({ contactEmail }) => (
          <>
            <p>
              <FormattedMessage
                id="enterprise.budget.expiry.notification.modal.message"
                defaultMessage="Your organization’s plan expires on <strong>{date}</strong>. After it expires, you will no longer be able to use your learning credit to enroll in new courses."
                description="Message for the modal when learning credit is expiring."
                values={{
                  strong: chunks => (
                    <strong>{ chunks }</strong>
                  ),
                  date,
                }}
              />
            </p>
            <p>
              <FormattedMessage
                id="enterprise.budget.expiry.notification.modal.additional_message"
                defaultMessage="If you are currently enrolled in courses, there will be no disruption to your learning upon expiration of the plan."
                description="Additional message for the modal when learning credit is expiring."
              />
            </p>
            <p>
              <FormattedMessage
                id="enterprise.budget.expiry.notification.modal.contact_admin_prompt"
                defaultMessage="If you think this is an error or need help, please "
                description="Prompt to contact administrator in the modal when learning credit is expiring."
              />
              {contactEmail
                ? (
                  <MailtoLink to={contactEmail}>
                    <FormattedMessage
                      id="enterprise.budget.expiry.notification.modal.contact_admin_link"
                      defaultMessage="contact your organization’s administrator. "
                      description="Link to contact administrator in the modal when learning credit is expiring."
                    />
                  </MailtoLink>
                ) : (
                  <FormattedMessage
                    id="enterprise.budget.expiry.notification.modal.contact_admin_link"
                    defaultMessage="contact your organization’s administrator."
                    description="Link to contact administrator in the modal when learning credit is expiring."
                  />
                )}
            </p>
          </>
        ),
      },
      variant: PLAN_EXPIRY_VARIANTS.expiring,
    }),
    30: ({ date }) => ({
      alertTemplate: {
        title: intl.formatMessage(
          {
            id: 'enterprise.budget.expiry.notification.alert.title',
            defaultMessage: 'Reminder: Your organization’s plan expires {date}',
            description: 'Title for the alert when learning credit is expiring.',
          },
          {
            date,
          },
        ),
        variant: 'info',
        message: () => (
          <p>
            <FormattedMessage
              id="enterprise.budget.expiry.notification.alert.message"
              defaultMessage="When your organization’s plan expires, you will no longer be able to use your learning credit to enroll in new courses. If you are currently enrolled in a course, there will be no disruption to your learning."
              description="Message for the alert when learning credit is expiring."
            />
          </p>
        ),
        dismissible: true,
      },
      modalTemplate: {
        title: intl.formatMessage(
          {
            id: 'enterprise.budget.expiry.notification.modal.title',
            defaultMessage: 'Reminder: Your learning credit is expiring',
            description: 'Title for the modal when learning credit is expiring.',
          },
        ),
        message: ({ contactEmail }) => (
          <>
            <p>
              <FormattedMessage
                id="enterprise.budget.expiry.notification.modal.message"
                defaultMessage="Your organization’s plan expires on <strong>{date}</strong>. After it expires, you will no longer be able to use your learning credit to enroll in new courses."
                description="Message for the modal when learning credit is expiring."
                values={{
                  strong: chunks => (
                    <strong>{ chunks }</strong>
                  ),
                  date,
                }}
              />
            </p>
            <p>
              <FormattedMessage
                id="enterprise.budget.expiry.notification.modal.additional_message"
                defaultMessage="If you are currently enrolled in courses, there will be no disruption to your learning upon expiration of the plan."
                description="Additional message for the modal when learning credit is expiring."
              />
            </p>
            <p>
              <FormattedMessage
                id="enterprise.budget.expiry.notification.modal.contact_admin_prompt"
                defaultMessage="If you think this is an error or need help, please "
                description="Prompt to contact administrator in the modal when learning credit is expiring."
              />
              {contactEmail
                ? (
                  <MailtoLink to={contactEmail}>
                    <FormattedMessage
                      id="enterprise.budget.expiry.notification.modal.contact_admin_link"
                      defaultMessage="contact your organization’s administrator."
                      description="Link to contact administrator in the modal when learning credit is expiring."
                    />
                  </MailtoLink>
                ) : (
                  <FormattedMessage
                    id="enterprise.budget.expiry.notification.modal.contact_admin_link"
                    defaultMessage="contact your organization’s administrator."
                    description="Link to contact administrator in the modal when learning credit is expiring."
                  />
                )}
            </p>
          </>
        ),
      },
      variant: PLAN_EXPIRY_VARIANTS.expiring,
    }),
  }), [intl]);
};

export default useExpiryThresholds;
