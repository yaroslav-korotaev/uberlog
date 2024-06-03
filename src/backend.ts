import { type Labels, type LogLevel } from './types';

export type Line = {
  time: string;
  level: LogLevel;
  labels?: Labels;
  details?: object;
  msg?: string;
};

export type Backend = {
  write(line: Line): void;
};

export function createNoopBackend(): Backend {
  return {
    write() {},
  };
}
