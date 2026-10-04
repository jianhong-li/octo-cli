import { type Command, CommanderError } from 'commander';

/** Transport and API failures retain their machine-readable status and code. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Keep command failures on stderr and leave stdout available for data pipes. */
export async function runCli(
  program: Command,
  args = process.argv
): Promise<void> {
  const jsonErrors = args.includes('--json-errors');
  function captureExits(command: Command): void {
    command.exitOverride();
    for (const child of command.commands) captureExits(child);
  }
  captureExits(program);
  program.configureOutput({
    writeErr: (text) => {
      if (!jsonErrors) process.stderr.write(text);
    },
  });
  try {
    await program.parseAsync(args);
  } catch (error) {
    if (error instanceof CommanderError && error.exitCode === 0) return;
    const message = (
      error instanceof Error ? error.message : String(error)
    ).replace(/[\r\n]+/g, ' ');
    const details = {
      message,
      ...(error instanceof ApiError
        ? { status: error.status, code: error.code }
        : {}),
    };
    if (jsonErrors) console.error(JSON.stringify({ error: details }));
    else if (!(error instanceof CommanderError)) {
      const prefix =
        error instanceof ApiError
          ? `HTTP ${error.status}${error.code === undefined ? '' : `, code=${error.code}`}: `
          : '';
      console.error(`Error: ${prefix}${message}`);
    }
    process.exitCode = 1;
  }
}
