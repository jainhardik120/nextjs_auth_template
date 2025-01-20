import path from "node:path";
import vm from "node:vm";
import { render } from "@react-email/render";
import { type BuildFailure, type OutputFile, build } from "esbuild";
import React from "react";
import type { RawSourceMap } from "source-map-js";
import { improveErrorWithSourceMap } from "./improve-error-with-sourcemap";
import { staticNodeModulesForVM } from "./static-node-modules-for-vm";
import type { EmailTemplate as EmailComponent } from "./types/email-template";
import type { ErrorObject } from "./types/error-object";

export const getEmailComponent = async (
  emailPath: string,
): Promise<
  | {
      emailComponent: EmailComponent;

      createElement: typeof React.createElement;

      render: typeof render;

      sourceMapToOriginalFile: RawSourceMap;
    }
  | { error: ErrorObject }
> => {
  let outputFiles: OutputFile[];
  try {
    const buildData = await build({
      bundle: true,
      stdin: {
        contents: emailPath,
        resolveDir: path.dirname("email-template"),
        sourcefile: "email-template.tsx",
      },
      platform: "node",
      write: false,
      format: "cjs",
      jsx: "automatic",
      logLevel: "silent",
      loader: {
        ".js": "jsx",
      },
      outdir: "stdout",
      sourcemap: "external",
    });
    outputFiles = buildData.outputFiles;
  } catch (exception) {
    const buildFailure = exception as BuildFailure;
    return {
      error: {
        message: buildFailure.message,
        stack: buildFailure.stack,
        name: buildFailure.name,
        cause: buildFailure.cause,
      },
    };
  }

  const sourceMapFile = outputFiles[0]!;
  const bundledEmailFile = outputFiles[1]!;
  const builtEmailCode = bundledEmailFile.text;

  const fakeContext = {
    ...global,
    console,
    Buffer,
    AbortSignal,
    Event,
    EventTarget,
    TextDecoder,
    Request,
    Response,
    TextDecoderStream,
    TextEncoder,
    TextEncoderStream,
    ReadableStream,
    URL,
    URLSearchParams,
    Headers,
    module: {
      exports: {
        default: undefined as unknown,
        render: undefined as unknown,
        reactEmailCreateReactElement: undefined as unknown,
      },
    },
    __filename: "email-template.tsx",
    __dirname: path.dirname("email-template"),
    require: (specifiedModule: string) => {
      let m = specifiedModule;
      if (specifiedModule.startsWith("node:")) {
        m = m.split(":")[1]!;
      }

      if (m in staticNodeModulesForVM) {
        return staticNodeModulesForVM[m];
      }

      /* eslint-disable-next-line @typescript-eslint/no-require-imports */
      return require(`${specifiedModule}`);
    },
    process,
  };
  const sourceMapToEmail = JSON.parse(sourceMapFile.text) as RawSourceMap;
  sourceMapToEmail.sourceRoot = path.resolve(sourceMapFile.path, "../..");
  sourceMapToEmail.sources = sourceMapToEmail.sources.map((source) =>
    path.resolve(sourceMapFile.path, "..", source),
  );
  try {
    vm.runInNewContext(builtEmailCode, fakeContext, {
      filename: "email-template.tsx",
    });
  } catch (exception) {
    const error = exception as Error;
    error.stack &&= error.stack.split("at Script.runInContext (node:vm")[0];
    return {
      error: improveErrorWithSourceMap(
        error,
        "email-template.tsx",
        sourceMapToEmail,
      ),
    };
  }
  if (fakeContext.module.exports.default === undefined) {
    return {
      error: improveErrorWithSourceMap(
        new Error(`The email component at  does not contain a default export`),
        "email-template.tsx",
        sourceMapToEmail,
      ),
    };
  }
  return {
    emailComponent: fakeContext.module.exports.default as EmailComponent,
    render: fakeContext.module.exports.render as typeof render,
    createElement: fakeContext.module.exports
      .reactEmailCreateReactElement as typeof React.createElement,
    sourceMapToOriginalFile: sourceMapToEmail,
  };
};
