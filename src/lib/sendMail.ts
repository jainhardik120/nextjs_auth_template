import type { SendEmailCommandInput } from "@aws-sdk/client-ses";
import { SES } from "@aws-sdk/client-ses";
import { render } from "@react-email/components";
import React from "react";
import { config } from "./aws-config";

export const sendMail = (
  to: string,
  subject: string,
  cta_button_text: string,
  cta_button_link: string,
  text: string,
) => {
  console.log(to);
  console.log(subject);
  console.log(cta_button_text);
  console.log(cta_button_link);
  console.log(text);
};

export const sendSESEmail = async (
  to: string[],
  subject: string,
  emailBody: React.ReactElement,
) => {
  const ses = new SES(config);
  const emailHtml = await render(emailBody);
  const emailText = await render(emailBody, {
    plainText: true,
  });

  const params: SendEmailCommandInput = {
    Source: process.env.EMAIL_SENDER_ADDRESS,
    Destination: {
      ToAddresses: to,
    },
    Message: {
      Body: {
        Text: {
          Data: emailText,
        },
        Html: {
          Data: emailHtml,
        },
      },
      Subject: {
        Data: subject,
      },
    },
  };

  await ses.sendEmail(params);
};
