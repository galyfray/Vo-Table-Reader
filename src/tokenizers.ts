import {Tokenizer, StatefulTokenizer, type Token} from "./Tokenizer";
import type CharStream from "./CharStream";

export class StringTokenizer extends Tokenizer {
  protected readonly QUOTE: string;
  public static type: string = "string";

  public constructor(quote: string) {
    super(StringTokenizer.type);
    this.QUOTE = quote;
  }

  public canTokenize(char: string): boolean {
    return char === this.QUOTE;
  }

  protected canContinueTokenization(char: string): boolean {
    return !this.canTokenize(char);
  }

  public tokenize(char_stream: CharStream): Token {
    char_stream.next();
    const TOKEN: Token = super.tokenize(char_stream);
    char_stream.next();
    return TOKEN;
  }
}

export class WhitespaceTokenizer extends Tokenizer {
  public static type: string = "whitespace";

  public constructor() {
    super(WhitespaceTokenizer.type);
  }

  public override canTokenize(char: string): boolean {
    return char === " " || char === "\n" || char === "\t" || char === "\r";
  }
}

export class QMarkTokenizer extends Tokenizer {
  public static type: string = "qmark";

  public constructor() {
    super(QMarkTokenizer.type);
  }

  public override canTokenize(char: string): boolean {
    return char === "?";
  }

  public override tokenize(char_stream: CharStream): Token {
    return {
      value: char_stream.next() as string,
      type: this.TYPE
    };
  }
}

export class ParenthesisTokenizer extends Tokenizer {
  public static type: string = "parenthesis";

  public constructor() {
    super(ParenthesisTokenizer.type);
  }

  public override canTokenize(char: string): boolean {
    return char === "(" || char === ")";
  }

  public override tokenize(char_stream: CharStream): Token {
    return {
      value: char_stream.next() as string,
      type: this.TYPE
    };
  }
}

export class IdentifierTokenizer extends Tokenizer {
  public static type: string = "identifier";

  public constructor() {
    super(IdentifierTokenizer.type);
  }

  public override canTokenize(char: string): boolean {
    return (
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      char === "_"
    );
  }

  protected override canContinueTokenization(char: string): boolean {
    return (
      this.canTokenize(char) ||
      char === "." ||
      (char >= "0" && char <= "9") ||
      char === "-"
    );
  }
}

export class OperatorTokenizer extends Tokenizer {
  public static type: string = "operator";

  public constructor() {
    super(OperatorTokenizer.type);
  }

  public override canTokenize(char: string): boolean {
    return char === "=";
  }

  public override tokenize(char_stream: CharStream): Token {
    return {
      value: char_stream.next() as string,
      type: this.TYPE
    };
  }
}

export class NumberTokenizer extends StatefulTokenizer {
  protected isFloat: boolean;
  public static type = {INTEGER: "int", FLOAT: "float"};

  public constructor() {
    super();
    this.isFloat = false;
  }

  protected override getType(): string {
    return this.isFloat
      ? NumberTokenizer.type.FLOAT
      : NumberTokenizer.type.INTEGER;
  }

  public override canTokenize(char: string): boolean {
    this.isFloat = false;
    return char >= "0" && char <= "9";
  }

  protected override canContinueTokenization(char: string): boolean {
    // small trickery here : JS has boolean optimization meaning that the statement (this.isFloat = true)
    // will only be interpreted at the first encounter of a "."
    return (
      (char >= "0" && char <= "9") ||
      (char === "." && !this.isFloat && (this.isFloat = true))
    );
  }
}

export class TagOpeningTokenizer extends StatefulTokenizer {
  public static type = {
    TAG_OPENNING: "tag_opening",
    TAG_CLOSING_OPENNING: "tag_closing_opening"
  };
  protected isClosing: boolean;
  protected length: number;

  public constructor() {
    super();
    this.isClosing = false;
    this.length = 0;
  }

  public override canTokenize(char: string): boolean {
    this.length = 0;
    this.isClosing = false;
    return char === "<";
  }

  protected override canContinueTokenization(char: string): boolean {
    this.length++;
    // small trickery here : JS has boolean optimization meaning that the statement (this.isClosing = true)
    // will only be interpreted at the first encounter of a "/"
    return (
      (char === "<" && this.length < 2) ||
      (char === "/" && this.length < 3 && (this.isClosing = true))
    );
  }

  protected override getType(): string {
    return this.isClosing
      ? TagOpeningTokenizer.type.TAG_CLOSING_OPENNING
      : TagOpeningTokenizer.type.TAG_OPENNING;
  }
}

export class TagClosingTokenizer extends StatefulTokenizer {
  public static type = {
    TAG_CLOSING: "tag_closing",
    TAG_SELF_CLOSING: "tag_self_closing"
  };
  protected length: number;
  protected isSelfClosing: boolean;

  public constructor() {
    super();
    this.isSelfClosing = false;
    this.length = 0;
  }

  public canTokenize(char: string): boolean {
    this.length = 0;
    this.isSelfClosing = char === "/";
    return char === ">" || this.isSelfClosing;
  }

  protected canContinueTokenization(char: string): boolean {
    this.length++;
    return (
      (char === ">" && this.length < 2) ||
      (this.isSelfClosing && this.length < 3)
    );
  }

  protected override getType(): string {
    return this.isSelfClosing
      ? TagClosingTokenizer.type.TAG_SELF_CLOSING
      : TagClosingTokenizer.type.TAG_CLOSING;
  }
}
