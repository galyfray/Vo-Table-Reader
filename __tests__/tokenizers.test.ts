import {
  StringTokenizer,
  WhitespaceTokenizer,
  QMarkTokenizer
} from "../src/tokenizers";
import CharStream from "../src/CharStream";

describe("Tokenizers unit tests", () => {
  test("StringTokenizer", () => {
    let stream = new CharStream("''");
    const TOKENIZER = new StringTokenizer("'");

    expect(TOKENIZER.canTokenize(stream.peek() as string)).toBe(true);
    expect(TOKENIZER.tokenize(stream).value.length).toBe(0);
    expect(stream.eof()).toBe(true);

    stream = new CharStream("'wobilily woo'");

    expect(TOKENIZER.tokenize(stream).value).toBe("wobilily woo");
    expect(stream.eof()).toBe(true);

    stream = new CharStream("'wobilily\" woo'");

    expect(TOKENIZER.tokenize(stream).value).toBe('wobilily" woo');
    expect(stream.eof()).toBe(true);

    stream = new CharStream("'wobilily\"''\" woo'");

    expect(TOKENIZER.tokenize(stream).value).toBe('wobilily"');
    expect(stream.eof()).toBe(false);
    expect(TOKENIZER.tokenize(stream).value).toBe('" woo');
    expect(stream.eof()).toBe(true);
  });

  test("WhitespaceTokenizer", () => {
    const STREAM = new CharStream("     \n \r\t");
    const TOKENIZER = new WhitespaceTokenizer();

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    expect(TOKENIZER.tokenize(STREAM).value).toBe("     \n \r\t");
    expect(STREAM.eof()).toBe(true);
  });

  test("QMarkTokenizer", () => {
    const STREAM = new CharStream("??");
    const TOKENIZER = new QMarkTokenizer();

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    expect(TOKENIZER.tokenize(STREAM).value).toBe("?");
    expect(STREAM.eof()).toBe(false);
  });
});
