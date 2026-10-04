import type { Command } from 'commander';

const manual = 'https://github.com/kanyun-inc/octo-cli#readme';
const openApi =
  'https://octopus-docs.zhenguanyu.com/1b42090d16b681749335c62b3ed505be';
const apiPages: Record<string, string> = {
  logs: '1b42090d16b6815aa654e13c4de66ba4',
  issues: '1b42090d16b681a4b2b5f600cd9a7ba7',
  alerts: '1b42090d16b68152ae92d28056308156',
  services: '1b42090d16b681e786c6ce18ac45b1f3',
  metrics: '1b42090d16b68113bc99ebbbfcef6f1d',
  trace: '1b42090d16b6812ba97cea1d2cbbd63e',
  llm: '26f2090d16b680b39592ee187ea8e105',
  rum: '26f2090d16b680209b69d9ac21d1a906',
  events: '2af2090d16b6809c827bc15fa208e7bb',
  users: '2232090d16b68048b441d1456a7ac374',
};
const installed = new WeakSet<Command>();

const examples: Record<string, string[]> = {
  login: ['octo login --token <PAT> --env online --skip-skill'],
  init: ['octo init .'],
  mcp: ['octo mcp'],
  'mcp-install': ['octo mcp-install --scope user'],
  'logs search': [
    'octo logs search -e online -q "service = myapp AND level = ERROR" -l 15m -n 50',
    'octo logs search -q "trace_id = <TRACE_ID>" --from 1790596500000 --to 1790596800000 --order asc --scroll-id <LAST_LOG_ID>',
    'octo logs search -q "service = myapp" -e online --from 1790596500000 --to 1790596800000 --order asc -o jsonl --cursor-file /tmp/logs.cursor > /tmp/logs.jsonl',
  ],
  'logs aggregate': [
    'octo logs aggregate -q "service = myapp AND level = ERROR" -l 30m -g k8s.pod.name:20 -a "*:count"',
  ],
  'trace search': [
    'octo trace search -q "trace_id = <TRACE_ID>" -l 1h -n 100',
    'octo trace search -q "service = myapp" --from 1790596500000 --to 1790596800000 --scroll-id <LAST_RECORD_ID>',
  ],
  'trace aggregate': [
    'octo trace aggregate -q "service = myapp" -a duration:p95 -g service:10 -l 15m',
  ],
  'alerts search': [
    'octo alerts search -s firing -p P0,P1 --service myapp -l 1h',
    'octo alerts search -s all -e test -l 1d',
  ],
  'alerts rules': [
    'octo alerts rules --group-id -1 -e online,test --status-list enabled --types log,metric --page 1 --page-size 20',
  ],
  'alerts groups': ['octo alerts groups'],
  'alerts rule-details': ['octo alerts rule-details --ids 101,102'],
  'alerts detail': ['octo alerts detail 12345'],
  'alerts timeseries': ['octo alerts timeseries 12345 --condition-id 0 -l 1h'],
  'alerts silence': [
    'octo alerts silence --rule-id 101 --alert-id 12345 --duration 2h',
  ],
  'alerts unsilence': ['octo alerts unsilence 101'],
  'alerts disable': [
    'octo alerts disable --rule-id 101 --duration 2h --reason "maintenance"',
  ],
  'alerts disables': ['octo alerts disables 101'],
  'alerts enable': ['octo alerts enable <DISABLE_RECORD_ID>'],
  'alerts create': ['octo alerts create --file rules.json'],
  'alerts delete': ['octo alerts delete 101'],
  'issues search': [
    'octo issues search -q "service = myapp" --status unresolved --sort logCount -l 1h',
    'octo issues search --source rum -e test --status all -l 1h',
  ],
  'issues detail': [
    'octo issues detail <ISSUE_ID>',
    'octo issues detail <RUM_ISSUE_ID> --source rum',
  ],
  'issues ai-analysis': [
    'octo issues ai-analysis <ISSUE_ID> --context "Errors started after deployment"',
  ],
  'issues assign': ['octo issues assign --user 123 --ids id1,id2 --source log'],
  'issues update': [
    'octo issues update --ids id1,id2 --status resolved -e online',
    'octo issues update --ids id1 --status ignored --ignore-type TIME --ignore-end-time "2026-10-05T00:00:00+08:00"',
  ],
  'issues merge': ['octo issues merge --ids id1,id2 --source log'],
  'issues unmerge': ['octo issues unmerge <MERGE_ISSUE_ID> --ids child1'],
  'issues merge-children': [
    'octo issues merge-children <ISSUE_ID> --source log',
  ],
  'cases list': [
    'octo cases list --status todo --priority P1 --page 1 --page-size 20',
  ],
  'cases create': [
    'octo cases create --name "Checkout incident" --group-id 1 --priority P0',
  ],
  'cases detail': ['octo cases detail 123'],
  'cases detail-key': ['octo cases detail-key <CASE_KEY>'],
  'cases update': ['octo cases update 123 --status doing --assigner-id 456'],
  'cases delete': ['octo cases delete 123'],
  'cases link': ['octo cases link 123 --type alert --target-id 12345'],
  'cases unlink': ['octo cases unlink 123 <RELATION_ID>'],
  'cases note': ['octo cases note 123 --text "Owner investigating"'],
  'cases note-update': [
    'octo cases note-update 123 <NOTE_ID> --text "Fix verified"',
  ],
  'cases groups': ['octo cases groups'],
  'cases group-create': [
    'octo cases group-create --name "Production incidents"',
  ],
  'inspection reports': [
    'octo inspection reports -q db --result abnormal -l 1d --page 1 -n 10',
  ],
  'metrics query': [
    'octo metrics query "sum(http_requests{}.as_count)" -l 1h --points 150',
    'octo metrics query "avg(cpu_usage{service=myapp})" -e test -l 2h',
  ],
  'metrics point': [
    'octo metrics point "sum(http_requests{}.as_count)" --at 1790596560000',
  ],
  'services list': ['octo services list -e online -l 1h'],
  'services entries': ['octo services entries myapp -l 1h'],
  'services topo': [
    'octo services topo myapp -l 1h --entry-span-name <ENTRY_NAME> --entry-span-operation <ENTRY_OPERATION>',
  ],
  llm: [
    'octo llm -q "application.name = myapp" -l 1h -n 20',
    'octo llm --from 1790596500000 --to 1790596800000 --scroll-id <LAST_ID> --scroll-type next --serialized-sort-values <LAST_SORT_VALUES>',
  ],
  'rum list': [
    'octo rum list -e test -q "application.name = myapp AND type = resource" -l 1h -n 20',
  ],
  'rum detail': [
    'octo rum detail <RUM_EVENT_ID> -e test --timestamp 1790596560000',
  ],
  'rum aggregate': [
    'octo rum aggregate -q "type = view" -a "*:count" -g view.name:10 -l 1h',
  ],
  'events list': [
    'octo events list -q "service = myapp AND type = deployment.scale" -l 1d',
  ],
  'events aggregate': ['octo events aggregate -a "*:count" -g type:10 -l 1d'],
  'event-subscriptions list': [
    'octo event-subscriptions list -e online --status ENABLED --page 1 --page-size 20',
  ],
  'event-subscriptions detail': ['octo event-subscriptions detail 123'],
  'event-subscriptions create': [
    'octo event-subscriptions create --file subscription.json',
  ],
  'event-subscriptions update': [
    'octo event-subscriptions update 123 --file subscription.json',
  ],
  'event-subscriptions enable': ['octo event-subscriptions enable 123'],
  'event-subscriptions disable': ['octo event-subscriptions disable 123'],
  'event-subscriptions delete': ['octo event-subscriptions delete 123'],
  'event-webhooks list': [
    'octo event-webhooks list --request-format DEFAULT --page 1 --page-size 20',
  ],
  'event-webhooks detail': ['octo event-webhooks detail 123'],
  'event-webhooks create': ['octo event-webhooks create --file webhook.json'],
  'event-webhooks update': [
    'octo event-webhooks update 123 --file webhook.json',
  ],
  'event-webhooks test': ['octo event-webhooks test --file webhook.json'],
  'event-webhooks delete': ['octo event-webhooks delete 123'],
  users: ['octo users alice bob'],
};

