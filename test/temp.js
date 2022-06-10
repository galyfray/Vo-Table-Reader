const { VoTableParser } = require("../JS/VoTableParser");
const path = require("path");
const fs = require("fs");

function resolve(filename) {
    return path.resolve(__dirname, "../examples", filename);
}

let data = fs.promises.readFile(resolve("small-tr.txt"));
data.then(data => {
    let parser = new VoTableParser(data.toString());
    console.log(parser._tokens);
    console.log(parser._internal);
});
