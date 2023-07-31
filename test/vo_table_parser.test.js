const {VoTableParser} = require("../JS/VoTableParser");
const test = require("ava");
const fs = require("fs");
const path = require("path");

function resolve(filename) {
    return path.resolve(__dirname, "../examples", filename);
}

test("Parser init", async t => {
    try {
        let data = await fs.promises.readFile(resolve("small-tr.txt"));
        let parser = new VoTableParser(data.toString());
        const internal = parser._internal;
        const tokens = parser._tokens;
        t.snapshot(internal, "internal");
        t.snapshot(tokens, "tokens");
    } catch (e) {
        console.error(e);
        t.fail();
    }
});