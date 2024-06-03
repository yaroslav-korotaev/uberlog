export type Labels = Record<string, string>;

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogFn = {
  (msg?: string): void;
  (details?: object, msg?: string): void;
};
