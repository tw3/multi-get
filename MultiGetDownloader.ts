import * as fs from 'fs';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable, from, concat, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import { ChunkDownloader } from './ChunkDownloader';
import { ChunkData } from "./ChunkData";
import { ChunkByteRange } from './ChunkByteRange';

export class MultiGetDownloader {
  private url: string;
  private isParallel: boolean = false;
  private chunkSizeBytes: number = 2;
  private numChunks: number = 4;
  private filename: string = 'file.part';

  constructor(url) {
    this.url = url;
  }

  run(): Observable<void> {
    const chunkData$: Observable<ChunkData> = this.getChunkData();
    const downloader$: Observable<void> = Observable.create((observer) => {
      // Open file for writing
      fs.open(this.filename, 'w', (err: NodeJS.ErrnoException, fd: number) => {
        if (err) {
          observer.error(err);
          return;
        }
        // Write chunks to file
        chunkData$.subscribe(
          (chunkData: ChunkData) => {
            observer.next(chunkData);
            this.saveChunkData(chunkData, fd).subscribe();
          },
          (err) => observer.error(err),
          () => {
            fs.close(fd, () => {
              console.log('wrote the file successfully');
              observer.complete();
            });
          }
        );
      });
      // const chunkCollection$: Observable<any> = 
    });
    return downloader$;
  }

  private getChunkData(): Observable<ChunkData> {
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

  private saveChunkData(chunkData: ChunkData, fd: number): Observable<void> {
    const chunkWriter$ = Observable.create((observer) => {
      const blob: any = chunkData.blob;
      const range: ChunkByteRange = chunkData.range;
      const offset: number = 0;
      const position: number = range.start;
      const chunkLength: number = range.end - range.start + 1;
      console.log("Got chunk:", range);
      console.log("blob:", blob);
      console.log("offset:", offset);
      console.log("position:", position);
      console.log("chunkLength:", chunkLength);

      fs.write(fd, blob, offset, chunkLength, position, (err) => {
        if (err) {
          observer.error(err);
          return;
        }
        observer.next();
      });
    });
    return chunkWriter$;
  }

  private getChunkByteRange(chunkIdx: number): ChunkByteRange {
    const start: number = (chunkIdx * this.chunkSizeBytes);
    const end: number = ((chunkIdx + 1) * this.chunkSizeBytes) - 1;
    const chunkRange: ChunkByteRange = { start, end };
    return chunkRange;
  }

}