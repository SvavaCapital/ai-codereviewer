import * as core from "@actions/core";

export const GITHUB_TOKEN: string = core.getInput("GITHUB_TOKEN");
export const OPENAI_API_KEY: string = core.getInput("OPENAI_API_KEY");
export const OPENAI_API_MODEL: string = core.getInput("OPENAI_API_MODEL");
export const REVIEW_MAX_COMMENTS: string = core.getInput("REVIEW_MAX_COMMENTS");
export const REVIEW_PROJECT_CONTEXT: string = core.getInput(
  "REVIEW_PROJECT_CONTEXT",
);
export const APPROVE_REVIEWS: boolean =
  core.getInput("APPROVE_REVIEWS") === "true";

export const RESPONSE_TOKENS = 1024;
