import { MultiGetDownloader } from './MultiGetDownloader';
import { ChunkData } from './ChunkData';

const url: string = "https://dog.ceo/api/breed/affenpinscher/images/random";
const filename: string = "file.part";
const numChunks: number = 4;
const chunkSizeBytes: number = 2;
const isParallel: boolean = true;

console.log(`Downloading first ${numChunks} chunks of '${url}' to '${filename}'`);
const multiGetDownloader: MultiGetDownloader = new MultiGetDownloader(url, filename);
multiGetDownloader
  .setNumChunks(numChunks)
  .setChunkSizeBytes(chunkSizeBytes)
  .setIsParallel(isParallel);

multiGetDownloader.run().subscribe(
  () => {
    process.stdout.write('.');
  },
  (error) => {
    console.error("[ERROR]", error);
  },
  () => {
    process.stdout.write('done');
  },
);
