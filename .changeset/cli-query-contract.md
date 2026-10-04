---
'octo-cli': minor
---

Make the CLI usable through its own help and expose supported query continuation and topology filters.

- Fix record-per-line JSONL and record tables for paginated responses; preserve complete JSON responses and send continuation warnings to stderr.
- Add trace cursors, log sort cursors, LLM/RUM/event scroll and sort flags, and topology entry filters.
- Expose the documented log/RUM Issue source for search and detail in CLI and MCP; link built-in help to the official OpenAPI reference and clarify log sort cursors and trace end-time ordering.
- Send the required environment for CLI and MCP RUM detail; accept epoch milliseconds/seconds for metric point timestamps.
- Reject invalid environments, enum values, malformed limits, orphan end times, and excessive aggregation dimensions. Warn when requested group fields are missing from aggregate results.
- Report failures without Node stack traces; add global `--json-errors` with HTTP status and API code on stderr.
- Document actual defaults, value domains, examples, query/aggregation constraints, pagination, and the Issue search API's lack of documented pagination controls in built-in help.

JSONL now emits records instead of page envelopes; use `--output json` for pagination metadata or consumers that require the prior envelope shape.
