class TokenizingException extends Error {}

class TokenStream {

    /**
     * This class represent a stream of tokens extracted from a stream of character.
     * @param {charStream} charStream the stream of characters to tokenize.
     * @param {*} whitespacePredicate the predicate to use to determine if a character is a whitespace.
     * @param  {...any} tokenizers the tokenizers to use to tokenize the stream.
     */
    constructor(charStream, whitespacePredicate, ...tokenizers) {
        this.charStream = charStream;
        this.isWhitespace = whitespacePredicate;
        this.tokenizers = tokenizers;
        if (this.tokenizers === null) {
            throw new Error("tokenizers can't be null");
        }
        this._currentToken = null;
    }

    /**Private method.
     * Read the stream until the predicate is false.
     * @param {*} predicate the predicate used to determine if the function continue to read.
     */
    _readWhile(predicate) {
        while (!this.charStream.eof() && predicate(this.charStream.peek())) {
            this.charStream.next();
        }
    }

    /**
     * Get the next token in the stream, return null if the stream is at the end.
     * this method consume the token.
     * @returns {Token} the next token in the stream.
     */
    next(skipWhitespace = true) {
        if (this._currentToken !== null) {
            const token = this._currentToken;
            this._currentToken = null;
            return token;
        }

        if (skipWhitespace) {
            this._readWhile(this.isWhitespace);
        }

        if (this.charStream.eof()) {
            return null;
        }

        for (const tokenizer of this.tokenizers) {
            if (tokenizer.canTokenize(this.charStream.peek())) {
                return tokenizer.tokenize(this.charStream);
            }
        }

        throw new TokenizingException(`unable to tokenize character ${this.charStream.peek()}`);
    }

    peek(skipWhitespace = true) {
        return this._currentToken || (this._currentToken = this.next(skipWhitespace));
    }

    /**
     * Test if the stream is at the end.
     * @returns {Boolean} true if the stream is at the end, false otherwise.
     */
    eof() {
        return this.charStream.eof();
    }

}

module.exports = {TokenStream, TokenizingException};