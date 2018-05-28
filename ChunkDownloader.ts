import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChunkData } from "./ChunkData";
import { ChunkByteRange } from "./ChunkByteRange";

export class ChunkDownloader {
  private url: string;
  private chunkByteRange: ChunkByteRange;
  private chunkSizeBytes: number;
  private chunkDownload$: Observable<ChunkData>;
  private debugMode: boolean = false;

  constructor(url: string, chunkByteRange: ChunkByteRange) {
    this.url = url;
    this.chunkByteRange = chunkByteRange;
    if (this.debugMode) console.log("this.chunkByteRange", this.chunkByteRange);
    this.initSource();
  }

  getSource(): Observable<ChunkData> {
    return this.chunkDownload$;
  }

  enableDebugMode(): void {
    this.debugMode = true;
  }

  private initSource(): void {
    var requestConfig: AxiosRequestConfig = {
      headers: {
        'Range': `bytes=${this.chunkByteRange.start}-${this.chunkByteRange.end}`
      },
      responseType: 'arraybuffer'
    };
    const axiosPromise: Promise<AxiosResponse<any>> = axios.get(this.url, requestConfig);
    this.chunkDownload$ = from(axiosPromise)
    .pipe(
      map((response: AxiosResponse) => {
        const chunkData: ChunkData = {
          range: this.chunkByteRange,
          blob: response.data
        };
        return chunkData;        
      })
    )
  }

}
