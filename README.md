# multi-get
A Node.js application that downloads part of a file from a web server in chunks using [axios](https://github.com/axios/axios) and [RxJS 6](https://github.com/ReactiveX/rxjs).

![alt text](https://raw.githubusercontent.com/tw3/multi-get/master/multiget_illustration.png "Multi-GET illustration")

This is a simplified version of a "download booster", which speeds up downloads by requesting
files in multiple pieces simultaneously (saturating the network), then reassembling the pieces.

Features:
* The URL for the source file is specified with a required command-line option
* It uses the [HTTP 'Range' header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range) to download the file in chunks using separate GET requests
* The number of chunks/requests is configurable (default is 4)
* The size of each chunk is configurable (default is 1 MiB)
* The chunks can be downloaded serially or in parallel
* The chunks are retrieved starting from the front of the file
* The output filename is configurable

## Pre-requisites

You must have:
* A bash shell installed localled
* [Node.js](https://nodejs.org/) installed locally and in your shell's PATH
* A file hosted on a server that supports the [HTTP Range header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests)

## Installing

Install ts-node and typescript:

```bash
npm install -g ts-node
npm install -g typescript
```

Clone repo:
```bash
git clone https://github.com/tw3/multi-get.git
```

Install node modules:

```bash
cd multi-get
npm install
```

## How to run

```bash
ts-node index [OPTIONS] <url>
```

For example:

```bash
ts-node index -o partial.json -p -s 2 -n 10 https://dog.ceo/api/breed/affenpinscher/images/random
```

... will make 10 parallel requests of 2 bytes each to the "random" url and save the reassembled chunks as "partial.json".

```bash
cat partial.json
{"status":"success",
```

![alt text](https://raw.githubusercontent.com/tw3/multi-get/master/multiget_shell.png "Multi-GET shell")

[Online Demo](https://repl.it/@tw3/Multi-GET)

## Options

To see a list of options:

```bash
ts-node index -h
```

Please note that the server from which you are downloading must support downloads using the HTTP Range header.
