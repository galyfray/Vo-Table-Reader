if (typeof module !== "undefined") {
    var Tokenizer = require("./Tokenizer");
}

class StringTokenizer extends Tokenizer {

    constructor(quote = "'") {
        super(StringTokenizer.TYPE);
        this.quote = quote;
    }

    canTokenize(char) {
        return char === this.quote;
    }

    _canContinueTokenization(char) {
        return !this.canTokenize(char);
    }

    tokenize(charStream) {
        charStream.next();
        let token = super.tokenize(charStream);
        charStream.next();
        return token;
    }
}

StringTokenizer.TYPE = "string";

class WhitespaceTokenizer extends Tokenizer {

    constructor() {
        super(WhitespaceTokenizer.TYPE);
    }

    canTokenize(char) {
        return char === " " || char === "\n" || char === "\t" || char === "\r";
    }
}

WhitespaceTokenizer.TYPE = "whitespace";

class NumberTokenizer extends Tokenizer {

    constructor() {
        super("");
        this._isFloat = false;
    }

    canTokenize(char) {
        return char >= "0" && char <= "9";
    }

    _canContinueTokenization(char) {
        return this.canTokenize(char) || char === "." && !this._isFloat && (this._isFloat = true);
    }

    tokenize(charStream) {
        this._isFloat = false;
        let value = super.tokenize(charStream);

        if (this._isFloat) {
            return {
                value: value.value,
                type : NumberTokenizer.TYPE.FLOAT
            };
        } else {
            return {
                value: value.value,
                type : NumberTokenizer.TYPE.INTEGER
            };
        }
    }
}

NumberTokenizer.TYPE = {INTEGER: "int", FLOAT: "float"};

class IdentifierTokenizer extends Tokenizer {

    constructor() {
        super(IdentifierTokenizer.TYPE);
    }

    canTokenize(char) {
        return char >= "a" && char <= "z" || char >= "A" && char <= "Z" || char === "_";
    }

    _canContinueTokenization(char) {
        return this.canTokenize(char) || char === "." || char >= "0" && char <= "9" || char === "-";
    }
}

IdentifierTokenizer.TYPE = "identifier";

class ParenthesisTokenizer extends Tokenizer {

    constructor() {
        super(ParenthesisTokenizer.TYPE);
    }

    canTokenize(char) {
        return char === "(" || char === ")";
    }

    tokenize(charStream) {
        return {
            value: charStream.next(),
            type : this._type
        };
    }
}

ParenthesisTokenizer.TYPE = "parenthesis";

class OperatorTokenizer extends Tokenizer {

    constructor() {
        super(OperatorTokenizer.TYPE);
    }

    canTokenize(char) {
        return char === "=";
    }
}

OperatorTokenizer.TYPE = "operator";

class TagOpeningTokenizer extends Tokenizer {
    constructor() {
        super("");
        this.__length = 0;
        this.__closing = false;
    }

    canTokenize(char) {
        this.__length = 0;
        return char === "<";
    }

    _canContinueTokenization(char) {
        this.__length++;
        this.__closing = char === "/";
        return this.__length < 2 && char === "<" || this.__length < 3 && this.__closing;
    }

    tokenize(charStream) {
        let value = super.tokenize(charStream);
        if (this.__closing) {
            return {
                value: value.value,
                type : TagOpeningTokenizer.TYPE.TAG_CLOSING_OPENNING
            };
        } else {
            return {
                value: value.value,
                type : TagOpeningTokenizer.TYPE.TAG_OPENNING
            };
        }
    }
}

TagOpeningTokenizer.TYPE = {TAG_OPENNING: "tag_opening", TAG_CLOSING_OPENNING: "tag_closing_opening"};

class TagClosingTokenizer extends Tokenizer {
    constructor() {
        super("");
        this.__self_closing = false;
        this.__length = 0;
    }

    canTokenize(char) {
        this.__length = 0;
        this.__self_closing = char === "/";
        return char === ">" || this.__self_closing;
    }

    _canContinueTokenization(char) {
        this.__length++;
        return char === ">" && this.__length < 2 || this.__self_closing && this.__length < 3;
    }

    tokenize(charStream) {
        let value = super.tokenize(charStream);
        if (this.__self_closing && value.value.length === 1) {
            throw new Error("Unexpected character '" + charStream.peek() + "'");
        }
        if (this.__self_closing) {
            return {
                value: value.value,
                type : TagClosingTokenizer.TYPE.TAG_SELF_CLOSING
            };
        } else {
            return {
                value: value.value,
                type : TagClosingTokenizer.TYPE.TAG_CLOSING
            };
        }
    }
}

TagClosingTokenizer.TYPE = {TAG_CLOSING: "tag_closing", TAG_SELF_CLOSING: "tag_self_closing"};

class QMarkTokenizer extends Tokenizer {
    constructor() {
        super(QMarkTokenizer.TYPE);
        this.__length = 0;
    }

    canTokenize(char) {
        this.__length = 0;
        return char === "?";
    }

    _canContinueTokenization() {
        this.__length++;
        return this.__length < 2;
    }
}

QMarkTokenizer.TYPE = "qmark";

module.exports = {
    StringTokenizer,
    NumberTokenizer,
    IdentifierTokenizer,
    OperatorTokenizer,
    ParenthesisTokenizer,
    WhitespaceTokenizer,
    TagOpeningTokenizer,
    TagClosingTokenizer,
    QMarkTokenizer
};