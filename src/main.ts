import * as core from "@actions/core";
import { runReview } from "./review";

// const GITHUB_TOKEN: string = core.getInput("GITHUB_TOKEN");
// const OPENAI_API_KEY: string = core.getInput("OPENAI_API_KEY");
// const OPENAI_API_MODEL: string = core.getInput("OPENAI_API_MODEL");
// const REVIEW_MAX_COMMENTS: string = core.getInput("REVIEW_MAX_COMMENTS");
// const REVIEW_PROJECT_CONTEXT: string = core.getInput("REVIEW_PROJECT_CONTEXT");
// const APPROVE_REVIEWS: boolean = core.getInput("APPROVE_REVIEWS") === "true";

// const RESPONSE_TOKENS = 1024;

// const octokit = new Octokit({ auth: GITHUB_TOKEN });

// const openai = new OpenAI({
//   apiKey: OPENAI_API_KEY,
// });

// interface PRDetails {
//   owner: string;
//   repo: string;
//   pull_number: number;
//   title: string;
//   description: string;
// }

// interface AICommentResponse {
//   file: string;
//   lineNumber: string;
//   reviewComment: string;
// }

// interface GithubComment {
//   body: string;
//   path: string;
//   line: number;
// }

// interface GitHubEvent {
//   repository: {
//     full_name: string;
//     name: string;
//     owner: { login: string };
//   };
//   issue: {
//     number: number;
//   };
// }

// async function getPRDetails(): Promise<PRDetails> {
//   core.info("Fetching PR details...");

//   const eventPayload: GitHubEvent = JSON.parse(
//     readFileSync(process.env.GITHUB_EVENT_PATH || "", "utf8")
//   );

//   core.info(`Repository: ${eventPayload}`);

//   const { repository, issue } = eventPayload;
//   const number = issue.number; // This is your PR number

//   core.info(`Repository: ${repository.full_name}`);
//   core.info(`PR Number: ${number}`);

//   const prResponse = await octokit.pulls.get({
//     owner: repository.owner.login,
//     repo: repository.name,
//     pull_number: number,
//   });

//   core.info(`PR details fetched for PR #${number}`);

//   return {
//     owner: repository.owner.login,
//     repo: repository.name,
//     pull_number: number,
//     title: prResponse.data.title ?? "",
//     description: prResponse.data.body ?? "",
//   };
// }

// async function getDiff(
//   owner: string,
//   repo: string,
//   pull_number: number
// ): Promise<string | null> {
//   core.info(`Fetching diff for PR #${pull_number}...`);

//   const response = await octokit.pulls.get({
//     owner,
//     repo,
//     pull_number,
//     mediaType: { format: "diff" },
//   });

//   // @ts-expect-error - response.data is a string
//   return response.data;
// }

// async function analyzeCode(
//   changedFiles: File[],
//   prDetails: PRDetails
// ): Promise<Array<GithubComment>> {
//   core.info("Analyzing code...");
//   core.info(JSON.stringify(prDetails, null, 2));
//   core.info("printing REVIEW_PROJECT_CONTEXT");
//   core.info(REVIEW_PROJECT_CONTEXT);
//   core.info(JSON.stringify(changedFiles, null, 2));
//   core.info("STARTING PROMPT");
//   const prompt = createPrompt(changedFiles, prDetails);
//   core.info(prompt);
//   const aiResponse = await getAIResponse(prompt);
//   core.info(JSON.stringify(aiResponse, null, 2));

//   const comments: Array<GithubComment> = [];

//   if (aiResponse) {
//     const newComments = createComments(changedFiles, aiResponse);

//     if (newComments) {
//       comments.push(...newComments);
//     }
//   }

//   core.info(`Analysis complete. Generated ${comments.length} comments.`);
//   return comments;
// }

