import { expect } from 'chai';
import 'mocha';
import { Observable } from 'rxjs';

import { ChunkDownloader } from './ChunkDownloader';
import { ChunkByteRange } from './model/ChunkByteRange';
import { ChunkData } from './model/ChunkData';

describe('ChunkDownloader.getSource()', () => {

  it('should return an observable', () => {
    const url: string = 'foobar';
    const chunkByteRange: ChunkByteRange = {
      start: 0,
      end: 1
    };
    const chunkDownloader: ChunkDownloader = new ChunkDownloader(url, chunkByteRange);
    const chunkData$: Observable<ChunkData> = chunkDownloader.getSource();
    expect(chunkData$).to.instanceOf(Observable);
  });

});
