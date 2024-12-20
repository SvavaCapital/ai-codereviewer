import { Octokit } from "@octokit/rest";
import { readFileSync } from "fs";
import * as core from "@actions/core";
import { GITHUB_TOKEN, APPROVE_REVIEWS } from "./config";
import { PRDetails, GitHubEvent, GithubComment } from "./types";

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function getPRDetails(): Promise<PRDetails> {
  core.info("Fetching PR details...");

  const eventPayload: GitHubEvent = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH || "", "utf8")
  );

  const { repository, issue } = eventPayload;
  const number = issue.number;

  const prResponse = await octokit.pulls.get({
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: number,
  });

  return {
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: number,
    title: prResponse.data.title ?? "",
    description: prResponse.data.body ?? "",
  };
}

export async function getDiff(
  owner: string,
  repo: string,
  pull_number: number
): Promise<string | null> {
  core.info(`Fetching diff for PR #${pull_number}...`);

  const response = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
    mediaType: { format: "diff" },
  });

  // @ts-expect-error - response.data is a string
  return response.data;
}

export async function hasExistingReview(
  owner: string,
  repo: string,
  pull_number: number
): Promise<boolean> {
  const reviews = await octokit.pulls.listReviews({
    owner,
    repo,
    pull_number,
  });
  return reviews.data.length > 0;
}

export async function createReviewComment(
  owner: string,
  repo: string,
  pull_number: number,
  comments: Array<GithubComment>
): Promise<void> {
  core.info(`Creating review comment for PR #${pull_number}...`);

  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number,
    comments,
    event: APPROVE_REVIEWS ? "APPROVE" : "COMMENT",
  });

  core.info(
    `Review ${APPROVE_REVIEWS ? "approved" : "commented"} successfully.`
  );
}

export async function getCompareDiff(
  owner: string,
  repo: string,
  base: string,
  head: string
): Promise<string> {
  const response = await octokit.repos.compareCommits({
    headers: {
      accept: "application/vnd.github.v3.diff",
    },
    owner,
    repo,
    base,
    head,
  });

  return String(response.data);
}

export async function getEventData() {
  return JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH ?? "", "utf8"));
}
