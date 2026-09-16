---
name: github-pr-review
description: Reviews GitHub Pull Requests, analyzes diffs, and validates existing review comments for relevance. Use when the user provides a GitHub PR URL, asks to review a PR, or check whether existing review comments are still relevant.
---

# GitHub PR Review and Comment Validation

## Reviewing a PR

When a GitHub PR URL is provided:

1. **Analyze the changes:** Inspect the diff and every file modified by the PR.
2. **Apply the checklist:** Evaluate the incoming code using the `code-review-checklist` skill's criteria (logical bugs, edge cases, security, and performance). Read `.agents/skills/code-review-checklist/SKILL.md` first.

## Validating Existing Comments

If the PR already contains comments from other reviewers:

1. **Relevance:** Determine whether each comment still applies. Mark it if the issue has already been fixed in newer commits.
2. **Validity:** Check each comment against the current checklist. Point out any comment that conflicts with the project's standards or the checklist.

## Response Format

Use the following format for every finding, whether new or an existing PR comment:

- **Location:** [File : Line]
- **Status:** (New / Confirmed / Fixed / Outdated)
- **Severity:** (High / Medium / Low)
- **Issue:** A concise description of the problem based on the checklist.
- **Recommendation:** A concrete example of the corrected code.
