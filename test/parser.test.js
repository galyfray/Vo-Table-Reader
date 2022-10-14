const test = require("ava");
const fs = require("fs");
const path = require("path");
const {VoTableParser} = require("../JS/VoTableParser");

function resolve(filename) {
    return path.resolve(__dirname, "../examples", filename);
}

test("parser", async t => {

    try {
        let data = await fs.promises.readFile(resolve("small-tr.txt"));
        new VoTableParser(data.toString());
        t.pass();

    } catch (e) {
        console.error(e);
        t.fail();
    }

});