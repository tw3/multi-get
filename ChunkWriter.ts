import * as fs from 'fs';
import { Observable, of } from "rxjs";
import { flatMap } from 'rxjs/operators';
import { ChunkData } from "./ChunkData";
import { ObserveOnOperator } from 'rxjs/internal/operators/observeOn';
import { ChunkByteRange } from './ChunkByteRange';

export class ChunkWriter {
  private filename: string;
  private fd: number;
  private verboseMode: boolean = false;

  constructor(filename: string) {
    this.filename = filename;
  }

  saveChunkData(chunkData$: Observable<ChunkData>): Observable<void> {
    return Observable.create((observer) => {
      this.openFile()
        .pipe(
          flatMap(() => chunkData$),
          flatMap((chunkData: ChunkData) => this.writeChunkData(chunkData))
        )
        .subscribe(
          () => { },
          (err) => {
            this.closeFile().subscribe(
              () => { },
              (err) => { },
              () => observer.error(err)
            )
            // observer.error(err);
          },
          () => {
            this.closeFile().subscribe(
              () => { },
              (err) => observer.error(err),
              () => observer.complete()
            )
            // observer.complete();
          }
        );
    });
  }

  enableVerboseMode(): this {
    this.verboseMode = true;
    return this;
  }

  openFile(): Observable<void> {
    return Observable.create((observer) => {
      if (this.fd) {
        if (this.verboseMode) {
          console.log("file already opened");
        }
        observer.next(this.fd);
        observer.complete();
        return;
      }
      if (this.verboseMode) {
        console.log("opening file", this.filename, "for writing");
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

  writeChunkData(chunkData: ChunkData): Observable<void> {
    return Observable.create((observer) => {
      if (!this.fd) {
        observer.error("File must be opened before writing");
        return;
      }
      const blob: any = chunkData.blob;
      const range: ChunkByteRange = chunkData.range;
      const offset: number = 0;
      const position: number = range.start;
      const chunkLength: number = range.end - range.start + 1;
      if (this.verboseMode) {
        console.log("Writing chunk:", range, "position:", position, "chunkLength:", chunkLength);
      }

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
        if (this.verboseMode) {
          console.log("file already closed");
        }
        observer.next();
        observer.complete();
        return;
      }
      if (this.verboseMode) {
        console.log("closing file");
      }
      fs.close(this.fd, (err: NodeJS.ErrnoException) => {
        if (err) {
          observer.error(err);
          return;
        }
        if (this.verboseMode) {
          console.log('file closed');
        }
        observer.next();
        observer.complete();
      });
    });
  }

}
