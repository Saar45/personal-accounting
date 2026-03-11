// Shim for Node's 'stream' module.
// papaparse references stream.Duplex for its Node streaming API,
// but we only use synchronous string parsing, so this is never called.
module.exports = { Duplex: undefined };
