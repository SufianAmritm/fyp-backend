import { ConsoleLogger, Injectable } from '@nestjs/common';
import chalk from 'chalk';

@Injectable()
export class ColoredLogger extends ConsoleLogger {
  log(message: string) {
    super.log(chalk.yellowBright(message));
  }

  error(message: string, trace?: string) {
    super.error(chalk.red(message), trace);
  }

  warn(message: string) {
    super.warn(chalk.yellow(message));
  }

  debug(message: string) {
    super.debug(chalk.blue(message));
  }

  verbose(message: string) {
    super.verbose(chalk.magenta(message));
  }
}
