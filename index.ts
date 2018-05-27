import { MultiGetDownloader } from './MultiGetDownloader';
import { ChunkData } from './ChunkData';

const url = "https://dog.ceo/api/breed/affenpinscher/images/random";
const multiGetDownloader: MultiGetDownloader = new MultiGetDownloader(url);
multiGetDownloader.run().subscribe(
  () => {
    console.log('.');
  },
  (error) => {
    console.error("error: ", error);
  },
  () => {
    console.log('done');
  },
);