function commandKey(command: Command): string {
  const parts: string[] = [];
  for (let current = command; current.parent; current = current.parent)
    parts.unshift(current.name());
  return parts.join(' ');
}

const searchNotes = `Search syntax (not Lucene): field = value, !=, in (...), AND/OR/NOT.
  Analysis fields also support numeric comparisons: >, >=, <, <=.
  Fields/values are case-sensitive. Operators are case-insensitive.
  Wildcards work in field filters: service = web*. Full-text matching is
  tokenized, not substring/prefix matching; quoted text does not bypass
  tokenization. For zero hits, check a known matching query in the same window.
  attributes.* is a response path; use query field names such as status/path.
  Trace correlation uses trace_id in queries (traceId in returned records).`;

const aggregationNotes = `Aggregation:
  Repeat -a and -g for multiple operations/dimensions. Default: -a "*:count".
  Group limit defaults to 10; each limit and the product of all limits <= 1000.
  Groups sort descending by the FIRST -a operation. fields:{} is the total row.
  Only analysis fields support group-by. Field availability varies by source
  and index; a field catalog entry alone does not prove it is groupable.
  Probe -g <field>:2 on known matching data and inspect the returned fields.
  count works for all fields; count_distinct for dimensions; numeric fields
  support sum/avg/max/min/p50/p95/p99. A wrong type/operation can return -210;
  grouping a metric field can return -222. Missing groups produce a warning.`;

