const tokenizers = require("./tokenizers");
const {TokenStream} = require("./TokenStream");
const CharStream = require("./CharStream");

class VoTableParser {

    constructor(VoTable) {
        this.charStream = new CharStream(VoTable);
        this.tokenStream = new TokenStream(this.charStream,
            this._isWhitespace,
            new tokenizers.StringTokenizer("'"),
            new tokenizers.StringTokenizer('"'),
            new tokenizers.NumberTokenizer(),
            new tokenizers.WhitespaceTokenizer()
        );
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
        return tokens;
    }

    _isWhitespace(char) {
        return char === " " || char === "\n" || char === "\t" || char === "\r";
    }
}

module.exports = VoTableParser;