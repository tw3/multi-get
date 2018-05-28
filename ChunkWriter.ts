import * as fs from 'fs';
import { Observable, of, PartialObserver } from "rxjs";
import { ChunkData } from "./ChunkData";
import { ObserveOnOperator } from 'rxjs/internal/operators/observeOn';
import { ChunkByteRange } from './ChunkByteRange';

export class ChunkWriter {
  private filename: string;
  private fd: number;

  constructor(filename: string) {
    this.filename = filename;
  }

  openFile(): Observable<void> {
    return Observable.create((observer) => {
      if (this.fd) {
        observer.next(this.fd);
        observer.complete();
        return;
      }
      fs.open(this.filename, 'w', (err: NodeJS.ErrnoException, fd: number) => {
        if (err) {
          observer.error(err);
          return;
        }
        this.fd = fd;        
        observer.next(this.fd);
        observer.complete();
      });
    });
  }

  saveChunkData(chunkData: ChunkData): Observable<void> {
    return Observable.create((observer) => {
      if (!this.fd) {
        observer.next();
        observer.complete();
        return;
      }
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

      fs.write(this.fd, blob, offset, chunkLength, position, (err: NodeJS.ErrnoException) => {
        if (err) {
          observer.error(err);
          return;
        }
        observer.next();
        observer.complete();
      });
    });
  }

  closeFile(): Observable<void> {
    return Observable.create((observer) => {
      if (!this.fd) {
        observer.next();
        observer.complete();
        return;
      }
      fs.close(this.fd, (err: NodeJS.ErrnoException) => {
        if (err) {
          observer.error(err);
          return;
        }
        console.log('file closed');
        observer.next();
        observer.complete();
      });
    });
  }

}