function leafNotes(command: Command, key: string): string[] {
  const options = new Set(command.options.map((option) => option.long));
  const notes: string[] = [];
  if (options.has('--last')) {
    const last = command.options.find(
      (option) => option.long === '--last'
    )?.defaultValue;
    notes.push(`Time: ${key === 'inspection reports' ? 'no time filter unless specified' : `last ${last ?? '15m'} by default`}. Durations: 30s, 15m, 1h, 2d, 1w.
  --from/--to accept 13-digit epoch ms, 10-digit epoch seconds, or ISO dates.
  --from overrides --last; omitted --to means now. --to requires --from.
  Use an explicit timezone (Z or +08:00); dates without it use local time.`);
  }
  if (options.has('--output'))
    notes.push(`Output: json preserves the complete API response, including pagination metadata.
  jsonl emits one record per line; table shows record columns. Page envelopes
  (logs/spanItems/rumItems/eventItems/issues/list) are unpacked for jsonl/table.
  Pagination warnings go to stderr. Use -o json when you need hasMore/cursors.`);
  if (options.has('--query') && key !== 'inspection reports')
    notes.push(searchNotes);
  if (options.has('--agg')) notes.push(aggregationNotes);
  if (options.has('--scroll-id'))
    notes.push(`Pagination: one page per invocation; hasMore=true means results are incomplete.
  Keep env, query, order/sort, and an absolute --from/--to window unchanged.
  --scroll-id is the boundary record's id, NOT serializedSortValues.
  ${key === 'logs search' || key === 'trace search' ? 'Use the last record id to continue forward; traceId/spanId are not cursors.' : 'For next use the last record; for pre use the first record. Pass its\n  serializedSortValues separately when continuing a sorted query.'}`);
  if (key === 'logs search' || key === 'trace search')
    notes.push(
      'The API documents serializedSortValues alongside scrollId. Preserve the returned\n  opaque value and pass it as --serialized-sort-values when continuing; never\n  substitute it for the record id. --serialized-sort-values requires --scroll-id.'
    );
  if (options.has('--cursor-file'))
    notes.push(`Cursor file: --cursor-file <path> atomically replaces a single-line JSON file
  after a successful page, for json/jsonl/table; stdout keeps its normal format.
  {"hasMore":true,"count":N,"scrollId":"...","serializedSortValues":"..."}
  Terminal pages write {"hasMore":false,"count":N}, clearing the previous cursor.
  Missing hasMore/lastPage means hasMore:null (e.g. RUM); never infer from size.
  Unknown nonempty pages include a boundary; unknown empty pages have no cursor.
  Sort values are optional and remain opaque, from the same record as scrollId.
  For next use the last record; for pre use the first (logs/Trace use the last).
  HTTP/API/file-write failures exit nonzero and leave the previous file untouched.
  Read only after exit 0. Parent directory must exist. No automatic file reading.
  Continue with identical env/query/from/to/order/sort/scroll-type, using an
  absolute time window. Pass optional cursor values only when present/nonempty:
  jq -r '.scrollId // empty' /tmp/logs.cursor
  jq -r '.serializedSortValues // empty' /tmp/logs.cursor
  Use one file per query stream and per concurrent worker; sharing a file
  between concurrent writers is unsafe — the atomic replace prevents torn
  reads, not lost updates. A stale file only means retry material; always
  gate on exit 0.`);
  if (key === 'trace search')
    notes.push('--order sorts by span END time (asc/desc), not start time.');
  if (options.has('--sort-operation'))
    notes.push(
      'Documented sort operationEnum values: none, count, sum, max, min, avg,\n  count_distinct, p10, p25, p50, p75, p80, p90, p95, p99, p999, p9999, heatmap,\n  percentile. Custom percentile also requires percentile/percentileValue API\n  fields, which this CLI does not expose; use a named percentile such as p95.'
    );
  if (key === 'issues search' || key === 'issues detail')
    notes.push(
      'Issue source: --source log (backend default) or rum. Use rum for RUM Issues;\n  this source is independent of the environment.'
    );
  if (key === 'issues search')
    notes.push(
      'API limitation: Issue search returns at most 99 Issues and has no page/limit/scroll\n  parameters. hasMore=true indicates truncation, not an available next-page cursor.\n  Narrow the service/query/time window; this CLI cannot guarantee an exhaustive\n  Issue list. Use --status all to include all states.'
    );
  if (key === 'rum detail')
    notes.push(
      'Required: --timestamp must be the event timestamp returned by rum list.\n  Accepts 13-digit epoch ms, 10-digit epoch seconds, or ISO time. The backend\n  searches within one hour on either side of it; using now can miss old events.\n  Use the same environment as rum list. The record id alone is insufficient.'
    );
  if (
    key === 'alerts search' ||
    key === 'alerts rules' ||
    key === 'event-subscriptions list'
  )
    notes.push(
      'Environment: omitting --env queries all environments; no configured default is applied.'
    );
  if (key.startsWith('events '))
    notes.push(
      'Change-event types include deployment.start, deployment.success, deployment.failure,\n  deployment.scale, config.change, k8s.pod.change, k8s.node.change.\n  type = deployment does not include deployment.scale; use an explicit type or deployment*.'
    );
  if (key === 'metrics query')
    notes.push(
      'Metric QL differs from search syntax: wrap metric{tags} in an aggregation.\n  Multiple queries are labeled A/B/C; grouped series use matching labelList/values\n  arrays. --points is a target count; the backend may adjust it.\n  Day aggregations align to UTC+8; supplied timestamps are not shifted.'
    );
  if (key === 'metrics point')
    notes.push(
      '--at accepts epoch milliseconds, epoch seconds, or ISO timestamps; default: now.'
    );
  if (['alerts silence', 'alerts unsilence'].includes(key))
    notes.push(
      'Silence suppresses notifications for a firing alert; it does not stop rule evaluation.'
    );
  if (['alerts disable', 'alerts disables', 'alerts enable'].includes(key))
    notes.push(
      'Disable records stop rule evaluation during a scheduled time window.\n  alerts enable deletes a DISABLE RECORD by its id; it does not activate a rule.'
    );
  if (key === 'alerts create')
    notes.push(
      '--file contains a JSON array of rule objects; all rule fields pass through to the API.'
    );
  if (key === 'issues update')
    notes.push(
      'Ignore-rule arguments require --status ignored. TIME requires --ignore-end-time;\n  APPEAR_COUNT requires --appear-count; USER_COUNT requires --user-count and,\n  for source=log, --user-field. Windows use --start-timestamp and --time-window-ms.'
    );
  if (key === 'issues merge')
    notes.push(
      'Requires at least two distinct Issue IDs; returns the canonical merge Issue ID.'
    );
  if (key === 'issues unmerge')
    notes.push(
      'The backend may dissolve a merge Issue when fewer than two children remain.'
    );
  if (key === 'login')
    notes.push(
      'PAT is saved in ~/.octo-cli/config.json. --skip-skill configures the standalone\n  CLI without installing agent skills. Otherwise login installs the skill globally.'
    );
  if (key === 'init')
    notes.push(
      'Creates a project context template and installs the agent skill for the project.\n  CLI queries do not require init.'
    );
  if (key === 'event-subscriptions create')
    notes.push(
      'JSON object: name, environment (online/test), filter, webhookId; optional description.\n  New subscriptions are DISABLED; enable explicitly after checking the configuration.'
    );
  if (key === 'event-subscriptions update')
    notes.push(
      'JSON object: name, filter, webhookId; optional description. Environment is immutable.'
    );
  if (key.startsWith('event-webhooks ') && options.has('--file'))
    notes.push(
      'JSON object: name, url, requestFormat (DEFAULT/CUSTOM); optional headers/bodyTemplate.\n  CUSTOM requires a bodyTemplate. The test command sends a real HTTP request to url.'
    );
  return notes;
}

