import * as core from "@actions/core";
import { File } from "parse-diff";
import { PRDetails, AICommentResponse, GithubComment } from "./types";
import { createPrompt } from "./promptBuilder";
import { getAIResponse } from "./openaiClient";

export async function analyzeCode(
  changedFiles: File[],
  prDetails: PRDetails,
): Promise<GithubComment[]> {
  core.info("Analyzing code...");
  const prompt = createPrompt(changedFiles, prDetails);
  core.info(`Prompt created :- ${prompt}`);
  core.info("Sending to OpenAI for analysis...");
  const aiResponse = await getAIResponse(prompt);
  const comments = createComments(changedFiles, aiResponse);
  core.info(`Analysis complete. Generated ${comments.length} comments.`);
  return comments;
}

function createComments(
  changedFiles: File[],
  aiResponses: AICommentResponse[],
): GithubComment[] {
  return aiResponses
    .flatMap((aiResponse) => {
      const file = changedFiles.find((file) => file.to === aiResponse.file);

      return {
        body: aiResponse.reviewComment,
        path: file?.to ?? "",
        line: Number(aiResponse.lineNumber),
      };
    })
    .filter((comments) => comments.path !== "");
}
