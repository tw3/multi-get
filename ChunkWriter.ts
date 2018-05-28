import * as fs from 'fs';
import { Observable, of } from "rxjs";
import { flatMap } from 'rxjs/operators';
import { ChunkData } from "./ChunkData";
import { ObserveOnOperator } from 'rxjs/internal/operators/observeOn';
import { ChunkByteRange } from './ChunkByteRange';

export class ChunkWriter {
  private filename: string;
  private fd: number;
  private debugMode: boolean = false;

  constructor(filename: string) {
    this.filename = filename;
  }

  saveChunkData(chunkData$: Observable<ChunkData>): Observable<void> {
    return Observable.create((observer) => {
      this.openFile()
        .pipe(
          flatMap(() => chunkData$)
        )
        .subscribe(
          (chunkData: ChunkData) => this.writeChunkData(chunkData, observer),
          (err) => {
            this.closeFile().subscribe(
              () => { },
              (err) => { },
              () => observer.error(err)
            )
          },
          () => {
            this.closeFile().subscribe(
              () => { },
              (err) => observer.error(err),
              () => observer.complete()
            )
          }
        );
    });
  }

  enableDebugMode(): void {
    this.debugMode = true;
  }

  private openFile(): Observable<void> {
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

  private writeChunkData(chunkData: ChunkData, observer) {
    const blob: any = chunkData.blob;
    const range: ChunkByteRange = chunkData.range;
    const offset: number = 0;
    const position: number = range.start;
    const chunkLength: number = range.end - range.start + 1;
    if (this.debugMode) console.log("Got chunk:", range, "position:", position, "chunkLength:", chunkLength);

    fs.write(this.fd, blob, offset, chunkLength, position, (err: NodeJS.ErrnoException) => {
      if (err) {
        observer.error(err);
        return;
      }
      observer.next();
    });
  }

  private closeFile(): Observable<void> {
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
        if (this.debugMode) console.log('file closed');
        observer.next();
        observer.complete();
      });
    });
  }

}