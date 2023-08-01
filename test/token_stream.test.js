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

    constructor(VoTable, tokenizers) {
        this.charStream = new CharStream(VoTable);
        this.tokenStream = new TokenStream(this.charStream,
            this._isWhitespace,
            ...tokenizers
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

test("Tag Opening Tokenizer", t => {
    const tokenizer = [new tokenizers.TagOpeningTokenizer()];
    const opening_simple = "<";
    let tokens = new Parser(opening_simple, tokenizer).get_tokens();

    if (tokens.length !== 1) {
        t.fail("opening_simple: Invalid number of token found: " + tokens.length);
    }
    if (tokens[0].type !== tokenizers.TagOpeningTokenizer.TYPE.TAG_OPENNING) {
        t.fail("opening_simple: Invalid token type found: " + tokens[0].type + " expected: " + tokenizers.TagOpeningTokenizer.TYPE.TAG_OPENNING);
    }

    const opening_closing = "</";
    tokens = new Parser(opening_closing, tokenizer).get_tokens();

    if (tokens.length !== 1) {
        t.fail("opening_closing: Invalid number of token found: " + tokens.length);
    }
    if (tokens[0].type !== tokenizers.TagOpeningTokenizer.TYPE.TAG_CLOSING_OPENNING) {
        t.fail("opening_closing: Invalid token type found: " + tokens[0].type + " expected: " + tokenizers.TagOpeningTokenizer.TYPE.TAG_CLOSING_OPENNING);
    }

    const compound = "<</";
    tokens = new Parser(compound, tokenizer).get_tokens();

    if (tokens.length !== 2) {
        t.fail("compound: Invalid number of token found: " + tokens.length);
    }
    if (tokens[0].type !== tokenizers.TagOpeningTokenizer.TYPE.TAG_OPENNING) {
        t.fail("compound: Invalid token type found: " + tokens[0].type + " expected: " + tokenizers.TagOpeningTokenizer.TYPE.TAG_OPENNING);
    }
    if (tokens[1].type !== tokenizers.TagOpeningTokenizer.TYPE.TAG_CLOSING_OPENNING) {
        t.fail("compound: Invalid token type found: " + tokens[1].type + " expected: " + tokenizers.TagOpeningTokenizer.TYPE.TAG_CLOSING_OPENNING);
    }

    const reverse_compound = "</<";
    tokens = new Parser(reverse_compound, tokenizer).get_tokens();

    if (tokens.length !== 2) {
        t.fail("reverse_compound: Invalid number of token found: " + tokens.length);
    }
    if (tokens[0].type !== tokenizers.TagOpeningTokenizer.TYPE.TAG_CLOSING_OPENNING) {
        t.fail("reverse_compound: Invalid token type found: " + tokens[0].type + " expected: " + tokenizers.TagOpeningTokenizer.TYPE.TAG_CLOSING_OPENNING);
    }
    if (tokens[1].type !== tokenizers.TagOpeningTokenizer.TYPE.TAG_OPENNING) {
        t.fail("reverse_compound: Invalid token type found: " + tokens[1].type + " expected: " + tokenizers.TagOpeningTokenizer.TYPE.TAG_OPENNING);
    }

    t.pass();
});

test("tokenize", async t => {
    try {
        let data = await fs.promises.readFile(resolve("small-tr.txt"));
        let parser = new Parser(data.toString(), [
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
        ]);
        let tokens = parser.get_tokens();
        t.snapshot(tokens, "tokens");
    } catch (e) {
        console.error(e);
        t.fail();
    }
});
