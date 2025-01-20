"use server";
// import fs from "node:fs";
import { getEmailComponent } from "./utils/get-email-component";
import { improveErrorWithSourceMap } from "./utils/improve-error-with-sourcemap";
import type { ErrorObject } from "./utils/types/error-object";

export interface RenderedEmailMetadata {
  markup: string;
  plainText: string;
  reactMarkup: string;
}

export type EmailRenderingResult =
  | RenderedEmailMetadata
  | {
      error: ErrorObject;
    };

export const renderEmail = async (
  emailPath: string,
): Promise<EmailRenderingResult> => {
  const componentResult = await getEmailComponent(emailPath);

  if ("error" in componentResult) {
    return { error: componentResult.error };
  }

  const {
    emailComponent: Email,
    createElement,
    render,
    sourceMapToOriginalFile,
  } = componentResult;

  const previewProps = Email.PreviewProps || {};
  const EmailComponent = Email as React.FC;
  try {
    const markup = await render(createElement(EmailComponent, previewProps), {
      pretty: true,
    });
    const plainText = await render(
      createElement(EmailComponent, previewProps),
      {
        plainText: true,
      },
    );
    // const reactMarkup = await fs.promises.readFile(emailPath, "utf-8");
    const renderingResult = {
      markup: markup.replaceAll("\0", ""),
      plainText,
      reactMarkup: "",
    };

    return renderingResult;
  } catch (exception) {
    const error = exception as Error;
    return {
      error: improveErrorWithSourceMap(
        error,
        emailPath,
        sourceMapToOriginalFile,
      ),
    };
  }
};
