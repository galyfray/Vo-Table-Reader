import type CharStream from "./CharStream";

export interface Token {
  value: string;
  type: string;
}

export abstract class Tokenizer {
  protected readonly TYPE: string;

  /**
   * @param {string} type the type of the tokens that will be created
   */
  public constructor(type: string) {
    this.TYPE = type;
  }

  /**
   * This method check if the tokenizer can tokenize the stream starting from the given character.
   * @param {string} char the character to test
   * @returns {boolean} true if the tokenizer can tokenize from the character, false otherwise.
   */
  public abstract canTokenize(char: string): boolean;

  /**
   * This method check if the tokenizer can continue to tokenize the stream according to the next character.
   * by default this method return the result from {@link canTokenize}
   * @param {string} char the character to test
   * @returns {boolean} true if the tokenizer can continue tokenizing from the character, false otherwise.
   */
  protected canContinueTokenization(char: string): boolean {
    return this.canTokenize(char);
  }

  /**Private method.
   * Read the stream until the predicate is false.
   * @param {*} predicate the predicate used to determine if the function continue to read.
   * @returns {String} the string extracted from the stream.
   */
  protected static readWhile(
    char_stream: CharStream,
    predicate: (s: string) => boolean
  ): string {
    let result: string = "";
    while (!char_stream.eof() && predicate(char_stream.peek() as string)) {
      result += char_stream.next();
    }
    return result;
  }

  /**
   * This method tokenize the stream starting from the given character.
   * @param {charStream} char_stream the stream of characters to tokenize.
   * @returns {Token} the token extracted from the stream.
   */
  public tokenize(char_stream: CharStream): Token {
    return {
      value: Tokenizer.readWhile(char_stream, char =>
        this.canContinueTokenization(char)
      ),
      type: this.TYPE
    };
  }
}

/**
 * This class is more versatile version of the {@see Tokenizer} but does come at the cost of computational time.
 */
export abstract class StatefulTokenizer extends Tokenizer {
  public constructor() {
    super("");
  }

  protected abstract getType(): string;

  public override tokenize(char_stream: CharStream): Token {
    const TOKEN: Token = super.tokenize(char_stream);
    TOKEN.type = this.getType();
    return TOKEN;
  }
}
