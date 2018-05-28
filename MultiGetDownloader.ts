import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable, from, concat, merge } from 'rxjs';
import { map, flatMap, share } from 'rxjs/operators';
import * as _ from 'lodash';

import { ChunkDownloader } from './ChunkDownloader';
import { ChunkData } from "./ChunkData";
import { ChunkByteRange } from './ChunkByteRange';
import { ChunkWriter } from './ChunkWriter';

export class MultiGetDownloader {
  private url: string;
  private filename: string;
  private numChunks: number = 4;
  private chunkSizeBytes: number = 1048576; // 1 MiB = 1024 KB * 1024 B
  private isParallel: boolean = false;

  constructor(url, filename) {
    this.url = url;
    this.filename = filename;
  }

  setNumChunks(numChunks: number): this {
    this.numChunks = numChunks;
    return this;
  }

  setChunkSizeBytes(chunkSizeBytes: number): this {
    this.chunkSizeBytes = chunkSizeBytes;
    return this;
  }

  setIsParallel(isParallel: boolean): this {
    this.isParallel = isParallel;
    return this;
  }

  run(): Observable<void> {
    const chunkData$: Observable<ChunkData> = this.getChunkData();
    const chunkWriter: ChunkWriter = new ChunkWriter(this.filename);
    return chunkWriter.saveChunkData(chunkData$);
  }

  private getChunkData(): Observable<ChunkData> {
    // TODO: import only the range() function
    const chunkData$Array: Observable<ChunkData>[] = _.range(this.numChunks) // i.e. [0, 1, 2, 3]
      .map((chunkIdx: number) => {
        const chunkByteRange: ChunkByteRange = this.getChunkByteRange(chunkIdx);
        const chunkDownloader = new ChunkDownloader(this.url, chunkByteRange);
        const chunkDownload$: Observable<ChunkData> = chunkDownloader.getSource();
        return chunkDownload$;
      });
    const combinationOperator = this.isParallel ? merge : concat;
    const chunkData$: Observable<ChunkData> = combinationOperator(...chunkData$Array);
    return chunkData$;
  }

  private getChunkByteRange(chunkIdx: number): ChunkByteRange {
    const start: number = (chunkIdx * this.chunkSizeBytes);
    const end: number = ((chunkIdx + 1) * this.chunkSizeBytes) - 1;
    const chunkRange: ChunkByteRange = { start, end };
    return chunkRange;
  }

}