const tokenizers = require("../JS/tokenizers");
const {TokenStream} = require("../JS/TokenStream");
const CharStream = require("../JS/CharStream");
const test = require("ava");
const fs = require("fs");
const path = require("path");

function resolve(filename) {
    return path.resolve(__dirname, "../examples", filename);
}

class Parser {

    constructor(VoTable) {
        this.charStream = new CharStream(VoTable);
        this.tokenStream = new TokenStream(this.charStream,
            this._isWhitespace,
            new tokenizers.StringTokenizer("'"),
            new tokenizers.StringTokenizer('"'),
            new tokenizers.NumberTokenizer(),
            new tokenizers.QMarkTokenizer(),
            new tokenizers.TagClosingTokenizer(),
            new tokenizers.TagOpeningTokenizer(),
            new tokenizers.IdentifierTokenizer(),
            new tokenizers.OperatorTokenizer(),
            new tokenizers.ParenthesisTokenizer(),
            new tokenizers.WhitespaceTokenizer()
        );
        this._tokens = null;
        this._parse();
    }

    _parse() {
        let tokens = [];
        try {
            while (!this.tokenStream.eof()) {
                tokens.push(this.tokenStream.next());
            }
        } catch (e) {
            console.error(e);
        }
        this._tokens = tokens;
    }

    get_tokens() {
        return this._tokens;
    }

    _isWhitespace(char) {
        return char === " " || char === "\n" || char === "\t" || char === "\r";
    }
}

test("tokenize", async t => {
    try {
        let data = await fs.promises.readFile(resolve("small-tr.txt"));
        console.log();
        let parser = new Parser(data.toString());
        let tokens = parser.get_tokens();
        t.snapshot(tokens, "tokens");
    } catch (e) {
        console.error(e);
        t.fail();
    }
});
