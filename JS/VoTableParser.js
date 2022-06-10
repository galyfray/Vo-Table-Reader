const tokenizers = require("./tokenizers");
const {TokenStream} = require("./TokenStream");
const CharStream = require("./CharStream");

class UnexpectedTokenError extends Error {}

class VoTableParser {

    constructor(VoTable) {
        this._vo_table = VoTable;
        this._char_stream = new CharStream(VoTable);
        this._token_stream = new TokenStream(this._char_stream,
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
        this._internal = {};
        this._tokens = this._parse();
    }

    //==#===#==// Parsing functions //==#===#==//

    /**
     * This function aims to parse the prologue of the xml doccument if present and the mandatory VOTABLE tag.
     * This function will raise a SyntaxError if the VOTABLE tag is not found, and a warning if the VOTable's version is not known.
     */
    _parse_init() {
        if (this._token_stream.next().type !== tokenizers.TagOpeningTokenizer.TYPE.TAG_OPENNING) {
            throw new SyntaxError("VOTABLE tag not found");
        }
        let prologue = this._token_stream.peek().type === tokenizers.QMarkTokenizer.TYPE;
        let data = this._parse_payload(prologue);
        if (prologue) {
            this._internal.prologue = data;
            if (this._token_stream.peek().type !== tokenizers.TagOpeningTokenizer.TYPE.TAG_OPENNING) {
                throw new SyntaxError("VOTABLE tag not found");
            }
            this._token_stream.next();
            this._internal.VoTable = this._parse_payload();
        } else {
            this._internal.VoTable = data;
        }

        if (this._internal.VoTable.name !== "VOTABLE") {
            throw new SyntaxError("VOTABLE tag not found");
        }
    }

    /**
     * Helper function that parse the payload of a tag.
     * This function assumes that the tag opening as already been consumed
     * @param {boolean} is_prologue true if the tag is the prologue of the xml document.
     */
    _parse_payload(is_prologue = false) {
        let data = {};
        if (is_prologue) {
            this._token_stream.next();
            if (this._token_stream.peek().value !== "xml") {
                this._throw(this._token_stream.next(), "xml");
            }
        }
        data.name = this._token_stream.next();
        if (data.name.type !== tokenizers.IdentifierTokenizer.TYPE) {
            this._throw(data.name, "a valid xml identifier");
        }
        data.name = data.name.value;
        data.attributes = {};
        let current = data.attributes;
        while (
            this._token_stream.peek().type !== tokenizers.TagClosingTokenizer.TYPE.TAG_CLOSING &&
            this._token_stream.peek().type !== tokenizers.TagClosingTokenizer.TYPE.TAG_SELF_CLOSING &&
            (!is_prologue || this._token_stream.peek().type !== tokenizers.QMarkTokenizer.TYPE)
        ) {
            current = data.attributes;
            let key = this._token_stream.next();
            if (key.type !== tokenizers.IdentifierTokenizer.TYPE) {
                this._throw(key, "a valid payload identifier");
            }
            if (this._char_stream.peek() === ":") {
                this._char_stream.next();
                if (data.attributes[key.value] === undefined) {
                    data.attributes[key.value] = {};
                    current = data.attributes[key.value];
                    key = this._token_stream.next();
                    if (key.type !== tokenizers.IdentifierTokenizer.TYPE) {
                        this._throw(key, "a valid payload identifier");
                    }
                }
            }
            if (this._char_stream.peek() !== "=") {
                this._throw(this._token_stream.next(), "=");
            }
            this._char_stream.next();
            let value = this._token_stream.next();
            if (value.type !== tokenizers.StringTokenizer.TYPE) {
                this._throw(value, "All attributes must be quoted values");
            }
            current[key.value] = value.value;
        }

        if (is_prologue) {
            this._token_stream.next();
        }
        data.self_closed = this._token_stream.next().type === tokenizers.TagClosingTokenizer.TYPE.TAG_SELF_CLOSING;
        return data;
    }

    _parse() {
        this._parse_init();
        let tokens = [];
        try {
            while (!this._token_stream.eof()) {
                tokens.push(this._token_stream.next());
            }
        } catch (e) {
            console.error(e);
        }
        return tokens;
    }

    //==#===#==// Generic helpers //==#===#==//

    /**
     * Helper function that build an error message an then throw an {@link UnexpectedTokenError}
     * @param {object} token the unexpected token, can be null.
     * @param {string} expected optional string that contains the expected tokens if known.
     */
    _throw(token, expected = null) {
        let message;
        if (token) {
            let column = this._char_stream.getColumn() - token.value.length;

            message = `Unexpected token ${token.value} at` +
                ` line ${this._char_stream.getLine()} column ${this._char_stream.getColumn()}`;

            if (expected) {
                message += `, expected ${expected}`;
            }

            message += "\n" + this._vo_table.split("\n")[this._char_stream.getLine() - 1] + "\n";

            for (let i = 0;i < column - 1;i++) {
                message += " ";
            }
            for (let i = 0;i < token.value.length;i++) {
                message += "^";
            }

            throw new UnexpectedTokenError(message);
        } else {
            message = `Unexpected end of query at` +
                `line ${this._char_stream.getLine()} column ${this._char_stream.getColumn()}`;

            if (expected) {
                message += `, expected ${expected}`;
            }

            throw new UnexpectedTokenError(message);
        }
    }

    _isWhitespace(char) {
        return char === " " || char === "\n" || char === "\t" || char === "\r";
    }
}

module.exports = {VoTableParser, UnexpectedTokenError};