// function createPrompt(changedFiles: File[], prDetails: PRDetails): string {
//   core.info("Creating prompt for AI...");
//   const problemOutline = `Your task is to review pull requests (PR). Instructions:
// - Provide the response in following JSON format:  {"comments": [{"file": <file name>,  "lineNumber":  <line_number>, "reviewComment": "<review comment>"}]}
// - DO NOT give positive comments or compliments.
// - DO NOT give advice on renaming variable names or writing more descriptive variables.
// - Provide comments and suggestions ONLY if there is something to improve, otherwise return an empty array.
// - Provide at most ${REVIEW_MAX_COMMENTS} comments. It's up to you how to decide which comments to include.
// - Write the comment in GitHub Markdown format.
// - Use the given description only for the overall context and only comment the code.
// ${
//   REVIEW_PROJECT_CONTEXT
//     ? `- Additional context regarding this PR's project: ${REVIEW_PROJECT_CONTEXT}`
//     : ""
// }
// - IMPORTANT: Suggest adding comments only for complex logic or non-obvious business rules that require explanation.
// - IMPORTANT: Evaluate the entire diff in the PR before adding any comments.

// Pull request title: ${prDetails.title}

// TAKE A DEEP BREATH AND WORK ON THIS THIS PROBLEM STEP-BY-STEP.
// `;

//   const diffChunksPrompt = new Array();

//   for (const file of changedFiles) {
//     if (file.to === "/dev/null") continue; // Ignore deleted files
//     for (const chunk of file.chunks) {
//       diffChunksPrompt.push(createPromptForDiffChunk(file, chunk));
//     }
//   }

//   core.info("Prompt created successfully.");
//   return `${problemOutline}\n ${diffChunksPrompt.join("\n")}`;
// }

// function createPromptForDiffChunk(file: File, chunk: Chunk): string {
//   return `\n
//   Review the following code diff in the file "${file.to}". Git diff to review:

//   \`\`\`diff
//   ${chunk.content}
//   ${chunk.changes
//     // @ts-expect-error - ln and ln2 exists where needed
//     .map((c) => `${c.ln ? c.ln : c.ln2} ${c.content}`)
//     .join("\n")}
//   \`\`\`
//   `;
// }

// async function getAIResponse(
//   prompt: string
// ): Promise<Array<AICommentResponse>> {
//   core.info("Sending request to OpenAI API...");

//   const queryConfig = {
//     model: OPENAI_API_MODEL,
//     temperature: 0.2,
//     max_tokens: RESPONSE_TOKENS,
//     top_p: 1,
//     frequency_penalty: 0,
//     presence_penalty: 0,
//     response_format: {
//       type: "json_object",
//     } as const,
//   };

//   try {
//     const response = await openai.chat.completions.create({
//       ...queryConfig,
//       messages: [
//         {
//           role: "system",
//           content: prompt,
//         },
//       ],
//     });

//     if (!response.choices || response.choices.length === 0) {
//       throw new Error("OpenAI API returned an invalid response");
//     }

//     core.info("Received response from OpenAI API.");
//     const res = response.choices[0].message?.content?.trim() || "{}";

//     // Remove any markdown formatting and ensure valid JSON
//     const jsonString = res.replace(/^```json\s*|\s*```$/g, "").trim();

//     try {
//       let data = JSON.parse(jsonString);
//       if (!Array.isArray(data?.comments)) {
//         throw new Error("Invalid response from OpenAI API");
//       }
//       return data.comments;
//     } catch (parseError) {
//       core.error(`Failed to parse JSON: ${jsonString}`);
//       core.error(`Parse error: ${parseError}`);
//       throw parseError;
//     }
//   } catch (error: any) {
//     core.error("Error Message:", error?.message || error);

//     if (error?.response) {
//       core.error("Response Data:", error.response.data);
//       core.error("Response Status:", error.response.status);
//       core.error("Response Headers:", error.response.headers);
//     }

//     if (error?.config) {
//       core.error("Config:", error.config);
//     }

//     core.setFailed(`OpenAI API request failed: ${error.message}`);
//     throw error;
//   }
// }

// function createComments(
//   changedFiles: File[],
//   aiResponses: Array<AICommentResponse>
// ): Array<GithubComment> {
//   core.info("Creating GitHub comments from AI responses...");

//   return aiResponses
//     .flatMap((aiResponse) => {
//       const file = changedFiles.find((file) => file.to === aiResponse.file);

//       return {
//         body: aiResponse.reviewComment,
//         path: file?.to ?? "",
//         line: Number(aiResponse.lineNumber),
//       };
//     })
//     .filter((comments) => comments.path !== "");
// }

// async function createReviewComment(
//   owner: string,
//   repo: string,
//   pull_number: number,
//   comments: Array<GithubComment>
// ): Promise<void> {
//   core.info(`Creating review comment for PR #${pull_number}...`);

