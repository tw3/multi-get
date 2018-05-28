import { MultiGetDownloader } from './MultiGetDownloader';
import { ChunkData } from './ChunkData';
import { AppOptionsParser } from './AppOptionsParser';
import { AppOptions } from './AppOptions';

function main() {
  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
  });

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

  console.log(`Downloading first ${numChunks} chunks of '${url}' to '${filename}'`);
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
      console.error("[ERROR]", message);
    },
    () => {
      process.stdout.write('done\n');
    },
  );

}

main();