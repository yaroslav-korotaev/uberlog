export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent';

export type LogLine = {
  time: string;
  level: LogLevel;
  msg?: string;
  err?: Error;
  [key: string]: any;
};

export type LogFormat<T> = (line: LogLine) => T | undefined;

export type LogStream<T> = {
  write: (value: T) => void;
};

export type LogObject = {
  err?: Error;
  [key: string]: any;
};

export type LogFn = {
  (msg?: string): void;
  (obj: LogObject): void;
  (obj: LogObject, msg?: string): void;
};

const METHODS: LogLevel[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
const noop = () => {};

export type LogOptions<T> = {
  level: LogLevel;
  bindings?: object;
  format: LogFormat<T>;
  stream: LogStream<T>;
};

export class Log<T> {
  private level: LogLevel;
  private bindings?: object;
  private format: LogFormat<T>;
  private stream: LogStream<T>;
  
  public trace!: LogFn;
  public debug!: LogFn;
  public info!: LogFn;
  public warn!: LogFn;
  public error!: LogFn;
  public fatal!: LogFn;
  
  constructor(options: LogOptions<T>) {
    const {
      level,
      bindings,
      format,
      stream,
    } = options;
    
    this.level = level,
    this.bindings = bindings;
    this.format = format;
    this.stream = stream;
    
    this.init();
  }
  
  private init(): void {
    const target = METHODS.indexOf(this.level);
    
    for (let i = 0; i < METHODS.length; i++) {
      const method = METHODS[i] as Exclude<LogLevel, 'silent'>;
      this[method] = (i <= target) ? this.make(method) : noop;
    }
  }
  
  private make(level: LogLevel): LogFn {
    return (objOrMsg?: LogObject | string, maybeMsg?: string) => {
      const [obj, msg] = (typeof objOrMsg == 'object')
        ? [objOrMsg, maybeMsg]
        : [undefined, objOrMsg]
      ;
      
      const now = new Date();
      const line: LogLine = {
        time: now.toISOString(),
        level,
        msg,
      };
      Object.assign(line, this.bindings);
      Object.assign(line, obj);
      
      const value = this.format(line);
      if (value) {
        this.stream.write(value);
      }
    };
  }
  
  public child(bindings?: object): Log<T> {
    return new Log({
      level: this.level,
      bindings: Object.assign({}, this.bindings, bindings),
      format: this.format,
      stream: this.stream,
    });
  }
}
