import { expect } from 'chai';
import 'mocha';
import { Observable } from 'rxjs';

import { ChunkByteRange } from '../src/ChunkByteRange';
import { ChunkData } from '../src/ChunkData';
import { ChunkDownloader } from '../src/ChunkDownloader';

describe('getSource', () => {

  it('should return an observable', () => {
    const url: string = 'foobar';
    const chunkByteRange: ChunkByteRange = {
      start: 0,
      end: 1
    };
    const chunkDownloader: ChunkDownloader = new ChunkDownloader(url, chunkByteRange);
    const chunkData$: Observable<ChunkData> = chunkDownloader.getSource();
    expect(chunkData$).to.instanceOf(new Observable<ChunkData>());
  });

});
