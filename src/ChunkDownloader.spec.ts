import { expect } from 'chai';
import 'mocha';
import { Observable } from 'rxjs';
import { StringDecoder, NodeStringDecoder } from 'string_decoder';

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

  it('should return yield a correct value', (done) => {
    const url: string = 'https://dog.ceo/api/breed/affenpinscher/images/random';
    const chunkByteRange: ChunkByteRange = {
      start: 0,
      end: 40
    };
    const chunkDownloader: ChunkDownloader = new ChunkDownloader(url, chunkByteRange);
    const chunkData$: Observable<ChunkData> = chunkDownloader.getSource();
    chunkData$.subscribe((chunkData: ChunkData) => {
      check(done, () => {
        const actualRange: ChunkByteRange = chunkData.range;
        const expectedStr: string = '{"status":"success","message":"https:\\/\\/';
        const stringDecoder: NodeStringDecoder = new StringDecoder('utf8');
        const actualStr: string = stringDecoder.write(chunkData.blob);
        expect(actualStr).to.equal(expectedStr);
        expect(actualRange).to.equal(chunkByteRange);
      } );
    });
  });

});

function check(done: (e?: any) => void, f: () => void): void {
  try {
    f();
    done();
  } catch (e) {
    done(e);
  }
}
