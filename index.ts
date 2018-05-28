import { MultiGetDownloader } from './src/MultiGetDownloader';
import { ChunkData } from './src/ChunkData';
import { AppOptionsParser } from './src/AppOptionsParser';
import { AppOptions } from './src/AppOptions';

function main() {
  let appOptions: AppOptions;
  try {
    appOptions = AppOptionsParser.parse();
    if (appOptions === undefined) {
      AppOptionsParser.showUsage();
      return;
    }
  } catch (e) {
    console.error(e.message);
    AppOptionsParser.showUsage();
    return;
  }

  const url: string = appOptions.url;
  const filename: string = appOptions.filename;
  const isParallel: boolean = appOptions.isParallel || false;
  const numChunks: number = appOptions.numChunks || 4;
  const chunkSizeBytes: number = appOptions.chunkSizeBytes || 1048576;

  process.stdout.write(`Downloading first ${numChunks} chunks of '${url}' to '${filename}'\n`);
  const multiGetDownloader: MultiGetDownloader = new MultiGetDownloader(url, filename);
  multiGetDownloader
    .setNumChunks(numChunks)
    .setChunkSizeBytes(chunkSizeBytes)
    .setIsParallel(isParallel);
  if (appOptions.verboseMode) {
    multiGetDownloader.enableVerboseMode();
  }

  multiGetDownloader.download().subscribe(
    () => {
      process.stdout.write('.');
    },
    (error) => {
      const message: string = (error.hasOwnProperty('message')) ? error.message : error;
      process.stderr.write(`[ERROR] ${message}\n`);
    },
    () => {
      process.stdout.write('done\n');
    },
  );

}

main();