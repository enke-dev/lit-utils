/**
 * A custom console wrapper class to provide convenience methods for logging.
 * It also ships with a {@link Console.f | static formatting template method} to format messages.
 *
 * @todo allow setting a log level to filter messages
 *
 * @example
 * Using the format method to create a formatted message:
 *
 * ```ts
 * console.log(Console.f`This is a message with a <code>formatted</code> part.`);
 * ```
 */
export class Console {
  static f(raw: TemplateStringsArray, ...values: unknown[]): string[] {
    const reset = 'all: unset';
    const styles: string[] = [];
    const message = String.raw({ raw }, ...values).replace(/<code>|<\/code>/g, match => {
      switch (match) {
        case '<code>':
          styles.push(
            'font-family: monospace; color: #f4f4f4; background: #212121; padding: 2px 4px; border-radius: 4px;'
          );
          return '%c';
        case '</code>':
          styles.push(reset);
          return '%c';
        default:
          return match;
      }
    });
    return [message, ...styles];
  }

  readonly #logger;
  constructor(ctor: typeof window.console) {
    this.#logger = ctor;
  }

  f = Console.f;

  error(...message: unknown[]) {
    this.#logger.error(...message);
  }

  log(...message: unknown[]) {
    this.#logger.log(...message);
  }

  info(...message: unknown[]) {
    this.#logger.info(...message);
  }

  warn(...message: unknown[]) {
    this.#logger.warn(...message);
  }
}

/**
 * A {@link Console | wrapper for the console} to provide some convenience methods.\
 * Just import it, and the global usages are replaced with this wrapper.
 *
 * @implements {@link Console}
 *
 * @example
 * ```ts
 * import { console } from '@enke.dev/lit-utils/lib/utils/log.utils.js';
 *
 * console.log('This message is logged using the custom console wrapper.');
 */
export const console = new Console(window.console);
