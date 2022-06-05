if (typeof module !== "undefined") {
    var Tokenizer = require("./Tokenizer");
}

class StringTokenizer extends Tokenizer {

    constructor(quote = "'") {
        super("string");
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

class WhitespaceTokenizer extends Tokenizer {

    constructor() {
        super("whitespace");
    }

    canTokenize(char) {
        return char === " " || char === "\n" || char === "\t" || char === "\r";
    }
}

class NumberTokenizer extends Tokenizer {

    constructor() {
        super("int");
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
                type : "float"
            };
        } else {
            return {
                value: value.value,
                type : "int"
            };
        }
    }
}

class IdentifierTokenizer extends Tokenizer {

    constructor() {
        super("identifier");
    }

    canTokenize(char) {
        return char >= "a" && char <= "z" || char >= "A" && char <= "Z" || char === "_";
    }

    _canContinueTokenization(char) {
        return this.canTokenize(char) || char === "." || char >= "0" && char <= "9" || char === "-";
    }
}

class ParenthesisTokenizer extends Tokenizer {

    constructor() {
        super("parenthesis");
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

class OperatorTokenizer extends Tokenizer {

    constructor() {
        super("operator");
    }

    canTokenize(char) {
        return char === "=";
    }
}

class TagOpeningTokenizer extends Tokenizer {
    constructor() {
        super("tag_oppening");
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
        return {
            value: value.value,
            type : this.__closing ? "tag_closing_oppening" : this._type
        };
    }
}

class TagClosingTokenizer extends Tokenizer {
    constructor() {
        super("tag_closing");
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
        return {
            value: value.value,
            type : this.__self_closing ? "tag_self_closing" : this._type
        };
    }
}

class QMarkTokenizer extends Tokenizer {
    constructor() {
        super("qmark");
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