import {
  StringTokenizer,
  WhitespaceTokenizer,
  QMarkTokenizer,
  ParenthesisTokenizer,
  IdentifierTokenizer,
  OperatorTokenizer,
  NumberTokenizer,
  TagOpeningTokenizer,
  TagClosingTokenizer
} from "../src/tokenizers";
import CharStream from "../src/CharStream";
import {type Token} from "../src/Tokenizer";

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

  test("ParenthesisTokenizer", () => {
    const STREAM = new CharStream("()");
    const TOKENIZER = new ParenthesisTokenizer();

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    expect(TOKENIZER.tokenize(STREAM).value).toBe("(");
    expect(STREAM.eof()).toBe(false);
    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    expect(TOKENIZER.tokenize(STREAM).value).toBe(")");
    expect(STREAM.eof()).toBe(true);
  });

  test("IdentifierTokenizer", () => {
    const STREAM = new CharStream("A8-. 8-. _.a98");
    const TOKENIZER = new IdentifierTokenizer();

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    expect(TOKENIZER.tokenize(STREAM).value).toBe("A8-.");
    expect(STREAM.eof()).toBe(false);
    expect(STREAM.next()).toBe(" ");

    expect(TOKENIZER.canTokenize(STREAM.next() as string)).toBe(false); // 8
    expect(TOKENIZER.canTokenize(STREAM.next() as string)).toBe(false); // -
    expect(TOKENIZER.canTokenize(STREAM.next() as string)).toBe(false); // .
    expect(TOKENIZER.canTokenize(STREAM.next() as string)).toBe(false); //

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    expect(TOKENIZER.tokenize(STREAM).value).toBe("_.a98");
    expect(STREAM.eof()).toBe(true);
  });

  test("OperatorTokenizer", () => {
    const STREAM = new CharStream("==");
    const TOKENIZER = new OperatorTokenizer();

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    expect(TOKENIZER.tokenize(STREAM).value).toBe("=");
    expect(STREAM.eof()).toBe(false);
  });

  test("NumberTokenizer", () => {
    const STREAM = new CharStream("8 123456789 8.888 88..0120");
    const TOKENIZER = new NumberTokenizer();

    let token: Token;

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    token = TOKENIZER.tokenize(STREAM);
    expect(token.value).toBe("8");
    expect(token.type).toBe(NumberTokenizer.type.INTEGER);
    expect(STREAM.eof()).toBe(false);
    expect(STREAM.next()).toBe(" ");

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    token = TOKENIZER.tokenize(STREAM);
    expect(token.value).toBe("123456789");
    expect(token.type).toBe(NumberTokenizer.type.INTEGER);
    expect(STREAM.eof()).toBe(false);
    expect(STREAM.next()).toBe(" ");

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    token = TOKENIZER.tokenize(STREAM);
    expect(token.value).toBe("8.888");
    expect(token.type).toBe(NumberTokenizer.type.FLOAT);
    expect(STREAM.eof()).toBe(false);
    expect(STREAM.next()).toBe(" ");

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    token = TOKENIZER.tokenize(STREAM);
    expect(token.value).toBe("88.");
    expect(token.type).toBe(NumberTokenizer.type.FLOAT);
    expect(STREAM.eof()).toBe(false);

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(false);
    expect(STREAM.next()).toBe(".");

    token = TOKENIZER.tokenize(STREAM);
    expect(token.value).toBe("0120");
    expect(token.type).toBe(NumberTokenizer.type.INTEGER);
    expect(STREAM.eof()).toBe(true);
  });

  test("TagOpeningTokenizer", () => {
    const STREAM = new CharStream("<</<</");
    const TOKENIZER = new TagOpeningTokenizer();
    let token: Token;

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    token = TOKENIZER.tokenize(STREAM);
    expect(token.value).toBe("<");
    expect(token.type).toBe(TagOpeningTokenizer.type.TAG_OPENNING);
    expect(STREAM.eof()).toBe(false);

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    token = TOKENIZER.tokenize(STREAM);
    expect(token.value).toBe("</");
    expect(token.type).toBe(TagOpeningTokenizer.type.TAG_CLOSING_OPENNING);
    expect(STREAM.eof()).toBe(false);

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    token = TOKENIZER.tokenize(STREAM);
    expect(token.value).toBe("<");
    expect(token.type).toBe(TagOpeningTokenizer.type.TAG_OPENNING);
    expect(STREAM.eof()).toBe(false);

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    token = TOKENIZER.tokenize(STREAM);
    expect(token.value).toBe("</");
    expect(token.type).toBe(TagOpeningTokenizer.type.TAG_CLOSING_OPENNING);
    expect(STREAM.eof()).toBe(true);
  });

  test("TagClosingTokenizer", () => {
    const STREAM = new CharStream(">/>>/>");
    const TOKENIZER = new TagClosingTokenizer();
    let token: Token;

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    token = TOKENIZER.tokenize(STREAM);
    expect(token.value).toBe(">");
    expect(token.type).toBe(TagClosingTokenizer.type.TAG_CLOSING);
    expect(STREAM.eof()).toBe(false);

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    token = TOKENIZER.tokenize(STREAM);
    expect(token.value).toBe("/>");
    expect(token.type).toBe(TagClosingTokenizer.type.TAG_SELF_CLOSING);
    expect(STREAM.eof()).toBe(false);

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    token = TOKENIZER.tokenize(STREAM);
    expect(token.value).toBe(">");
    expect(token.type).toBe(TagClosingTokenizer.type.TAG_CLOSING);
    expect(STREAM.eof()).toBe(false);

    expect(TOKENIZER.canTokenize(STREAM.peek() as string)).toBe(true);
    token = TOKENIZER.tokenize(STREAM);
    expect(token.value).toBe("/>");
    expect(token.type).toBe(TagClosingTokenizer.type.TAG_SELF_CLOSING);
    expect(STREAM.eof()).toBe(true);
  });
});
