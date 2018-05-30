import * as minimist from 'minimist';
import * as URL from 'url';

import { AppOptions } from './model/AppOptions';
import { InvalidArgumentException } from './model/InvalidArgumentException';

export class AppOptionsParser {
  parse(): AppOptions {
    // Get command line arguments
    const args: minimist.ParsedArgs = minimist(process.argv.slice(2), {
      alias: {
        h: 'help',
        o: 'output',
        p: 'parallel',
        n: 'numchunks',
        s: 'chunksize',
        v: 'verbose'
      }
    });

    const hasHelpArg: boolean = args.hasOwnProperty('help');
    if (hasHelpArg) {
      return;
    }

    // Get URL, the assumption is that we only support one url
    const hasUrl: boolean = (args.hasOwnProperty('_') && args._.length > 0);
    if (!hasUrl) {
      throw new InvalidArgumentException('URL is missing');
    }
    const url: string = args._[0];

    const filename: string = this.getOutputFilename(args, url);
    const isParallel: boolean = args.hasOwnProperty('parallel');
    const numChunks: number = this.getArgValue(args, 'numchunks', 'Number of chunks', true) as number;
    const chunkSizeBytes: number = this.getArgValue(args, 'chunksize', 'Chunks size (bytes)', true) as number;
    const verboseMode: boolean = args.hasOwnProperty('verbose');

    const appOptions: AppOptions = { url, filename, isParallel, numChunks, chunkSizeBytes, verboseMode };
    return appOptions;
  }

  showUsage(): void {
    const command: string = 'ts-node index';
    const lines: string[] = [];
    lines.push(`Usage: ${command} [OPTIONS] url`);
    lines.push('  -o string');
    lines.push('        Write output to <file> instead of default');
    lines.push('  -p');
    lines.push('        Download chunks in parallel instead of sequentally');
    lines.push('  -n number');
    lines.push('        Number of chunks to download');
    lines.push('  -s number');
    lines.push('        Size of chunks to download in bytes');
    lines.push('  -v');
    lines.push('        Enable verbose mode');
    const message: string = lines.join('\n');
    console.log(message);
  }

  private getOutputFilename(args: minimist.ParsedArgs, url: string): string {
    let outputFilename: string = this.getArgValue(args, 'output', 'Output filename', false) as string;
    if (outputFilename === undefined) {
      // Get output filename from url
      outputFilename = 'file.chunk'; // default value
      const pathname: string = URL.parse(url).pathname;
      const pathnameParts: string[] = pathname.split('/');
      if (pathnameParts.length > 0) {
        const lastPathnamePart: string = pathnameParts[pathnameParts.length - 1].trim();
        if (lastPathnamePart !== '') {
          outputFilename = lastPathnamePart;
        }
      }
    }
    return outputFilename;
  }

  private getArgValue(args: minimist.ParsedArgs, argKey: string,
                      argLabel: string, isValueNumber: boolean): string | number {
    let argValue: string | number;
    const hasArg: boolean = args.hasOwnProperty(argKey);
    if (hasArg) {
      argValue = args[argKey];
      const argValueType: string = typeof argValue;
      if (argValueType === 'boolean') {
        throw new InvalidArgumentException(`${argLabel} is missing`);
      } else if (argValueType === 'string' && isValueNumber) {
        throw new InvalidArgumentException(`${argLabel} should be a number`);
      }
    }
    return argValue;
  }
}
