import * as core from "@actions/core";
import { runReview } from "./review";

core.info("Starting AI code review action...");
core.info("Testing: 1 Refactor code...");
runReview().catch((error) => {
  core.error("Unhandled error in main function:", error);
  core.setFailed(
    `Unhandled error in main function: ${(error as Error).message}`
  );
  process.exit(1);
});
