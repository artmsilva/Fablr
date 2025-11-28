# Agent Progress Tracking

This workflow keeps asynchronous agents aligned across user threads by recording the state of every engagement inside the repo. It favors lightweight markdown updates that still provide enough context for the next hand-off.

## Files & Directories

- `ops/threads/README.md` &mdash; canonical index of every thread with owner, status, and link to the detailed log.
- `ops/threads/<id>-<slug>.md` &mdash; individual progress logs (one per active thread). Use lowercase hyphenated slugs.
- `ops/threads/TEMPLATE.md` &mdash; copy/paste skeleton for new logs.

Commit these files so Git history becomes the audit trail.

## Workflow

1. **Spin up a new thread**
   - Copy `ops/threads/TEMPLATE.md` to `ops/threads/<date>-<slug>.md`.
   - Fill in the header metadata (owner, purpose, start date) and list the first set of deliverables.
   - Add a row in `ops/threads/README.md` pointing to the new log.
2. **Log progress**
   - Append dated entries under `## Timeline` describing what changed, blockers, and next checkpoints.
   - Update the status badge in both the log and the index (e.g., `Active`, `Blocked`, `Reviewing`, `Done`).
   - Reference commits/PRs or docs using repo-relative paths with line numbers when possible.
3. **Hand off to another agent**
   - Ensure the `## Hand-off Notes` section calls out pending decisions, open questions, and explicit “Next Action” bullets.
   - Mention where to resume (e.g., component, spec, script) and link to any relevant snippet/issue/discussion.
4. **Close the thread**
   - Mark status as `Done`, capture a brief retrospective under `## Outcome`, and archive the final result (links to PRs, docs, demo URLs).
   - Update the index table so future readers know the thread is complete.

## Status Values

| Status      | Meaning                                              |
| ----------- | ---------------------------------------------------- |
| `Planned`   | Scoped but no work committed yet.                    |
| `Active`    | Currently being worked.                              |
| `Blocked`   | Waiting on user input, dependency, or failing checks.|
| `Reviewing` | Awaiting confirmation/QA before closing.             |
| `Done`      | Complete; log should include outcome + links.        |

Stick to these values so dashboards stay consistent.

## Logging Tips

- Prefer short paragraphs or bullet lists per timeline entry; include timestamps (ISO or `YYYY-MM-DD HH:MM PT`).
- Call out testing performed, open risks, and TODOs in each update to reduce backscroll in the CLI transcript.
- Cross-link specs/ADRs when relevant (e.g., `docs/specs/router.md#L10`).
- If a thread spans multiple specs, split it into subheadings inside the log rather than spinning up completely new files unless ownership changes.

## Quick Checklist

- [ ] New thread log created from template.
- [ ] Index updated with owner, status, and description.
- [ ] Timeline entry added after every meaningful push or blocker.
- [ ] Hand-off notes refreshed before pausing/unloading the agent.
- [ ] Thread marked `Done` with outcome + links once shipped.

Consistent use of this system keeps multi-agent work auditable without extra tooling.
