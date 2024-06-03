import { type Labels, type LogLevel, type LogFn } from './types';
import { type Backend } from './backend';
import { merge } from './merge';

export type LogChildParams = {
  labels?: Labels;
  details?: object;
};

export type LogParams = {
  level: LogLevel;
  labels?: Labels;
  details?: object;
  backend: Backend;
};

export class Log {
  private _level: LogLevel;
  private _labels?: Labels;
  private _details?: object;
  private _backend: Backend;
  
  public trace!: LogFn;
  public debug!: LogFn;
  public info!: LogFn;
  public warn!: LogFn;
  public error!: LogFn;
  public fatal!: LogFn;
  
  constructor(params: LogParams) {
    const {
      level,
      labels,
      details,
      backend,
    } = params;
    
    this._level = level;
    this._labels = labels;
    this._details = details;
    this._backend = backend;
    
    this._reset();
  }
  
  private _reset(): void {
    const levels: LogLevel[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
    const target = levels.indexOf(this._level);
    const noop = () => {};
    
    for (let i = 0; i < levels.length; i++) {
      const method = levels[i];
      this[method] = (i <= target) ? this._make(method) : noop;
    }
  }
  
  private _make(level: LogLevel): LogFn {
    return (maybeDetailsOrMsg?: object | string, maybeMsg?: string) => {
      const [details, msg] = (typeof maybeDetailsOrMsg == 'object')
        ? [maybeDetailsOrMsg, maybeMsg]
        : [undefined, maybeDetailsOrMsg]
      ;
      
      const now = new Date();
      
      this._backend.write({
        time: now.toISOString(),
        level,
        labels: this._labels,
        details: merge(this._details, details),
        msg,
      });
    };
  }
  
  public child(params?: LogChildParams): Log {
    const {
      labels,
      details,
    } = params ?? {};
    
    return new Log({
      level: this._level,
      labels: merge(this._labels, labels),
      details: merge(this._details, details),
      backend: this._backend,
    });
  }
}

export function createLog(params: LogParams): Log {
  return new Log(params);
}
