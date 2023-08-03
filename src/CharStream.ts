class CharStream {
  private readonly VALUE: string;
  private index: number;
  private line: number;
  private column: number;

  /**
   * This class represent a stream of characters extracted from a string.
   * @param {String} value the string to stream
   */
  public constructor(value: string) {
    this.VALUE = value;
    this.index = 0;
    this.line = 1;
    this.column = 1;
  }

  /**
   * Get the next character in the stream, return null if the stream is at the end.
   * this method consume the character. see {@link peek()} to get the next character without consuming it.
   * @returns {String} the next character in the stream or null if the stream is at the end.
   */
  public next(): string | null {
    if (this.eof()) {
      return null;
    }
    const C: string = this.VALUE[this.index];
    this.index++;
    if (C === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return C;
  }

  /**
   * Get the next character in the stream, return null if the stream is at the end.
   * this method does not consume the character. see {@link next()} to get the next character and consuming it.
   * @returns {String} the next character in the stream or null if the stream is at the end.
   */
  public peek(): string | null {
    if (this.eof()) {
      return null;
    }
    return this.VALUE[this.index];
  }

  /**
   * Check if the stream is at the end.
   * @returns {Boolean} true if the stream is at the end, false otherwise.
   */
  public eof(): boolean {
    return this.index >= this.VALUE.length;
  }

  /**
   * Get the current line number in the stream. The first line is 1.
   * @returns {Number} the line number of the current character in the stream.
   */
  public getLine(): number {
    return this.line;
  }

  /**
   * Get the current column number in the stream. The first column is 1.
   * @returns {Number} the column number of the current character in the stream.
   */
  public getColumn(): number {
    return this.column;
  }
}

module.exports = CharStream;
