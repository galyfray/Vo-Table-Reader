/* eslint-disable no-unused-vars */
// abstract class definition
class Tokenizer {

    /**
     * @param {string} type the type of the tokens that will be created
     */
    constructor(type) {
        this._type = type;
    }

    /**
     * This method check if the tokenizer can tokenize the stream starting from the given character.
     * @param {string} char the character to test
     * @returns {boolean} true if the tokenizer can tokenize from the character, false otherwise.
     */
    canTokenize(char) {
        throw new Error("tokenizer not implemented");
    }

    /**
     * This method check if the tokenizer can continue to tokenize the stream according to the next character.
     * by default this method return the result from {@link canTokenize}
     * @param {string} char the character to test
     * @returns {boolean} true if the tokenizer can continue tokenizing from the character, false otherwise.
     */
    _canContinueTokenization(char) {
        return this.canTokenize(char);
    }

    /**Private method.
    * Read the stream until the predicate is false.
    * @param {*} predicate the predicate used to determine if the function continue to read.
    * @returns {String} the string extracted from the stream.
    */
    _readWhile(charStream, predicate) {
        let result = "";
        while (!charStream.eof() && predicate(charStream.peek())) {
            result += charStream.next();
        }
        return result;
    }

    /**
     * @typedef {Object} Token
     * @property {String} value The value of the token.
     * @property {String} type The type of the token.
     */
    /**
     * This method tokenize the stream starting from the given character.
     * @param {charStream} charStream the stream of characters to tokenize.
     * @returns {Token} the token extracted from the stream.
    */
    tokenize(charStream) {
        return {
            value: this._readWhile(charStream, char => this._canContinueTokenization(char)),
            type : this._type
        };
    }
}

module.exports = Tokenizer;