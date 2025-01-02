import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./canva-spec.yml",
  client: "@hey-api/client-fetch",
  output: {
    path: "./src/canva-client",
    format: "prettier",
    lint: "eslint",
  },
  services: {
    asClass: true,
  },
  types: {
    enums: "javascript",
  },
});
