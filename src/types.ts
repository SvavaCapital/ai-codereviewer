export interface PRDetails {
  owner: string;
  repo: string;
  pull_number: number;
  title: string;
  description: string;
}

export interface AICommentResponse {
  file: string;
  lineNumber: string;
  reviewComment: string;
}

export interface GithubComment {
  body: string;
  path: string;
  line: number;
}

export interface GitHubEvent {
  action: string;
  number: number;
  repository: {
    full_name: string;
    name: string;
    owner: { login: string };
  };
  issue: {
    number: number;
  };
}
