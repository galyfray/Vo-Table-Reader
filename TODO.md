## Short term
- [X] support `TABLEDATA` data encoding
- [ ] switch to TypeScript.
- [ ] create test files
- [ ] setup github actions :
    - [ ] to check for code style
    - [ ] to check that tests pass
    - [ ] to check for security issue
    - [ ] to check code quality
    - [ ] to do some cofee.
- [ ] check that all optional `DESCRIPTION` tags are suported

## Mid term
- [ ] create benchmarks :
    - [ ] find a good benchmark/ profinling framework
    - [ ] find a good amount of representative VoTables to represent normal usecases
    - [ ] create/find abnormaly large VoTable for a synthetic benchmark
- [ ] support `INFO`
- [ ] support `COOSYS` (and check I've seen somewhere something about deprecation of this tag)
- [ ] support `PARAM`
- [ ] support `BINARY` and `BINARY2` data encoding
- [ ] create browser compatible realise using [browserify](https://browserify.org/)

## Long term
- [ ] support different text encoding
- [ ] support `FITS` data encoding
- [ ] check if the use of the `xmlns`, `xmlns:xsi` and `xsi:schemaLocation` is relevant.
- [ ] use [WebAssembly](https://webassembly.org/) when possible
- [ ] suport global definition.