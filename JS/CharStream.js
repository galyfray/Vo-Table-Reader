class CharStream {
    /**
     * This class represent a stream of characters extracted from a string.
     * @param {String} value the string to stream
     */
    constructor(value) {
        this.value = value;
        this.index = 0;
        this.line = 1;
        this.column = 1;
    }

    /**
     * Get the next character in the stream, return null if the stream is at the end.
     * this method consume the character. see {@link peek()} to get the next character without consuming it.
     * @returns {String} the next character in the stream or null if the stream is at the end.
    */
    next() {
        if (this.eof()) {
            return null;
        }
        const c = this.value[this.index];
        this.index++;
        if (c === "\n") {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        return c;
    }

    /**
     * Get the next character in the stream, return null if the stream is at the end.
     * this method does not consume the character. see {@link next()} to get the next character and consuming it.
     * @returns {String} the next character in the stream or null if the stream is at the end.
    */
    peek() {
        if (this.eof()) {
            return null;
        }
        return this.value[this.index];
    }

    /**
     * Check if the stream is at the end.
     * @returns {Boolean} true if the stream is at the end, false otherwise.
     */
    eof() {
        return this.index >= this.value.length;
    }

    /**
     * Get the current line number in the stream. The first line is 1.
     * @returns {Number} the line number of the current character in the stream.
     */
    getLine() {
        return this.line;
    }

    /**
     * Get the current column number in the stream. The first column is 1.
     * @returns {Number} the column number of the current character in the stream.
     */
    getColumn() {
        return this.column;
    }
}

module.exports = CharStream;