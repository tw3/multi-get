# multi-get
A Node.js application that downloads part of a file from a web server, in chunks.

This is a simplified version of a “download booster”, which speeds up downloads by requesting
files in multiple pieces simultaneously (saturating the network), then reassembling the pieces.

Features:
* The URL for the source file is specified with a required command-line option
* It uses the HTTP 'Range' header to download the file in chunks using separate GET requests
* The number of chunks/requests is configurable (default is 4)
* The size of each chunk is configurable (default is 1 MiB)
* The chunks can be downloaded serially or in parallel
* The chunks are retrieved starting from the front of the file
* The output filename is configurable

## Installing

Install ts-node and typescript:

```bash
npm install -g ts-node
npm install -g typescript
```

Install node modules:

```bash
npm install
```

Run app:

```bash
ts-node index [OPTIONS] <url>
```

For example:

```bash
ts-node index -o test.chunk -p -s 2 -n 10 https://dog.ceo/api/breed/affenpinscher/images/random
```

... will make 10 parallel requests of 2 bytes each to the "random" url and save the reassembled chunks as "test.chunk".

```bash
cat test.chunk
{"status":"success",
```

For help:

```bash
ts-node index -h
```
