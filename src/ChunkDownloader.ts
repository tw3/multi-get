import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ChunkByteRange } from './ChunkByteRange';
import { ChunkData } from './ChunkData';

export class ChunkDownloader {
  private url: string;
  private chunkByteRange: ChunkByteRange;
  private chunkSizeBytes: number;
  private chunkDownload$: Observable<ChunkData>;
  private verboseMode: boolean = false;

  constructor(url: string, chunkByteRange: ChunkByteRange) {
    this.url = url;
    this.chunkByteRange = chunkByteRange;
    if (this.verboseMode) {
      console.log('this.chunkByteRange', this.chunkByteRange);
    }
    this.initSource();
  }

  getSource(): Observable<ChunkData> {
    return this.chunkDownload$;
  }

  enableVerboseMode(): this {
    this.verboseMode = true;
    return this;
  }

  private initSource(): void {
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Range: `bytes=${this.chunkByteRange.start}-${this.chunkByteRange.end}`
      },
      responseType: 'arraybuffer'
    };
    if (this.verboseMode) {
      console.log('Creating chunk download source');
    }
    this.chunkDownload$ = Observable.create((observer) => {
      if (this.verboseMode) {
        console.log('Fetching data from', this.url, 'range', requestConfig.headers.Range);
      }
      axios.get(this.url, requestConfig)
        .then((response: AxiosResponse) => {
          const chunkData: ChunkData = {
            range: this.chunkByteRange,
            blob: response.data
          };
          if (this.verboseMode) {
            console.log('Got chunk', chunkData.range);
          }
          observer.next(chunkData);
          observer.complete();
        })
        .catch((err) => {
          if (this.verboseMode) {
            console.log('Error while fetching:', err.message);
          }
          observer.error(err);
        });
    });

  }

}