/** Help lives with the CLI and never needs authentication or a skill install. */
export function configureCommandHelp(program: Command): void {
  function visit(command: Command): void {
    const key = commandKey(command);
    const apiReference = apiPages[key.split(' ')[0]]
      ? `https://octopus-docs.zhenguanyu.com/${apiPages[key.split(' ')[0]]}`
      : openApi;
    if (!installed.has(command)) {
      installed.add(command);
      for (const option of command.options) {
        if (option.long === '--env') {
          option.description =
            key === 'login'
              ? 'Default environment: online or test (omit to preserve saved value)'
              : key === 'alerts rules'
                ? 'Environments: online,test (comma-separated; omit for all)'
                : ['alerts search', 'event-subscriptions list'].includes(key)
                  ? 'Environment: online or test (omit for all)'
                  : 'Environment: online or test (default: OCTOPUS_ENV, config.env, then online)';
        }
        if (option.long === '--priority' && key.startsWith('alerts '))
          option.description =
            'Priorities: UNKNOWN,P0,P1,P2 (comma-separated; omit for all)';
        if (option.long === '--url' && key === 'login')
          option.description =
            'OpenAPI base URL (omit to preserve saved value)';
        if (option.long === '--output')
          option.description =
            'Output: json (complete response), jsonl (records), table (record columns)';
        if (option.long === '--from')
          option.description =
            'Start time: epoch ms, epoch seconds, or ISO; overrides --last';
        if (option.long === '--to')
          option.description =
            'End time: epoch ms, epoch seconds, or ISO; requires --from (default: now)';
        if (option.long === '--at')
          option.description =
            'Point time: epoch ms, epoch seconds, or ISO (default: now)';
        if (option.long === '--scroll-id' && key === 'logs search')
          option.description =
            'Last log id from previous page, not serializedSortValues';
        if (
          option.long === '--limit' &&
          ['logs search', 'trace search'].includes(key)
        )
          option.description = 'Records per page (1-500)';
      }
      command.addHelpText('after', () => {
        if (!command.parent)
          return `\nQuick start (standalone CLI):
  octo login --token <PAT> --skip-skill
  octo logs search -q "service = myapp AND level = ERROR" -l 15m
  octo logs search --help

Use octo <group> --help to discover tasks and <group> <command> --help for
options, defaults, examples, query semantics, and pagination instructions.
No skill installation or project init is required for CLI queries.
Auth: OCTOPUS_TOKEN overrides ~/.octo-cli/config.json token.
Config: OCTOPUS_BASE_URL overrides config.base_url; default:
  https://octopus-app.zhenguanyu.com
OCTOPUS_ENV overrides config.env (online/test); fallback: online.
OCTOPUS_EXTRA_HEADERS accepts a JSON object of additional HTTP headers.
Failures: exit code 1, concise stderr, no stack trace. --json-errors emits
{error:{message,status?,code?}} to stderr; stdout remains available for data.
HTTP failures and nonzero API codes are errors. No automatic retries;
rate limits (HTTP 429/code -17) require caller backoff. Successful empty
responses cannot reveal backend failures masked by the server.
Full manual: ${manual}
OpenAPI: ${openApi}`;
        if (command.commands.length) {
          const details = command.commands.map((child) => {
            const relevant = child.options.filter((option) =>
              [
                '--last',
                '--limit',
                '--page',
                '--page-size',
                '--points',
                '--status',
                '--env',
              ].includes(option.long ?? '')
            );
            return `  octo ${commandKey(child)}: ${child.description()}\n    ${relevant.map((option) => `${option.flags}${option.defaultValue === undefined ? '' : ` (default: ${option.defaultValue})`}`).join('; ') || 'See command help for arguments/options.'}`;
          });
          const groupExamples = command.commands
            .flatMap((child) => examples[commandKey(child)]?.slice(0, 1) ?? [])
            .slice(0, 3);
          return `\nTasks and common options (pass options AFTER the subcommand):\n${details.join('\n')}\n\nExamples:\n${groupExamples.map((example) => `  ${example}`).join('\n')}\n\nUse octo ${key} <command> --help for value domains and query/pagination semantics.${key === 'events' ? '\nBare octo events defaults to events list; octo events list --help shows all query flags.' : ''}\nFull manual: ${manual}\nOpenAPI: ${apiReference}`;
        }
        return `\n${leafNotes(command, key).join('\n\n')}\n\nExamples:\n${(examples[key] ?? []).map((example) => `  ${example}`).join('\n')}\n\nFailures: exit code 1; use octo --json-errors ${key} ... for JSON errors on stderr.\nFull manual: ${manual}\nOpenAPI: ${apiReference}`;
      });
    }
    for (const child of command.commands) visit(child);
  }
  visit(program);
}
