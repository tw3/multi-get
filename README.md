# multi-get
A Node.js application that downloads part of a file from a web server, in chunks.

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

... will make 10 parallel requests of 2 bytes each to the speficied url and save the reassembled chunks as "test.chunk".

For help:

```bash
ts-node index -h
```