//   await octokit.pulls.createReview({
//     owner,
//     repo,
//     pull_number,
//     comments,
//     event: APPROVE_REVIEWS ? "APPROVE" : "COMMENT",
//   });

//   core.info(
//     `Review ${APPROVE_REVIEWS ? "approved" : "commented"} successfully.`
//   );
// }

// async function hasExistingReview(
//   owner: string,
//   repo: string,
//   pull_number: number
// ): Promise<boolean> {
//   const reviews = await octokit.pulls.listReviews({
//     owner,
//     repo,
//     pull_number,
//   });
//   return reviews.data.length > 0;
// }

// async function main() {
//   core.info(`TEST:1 fix the event type to comment`);
//   try {
//     core.info("Starting AI code review process...");

//     const prDetails = await getPRDetails();
//     core.info(JSON.stringify(prDetails, null, 2));
//     core.info("PR DETAILS FETCHED");
//     let diff: string | null;
//     const eventData = JSON.parse(
//       readFileSync(process.env.GITHUB_EVENT_PATH ?? "", "utf8")
//     );
//     core.info(JSON.stringify(eventData, null, 2));
//     core.info("EVENT DATA FETCHED");

//     core.info(`Processing ${eventData.action} event...`);
//     const existingReview = await hasExistingReview(
//       prDetails.owner,
//       prDetails.repo,
//       prDetails.pull_number
//     );

//     if (
//       eventData.action === "opened" ||
//       (eventData.action === "synchronize" && !existingReview)
//     ) {
//       diff = await getDiff(
//         prDetails.owner,
//         prDetails.repo,
//         prDetails.pull_number
//       );
//     } else if (eventData.action === "synchronize" && existingReview) {
//       // Get the PR details to get the correct base and head
//       const prResponse = await octokit.pulls.get({
//         owner: prDetails.owner,
//         repo: prDetails.repo,
//         pull_number: prDetails.pull_number,
//       });

//       core.info(
//         `Comparing PR base -> head: ${prResponse.data.base.sha} -> ${prResponse.data.head.sha}`
//       );
//       const response = await octokit.repos.compareCommits({
//         headers: {
//           accept: "application/vnd.github.v3.diff",
//         },
//         owner: prDetails.owner,
//         repo: prDetails.repo,
//         base: prResponse.data.base.sha,
//         head: prResponse.data.head.sha,
//       });

//       diff = String(response.data);
//     } else if (eventData.action === "created") {
//       const comment = eventData.comment.body;
//       core.info(`Comment: ${comment}`);

//       diff = await getDiff(
//         prDetails.owner,
//         prDetails.repo,
//         prDetails.pull_number
//       );
//       core.info(`diff: ${diff}`);
//     } else {
//       core.info(`Unsupported event: ${process.env.GITHUB_EVENT_NAME}`);
//       return;
//     }

//     if (!diff) {
//       core.info("No diff found");
//       return;
//     }

//     const changedFiles = parseDiff(diff);
//     core.info(`Found ${changedFiles.length} changed files.`);

//     const excludePatterns = core
//       .getInput("exclude")
//       .split(",")
//       .map((s) => s.trim());

//     const filteredDiff = changedFiles.filter((file) => {
//       return !excludePatterns.some((pattern) =>
//         minimatch(file.to ?? "", pattern)
//       );
//     });
//     core.info(`After filtering, ${filteredDiff.length} files remain.`);

//     const comments = await analyzeCode(filteredDiff, prDetails);
//     if (APPROVE_REVIEWS || comments.length > 0) {
//       await createReviewComment(
//         prDetails.owner,
//         prDetails.repo,
//         prDetails.pull_number,
//         comments
//       );
//     } else {
//       core.info("No comments to post.");
//     }
//     core.info("AI code review process completed successfully.");
//   } catch (error: any) {
//     core.error("Error:", error);
//     core.setFailed(`Action failed: ${error.message}`);
//     process.exit(1); // This line ensures the GitHub action fails
//   }
// }

core.info("Starting AI code review action...");
core.info("Testing: 2 Refactor code...");
runReview().catch((error) => {
  core.error("Unhandled error in main function:", error);
  core.setFailed(
    `Unhandled error in main function: ${(error as Error).message}`,
  );
  process.exit(1);
});
